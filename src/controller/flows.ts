import { Request, Response } from "express";
import { getManager } from "typeorm";
import { Flow } from "../entity/Flow";

export async function list(request: Request, response: Response) {
  const flowRespository = getManager().getRepository(Flow);
  const flows = await flowRespository.find();
  response.send(flows);
}

export async function create(request: Request, response: Response) {
  const flowRespository = getManager().getRepository(Flow);

  const newFlow = flowRespository.create(request.body);

  await flowRespository.save(newFlow);

  response.send(newFlow);
}
