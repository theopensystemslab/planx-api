import { NextFunction, Request, Response } from 'express'

export const clientErrorHandler = (
  err,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.xhr) {
    res.status(err.status || 500).send({ error: 'Something failed!' })
  } else {
    next(err)
  }
}

type ErrorType = {
  message: string
  errors?: [any]
}

export const errorHandler = (
  err,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err)
  }
  res.status(err.status || 500)

  let message = err.message
  if (typeof err === 'string') message = err

  const errObject: ErrorType = { message }
  if (err.errors) errObject.errors = err.errors
  res.send(errObject)
}

export function logErrors(
  err,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log({ ERROR: err })
  next(err)
}
