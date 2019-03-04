import { Request, Response } from "express";
import { getManager } from "typeorm";
import { Flow } from "../entity/Flow";

export async function getAll(request: Request, response: Response) {
  const flowRespository = getManager().getRepository(Flow);
  // console.log({ flowRespository });
  const flows = await flowRespository.find();
  response.send(flows);
}
