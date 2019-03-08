import { Request, Response } from 'express'
import { getManager } from 'typeorm'
import Flow from '../../db/entities/Flow'

export async function list(_request: Request, response: Response) {
  const flowRespository = getManager().getRepository(Flow)
  const flows = await flowRespository.find()
  response.send(flows)
}

export async function create(request: Request, response: Response) {
  const flowRespository = getManager().getRepository(Flow)

  const newFlow = flowRespository.create(request.body)

  await flowRespository.save(newFlow)

  response.send(newFlow)
}

export async function destroy(request: Request, response: Response) {
  const flowRespository = getManager().getRepository(Flow)

  const flow = await flowRespository.findOne(request.params.id)

  await flowRespository.delete(flow)

  response.send(flow)
}
