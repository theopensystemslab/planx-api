import { validate } from 'class-validator'
import { Request, Response } from 'express'
import { snakeCase } from 'lodash'
import { getManager } from 'typeorm'
import Team from '../../db/entities/Team'

export async function create(request: Request, response: Response) {
  const repository = getManager().getRepository(Team)

  const team = new Team()
  team.name = request.body.name.trim()
  team.slug = snakeCase(team.name)

  const errors = await validate(team)

  if (errors.length > 0) {
    response.status(422)
    response.send({ errors })
  } else {
    const created = await repository.save(team)
    response.send(created)
  }
}
