import axios from 'axios'
import { NextFunction, Request, Response } from 'express'
import * as get from 'lodash/get'

export async function search(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const url = `https://api.ideal-postcodes.co.uk/v1/postcodes/${
    request.params.postcode
  }?api_key=${process.env.IDEAL_POSTCODES_KEY}`

  try {
    const { data } = await axios.get(url)

    response.json({
      localAuthority: get(data, 'result[0].district', 'unknown')
        .toLowerCase()
        .replace(' ', ''),
      results: data.result.map(result => {
        return {
          id: result.udprn.toString(),
          name: [result.line_1, result.line_2].filter(Boolean).join(', '),
          uprn: result.udprn.toString(),
          updrn: result.udprn.toString(),
          x: result.eastings,
          y: result.northings,
          lat: result.latitude,
          lng: result.longitude,
          rawData: result,
        }
      }),
    })
  } catch (e) {
    next(e)
  }
}
