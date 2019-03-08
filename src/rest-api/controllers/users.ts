import { validate } from 'class-validator'
import { Request, Response } from 'express'
import { sign } from 'jsonwebtoken'
import { getManager } from 'typeorm'
import User from '../../db/entities/User'

export async function create(request: Request, response: Response) {
  const userRepository = getManager().getRepository(User)

  // const user = userRepository.create(request.body);
  const user = new User()
  user.username = request.body.username
  user.password = request.body.password

  const errors = await validate(user)

  if (errors.length > 0) {
    response.status(422)
    response.send({ errors })
  } else {
    const createdUser = await userRepository.save(user)

    const userData = {
      id: createdUser.id,
      username: createdUser.username,
    }

    const token = sign(userData, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })

    response.send({
      ...userData,
      token,
    })
  }
}
