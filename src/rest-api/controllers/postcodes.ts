import axios from 'axios'
import { NextFunction, Request, Response } from 'express'
import * as get from 'lodash/get'

const { OS_API_KEY } = process.env

export async function search(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const { postcode, srs = 'WGS84' } = request.params

  const url = `https://api.ordnancesurvey.co.uk/places/v1/addresses/postcode?postcode=${postcode}&key=${OS_API_KEY}&output_srs=${srs}`

  try {
    const { data } = await axios.get(url)

    response.json({
      localAuthority: get(
        data,
        'results[0].DPA.LOCAL_CUSTODIAN_CODE_DESCRIPTION',
        'unknown'
      ).toLowerCase(),
      results: data.results.map(({ DPA: result }) => {
        // console.log(result)
        return {
          id: result.UPDRN || result.UPRN,
          name: result.ADDRESS.split(',')
            .slice(0, -1)
            .join(','),
          uprn: result.UPRN,
          updrn: result.UPDRN,
          x: result.X_COORDINATE,
          y: result.Y_COORDINATE,
          lat: result.LAT,
          lng: result.LNG,
          rawData: result,
        }
      }),
    })
  } catch (e) {
    next(e)
  }
}
