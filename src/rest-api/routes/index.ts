import { Router } from 'express'
import * as jwt from 'express-jwt'
import * as Flows from '../controllers/flows'
import * as Home from '../controllers/home'
import * as Sessions from '../controllers/sessions'
import * as Teams from '../controllers/teams'
import * as Users from '../controllers/users'

const routes = Router()

const homeRouter = Router()
homeRouter.get('/', Home.index)
routes.use('/', homeRouter)

const sessionsRouter = Router()
sessionsRouter.post('/login', Sessions.create)
routes.use('/auth', sessionsRouter)

const flowsRouter = Router()
flowsRouter.get('/', Flows.list)
flowsRouter.post('/', Flows.create)
flowsRouter.delete('/:id', Flows.destroy)
routes.use('/flows', jwt({ secret: process.env.JWT_SECRET }), flowsRouter)

const usersRouter = Router()
usersRouter.post('/', Users.create)
routes.use('/users', usersRouter)

const teamsRouter = Router()
teamsRouter.get('/', Teams.list)
teamsRouter.post('/', Teams.create)
routes.use('/teams', jwt({ secret: process.env.JWT_SECRET }), teamsRouter)

const errorRouter = Router()
routes.use(
  '/error',
  errorRouter.get('/', async (req, res, next) => {
    next('ERROR CATCHING WORKS')
  }),
  errorRouter.get('/:statusCode', async (req, res, next) => {
    next({
      status: req.params.statusCode,
      message: `ERROR CATCHING WORKS (HTTP Status: ${req.params.statusCode})`,
    })
  })
)

export default routes
