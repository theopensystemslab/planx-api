import axios from 'axios'
import { NextFunction, Request, Response } from 'express'
import * as naturalSort from 'javascript-natural-sort'
import * as groupBy from 'lodash/groupBy'
import * as proj4 from 'proj4'

proj4.defs([
  ['WGS84', '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs'],
  [
    'EPSG:27700',
    '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs',
  ],
])

const projections = {
  standard: new proj4.Proj('WGS84'),
  ordnanceSurvey: new proj4.Proj('EPSG:27700'),
}

export async function search(
  request: Request,
  response: Response,
  next: NextFunction
) {
  // const postcode = await formatPostcode(request.params.postcode)

  try {
    const { data: pdata } = await axios.get(
      `https://api.postcodes.io/postcodes/${request.params.postcode}`
    )

    const postcode = pdata.result.postcode

    const localAuthority = pdata.result.admin_district.toLowerCase()

    if (localAuthority === 'canterbury') {
      const tokenData = await axios({
        method: 'post',
        url: 'https://mapping.canterbury.gov.uk/arcgis/tokens/generateToken',
        data: `username=${encodeURIComponent(
          process.env.CANTERBURY_USERNAME
        )}&password=${encodeURIComponent(process.env.CANTERBURY_PASSWORD)}`,
      })
      const token = tokenData.data
      let url = `https://mapping.canterbury.gov.uk/arcgis/rest/services/PlanX/LLPG_Point_Data/MapServer/find`
      console.log(url)

      const params = {
        token,
        searchText: postcode,
        searchFields: 'POSTCODE',
        layers: 'LLPG_Point_Data',
        f: 'pjson',
      }
      url = [
        url,
        Object.keys(params)
          .map(key => `${key}=${escape(params[key])}`)
          .join('&'),
      ].join('?')

      const { data } = await axios.get(url)

      const output = {
        localAuthority: 'canterbury',
        results: data.results.map(result => ({
          id: result.attributes.UPRN.toString(),
          name: result.attributes.FULL_ADDRESS.split(',')
            .slice(0, -3)
            .join(','),
          uprn: result.attributes.UPRN,
          updrn: result.attributes.UPRN,
          x: result.geometry.x,
          y: result.geometry.y,
          lat: null,
          lng: null,
          rawData: {
            UPRN: result.attributes.UPRN,
            team: 'canterbury',
            organisation: result.attributes.ORGANISATION,
            sao: result.attributes.SAO_DESC,
            pao: result.attributes.PAO_DESC,
            street: result.attributes.STREET_NAME,
            town: result.attributes.TOWN_NAME,
            postcode: result.attributes.POSTCODE,
            blpu_code: null,
            planx_description: null,
            planx_value: null,
            x: result.geometry.x,
            y: result.geometry.y,
          },
        })),
      }
      return output
    }

    if (!['southwark', 'wycombe', 'lambeth'].includes(localAuthority)) {
      return response.json({
        localAuthority,
        results: [],
      })
    }

    const url = `https://llpg.planx.uk/addresses?limit=100&postcode=eq.${postcode}`
    console.log({ url })

    const { data } = await axios.get(url)

    const results0 = data.map(result => {
      const { x: longitude, y: latitude } = proj4.transform(
        projections.ordnanceSurvey,
        projections.standard,
        [Number(result.x), Number(result.y)]
      )

      return {
        id: result.UPRN.toString(),
        name: [
          result.organisation,
          result.sao,
          [result.pao, result.street].filter(Boolean).join(' '),
        ]
          .filter(Boolean)
          .join(', '),
        uprn: result.UPRN.toString(),
        updrn: result.UPRN.toString(),
        x: Number(result.x),
        y: Number(result.y),
        lat: latitude,
        lng: longitude,
        rawData: result,
      }
    })

    const results1 = groupBy(results0, r => {
      return [r.rawData.pao, r.rawData.street].filter(Boolean).join(' ')
    })

    const results = []

    Object.keys(results1)
      .sort(naturalSort)
      .forEach(k => {
        Object.values(results1[k])
          .sort((a: any, b: any) => {
            return naturalSort(a.rawData.sao, b.rawData.sao)
          })
          .forEach(sorted => results.push(sorted))
      })

    response.json({
      localAuthority,
      results,
    })
  } catch (e) {
    next(e)
  }
}
