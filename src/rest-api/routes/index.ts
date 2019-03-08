import { Router } from 'express'
import * as Flows from '../controllers/flows'
import * as Home from '../controllers/home'
import * as Sessions from '../controllers/sessions'
import * as Users from '../controllers/users'
import { checkJwt } from '../middlewares/checkJwt'

const routes = Router()

const homeRouter = Router()
homeRouter.get('/', Home.index)
routes.use('/', homeRouter)

const sessionsRouter = Router()
sessionsRouter.post('/login', Sessions.create)
routes.use('/auth', sessionsRouter)

const flowsRouter = Router()
flowsRouter.get('/', [checkJwt], Flows.list)
flowsRouter.post('/', [checkJwt], Flows.create)
flowsRouter.get('/:id', [checkJwt], Flows.destroy)
routes.use('/flows', flowsRouter)

const usersRouter = Router()
usersRouter.post('/', Users.create)
routes.use('/users', usersRouter)

export default routes
