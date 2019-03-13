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
  const errors = []

  if (!request.body.username) {
    errors.push({ resource: 'User', code: 'missing_field', field: 'username' })
  }
  if (!request.body.password) {
    errors.push({ resource: 'User', code: 'missing_field', field: 'password' })
  }
  if (errors.length > 0) {
    return next({ errors, status: 422, message: 'Missing field(s)' })
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
      return next({
        status: 401,
        message: 'incorrect password',
        errors: [{ resource: 'User', code: 'invalid' }],
      })
    }
  } else {
    return next({
      status: 404,
      message: 'user not found',
      errors: [{ resource: 'User', code: 'missing' }],
    })
  }
}
