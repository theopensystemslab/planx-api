import { validate } from 'class-validator'
import { NextFunction, Request, Response } from 'express'
import { snakeCase } from 'lodash'
import { getManager } from 'typeorm'
import Team from '../../db/entities/Team'

export async function create(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const repository = getManager().getRepository(Team)

  const team = new Team()
  team.name = request.body.name.trim()
  team.slug = request.body.slug
    ? request.body.slug.toLowerCase()
    : snakeCase(team.name)

  if (await repository.findOne({ slug: team.slug })) {
    next({
      status: 422,
      errors: [
        {
          resource: 'Team',
          field: 'slug',
          code: 'already_exists',
        },
      ],
    })
  }

  const errors = await validate(team)
  try {
    if (errors.length > 0) {
      next({
        status: 422,
        errors: errors.map(e => ({
          resource: 'Team',
          field: e.property,
          code: 'invalid',
          reasons: e.constraints,
        })),
      })
    } else {
      const created = await repository.save(team)
      response.send(created)
    }
  } catch (e) {
    console.log({ e })
    next(e)
  }
}

export async function list(_request: Request, response: Response) {
  const respository = getManager().getRepository(Team)
  const teams = await respository.find()
  response.send(teams)
}
