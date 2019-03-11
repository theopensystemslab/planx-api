import { NextFunction, Request, Response } from 'express'
import { getManager } from 'typeorm'
import Flow from '../../db/entities/Flow'

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
  request: Request,
  response: Response,
  next: NextFunction
) {
  const flowRespository = getManager().getRepository(Flow)

  try {
    const newFlow = flowRespository.create(request.body)
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
    await flowRespository.delete(flow)
    response.send(flow)
  } catch (e) {
    next(e)
  }
}
