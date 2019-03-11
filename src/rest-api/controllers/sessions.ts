import { compareSync } from 'bcryptjs'
import { NextFunction, Request, Response } from 'express'
import { sign } from 'jsonwebtoken'
import { getManager } from 'typeorm'
import User from '../../db/entities/User'

export async function create(
  request: Request,
  response: Response,
  next: NextFunction
) {
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
      next({
        status: 401,
        message: 'incorrect password',
        errors: [{ resource: 'User', code: 'invalid' }],
      })
    }
  } else {
    next({
      status: 404,
      message: 'user not found',
      errors: [{ resource: 'User', code: 'missing' }],
    })
  }
}
