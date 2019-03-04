import { validate } from "class-validator";
import { Request, Response } from "express";
import { getManager } from "typeorm";
import { User } from "../entity/User";

export async function create(request: Request, response: Response) {
  const userRepository = getManager().getRepository(User);

  const user = userRepository.create(request.body);

  const errors = await validate(user);

  if (errors.length > 0) {
    response.status(422);
    response.send({ errors });
  } else {
    await userRepository.save(user);

    // const userData = { id: u.id, username: u.username };

    response.send(user);
  }
}
