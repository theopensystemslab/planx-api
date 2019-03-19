import { NextFunction, Request, Response } from 'express'
import { getManager } from 'typeorm'
import Flow from '../../db/entities/Flow'
import Team from '../../db/entities/Team'
import { RequestWithCurrentUser } from '../types'

export async function list(
  _request: Request,
  response: Response,
  next: NextFunction
) {
  const flowRespository = getManager().getRepository(Flow)
  const flows = await flowRespository.find()
  response.send(flows)
}

export async function create(
  request: RequestWithCurrentUser,
  response: Response,
  next: NextFunction
) {
  const flowRespository = getManager().getRepository(Flow)

  try {
    // await flowRespository.preload(request.body)
    // const newFlow = flowRespository.create(request.body)
    const newFlow = new Flow()
    newFlow.id = request.body.id
    newFlow.name = request.body.name && request.body.name.trim()
    newFlow.creator = request.user

    if (request.body['team.slug']) {
      newFlow.team = await getManager()
        .getRepository(Team)
        .findOneOrFail({ slug: request.body['team.slug'] })
    }
    await flowRespository.save(newFlow)
    response.send(newFlow)
  } catch (e) {
    next(e)
  }
}

export async function destroy(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const flowRespository = getManager().getRepository(Flow)
    const flow = await flowRespository.findOne(request.params.id)
    if (flow) {
      await flowRespository.delete(flow)
      response.send({ message: 'ok' })
    } else {
      next({
        status: 404,
        message: 'Not found',
        errors: [{ resource: 'Flow', code: 'missing' }],
      })
    }
  } catch (e) {
    next(e)
  }
}
