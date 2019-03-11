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
  team.slug = snakeCase(team.name)

  const errors = await validate(team)
  try {
    if (errors.length > 0) {
      next({ status: 422, message: errors.map(e => e.constraints) })
    } else {
      const created = await repository.save(team)
      response.send(created)
    }
  } catch (e) {
    next(e)
  }
}

export async function list(_request: Request, response: Response) {
  const respository = getManager().getRepository(Team)
  const teams = await respository.find()
  response.send(teams)
}
