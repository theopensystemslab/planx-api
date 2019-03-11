import { compareSync } from 'bcryptjs'
import { Request, Response } from 'express'
import { sign } from 'jsonwebtoken'
import { getManager } from 'typeorm'
import User from '../../db/entities/User'

export async function create(request: Request, response: Response) {
  const userRepository = getManager().getRepository(User)

  if (!request.body.username || !request.body.password) {
    response.status(422)
    return response.send({ error: 'missing username and/or password' })
  }

  const user = await userRepository
    .createQueryBuilder('user')
    .where({
      username: request.body.username,
    })
    .leftJoinAndSelect('user.team', 'team')
    .getOne()

  if (user) {
    if (compareSync(request.body.password, user.password)) {
      const userData = {
        id: user.id,
        username: user.username,
        team: user.team,
      }

      const token = sign(userData, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      })

      response.send({
        ...userData,
        token,
      })
    } else {
      response.status(401)
      response.send({ error: 'incorrect password' })
    }
  } else {
    response.status(404)
    response.send({ error: 'user not found' })
  }
}
