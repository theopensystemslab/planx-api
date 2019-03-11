import { validate } from 'class-validator'
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

  try {
    // const user = userRepository.create(request.body);
    const user = new User()
    user.username = request.body.username
    user.password = request.body.password

    if (await userRepository.findOne({ username: user.username })) {
      next({
        status: 422,
        errors: [
          {
            resource: 'User',
            field: 'username',
            code: 'already_exists',
          },
        ],
      })
    }

    const errors = await validate(user)

    if (errors.length > 0) {
      next({
        status: 422,
        errors: errors.map(e => ({
          resource: 'User',
          field: e.property,
          code: 'invalid',
          reasons: e.constraints,
        })),
      })
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
  } catch (e) {
    next(e)
  }
}
