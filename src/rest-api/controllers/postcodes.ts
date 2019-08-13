import axios from 'axios'
import { NextFunction, Request, Response } from 'express'
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

    if (localAuthority !== 'southwark') {
      return response.json({
        localAuthority,
        results: [],
      })
    }

    const url = `https://llpg.planx.uk/LLPG_ALL?limit=100&POSTALLY_ADDRESSABLE=eq.Y&POSTCODE=eq.${postcode}`

    const { data } = await axios.get(url)

    response.json({
      localAuthority,
      results: data
        .map(result => {
          const { x: longitude, y: latitude } = proj4.transform(
            projections.ordnanceSurvey,
            projections.standard,
            [Number(result.X), Number(result.Y)]
          )

          return {
            id: result.UPRN.toString(),
            name: [
              result.ORGANISATION,
              result.SAO,
              [result.PAO, result.STREET].filter(Boolean).join(' '),
            ]
              .filter(Boolean)
              .join(', '),
            uprn: result.UPRN.toString(),
            updrn: result.UPRN.toString(),
            x: Number(result.X),
            y: Number(result.Y),
            lat: longitude,
            lng: longitude,
            rawData: result,
          }
        })
        .sort((a, b) => {
          const aa = [a.rawData.PAO, a.rawData.STREET].filter(Boolean).join(' ')
          const bb = [b.rawData.PAO, b.rawData.STREET].filter(Boolean).join(' ')
          // return bb < aa
          return aa < bb ? -1 : aa > bb ? 1 : 0
        }),
    })
  } catch (e) {
    next(e)
  }
}
