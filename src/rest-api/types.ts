import { Request } from 'express'

export interface RequestWithCurrentUser extends Request {
  user: any
}
