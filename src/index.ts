require('dotenv').config()

import { json, urlencoded } from 'body-parser'
import * as cors from 'cors'
import * as express from 'express'
import * as helmet from 'helmet'
import { Server } from 'http'
import { verify } from 'jsonwebtoken'
import * as methodOverride from 'method-override'
import 'reflect-metadata'
import * as ShareDB from 'sharedb'
import * as IO from 'socket.io'
import { createConnection } from 'typeorm'
import { signS3Upload } from './lib/s3'
import {
  clientErrorHandler,
  errorHandler,
  logErrors,
} from './rest-api/middlewares/error_handlers'
import routes from './rest-api/routes'
import PostgresDB from './websocket-api/db'
import JsonStream from './websocket-api/lib/json_stream'

const app = express()
app.use(cors())
app.use(helmet())
app.use(
  urlencoded({
    extended: true,
  })
)
app.use(json())
app.use('/v1/', routes)
app.use(methodOverride())
app.use(logErrors)
app.use(clientErrorHandler)
app.use(errorHandler)

const server = new Server(app)
const io = IO(server)

// sharedb/socket.io WebSockets API

const db = new PostgresDB({
  connectionString: process.env.DATABASE_URL,
  ssl: JSON.parse(process.env.DB_SSL),
})

const sharedb = ShareDB({
  db,
  disableDocAction: true,
  disableSpaceDelimitedActions: true,
})

io.on('connection', socket => {
  console.log(`new client connected: ${socket.client.id}`)

  let userId
  const stream = new JsonStream(socket, io)

  socket.on('authenticate', ({ token }) => {
    console.log(`authenticating ${socket.client.id}`)

    setTimeout(() => {
      if (!userId) {
        console.log(
          `booting ${
            socket.client.id
          } because they've not authenticated in time`
        )
        socket.disconnect(true)
      }
    }, 1000)

    verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error(err)
        socket.emit('logout')
      } else {
        try {
          userId = decoded.id
          sharedb.listen(stream, { userId })
          console.log('authorized user connected', {
            userId,
            client: socket.client.id,
          })
        } catch (err) {
          console.error(err)
          socket.emit('logout')
        }
      }
    })
  })

  socket.on('signS3Upload', (params, callback) => {
    signS3Upload(params.filename, params.filetype, data => {
      callback(data)
    })
  })

  socket.on('join', (params, callback) => {
    socket.join(params.room)
    // stream.setRoom(params.room);
    console.log(`${userId}  joined room  ${params.room}`)
    callback()
  })

  socket.on('leave', (params, callback) => {
    socket.leave(params.room)
    // stream.setRoom(null);
    console.log(`${userId}  left room  ${params.room}`)
    callback()
  })

  socket.on('disconnect', () => {
    console.log(`client disconnected: ${socket.client.id}`)
    // console.log("user left", { userId });
  })
})

// typeorm/express REST API

createConnection()
  .then(async () => {
    const { PORT, HOST } = process.env
    server.listen(PORT)

    console.log(`express and socket.io listening on: ${HOST}:${PORT}`)
  })
  .catch(error => console.error(error))
