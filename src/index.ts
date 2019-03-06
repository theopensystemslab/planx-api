require("dotenv").config();

import { json } from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as helmet from "helmet";
import { verify } from "jsonwebtoken";
import "reflect-metadata";
import * as ShareDB from "sharedb";
import * as IO from "socket.io";
import { createConnection } from "typeorm";
import routes from "./rest-api/routes";
import PostgresDB from "./websocket-api/db";
import JsonStream from "./websocket-api/lib/json_stream";

// sharedb/socket.io WebSockets API

const db = new PostgresDB({
  connectionString: process.env.DB_URI,
  ssl: JSON.parse(process.env.DB_SSL)
});

const sharedb = ShareDB({
  db,
  disableDocAction: true,
  disableSpaceDelimitedActions: true
});

console.log("set up sharedb");

const WS_PORT = process.env.SOCKET_API_PORT || 5000;
const io = IO(WS_PORT, {
  serveClient: false
});

io.on("connection", function(socket) {
  console.log(`new client connected: ${socket.client.id}`);

  let userId;
  let stream = new JsonStream(socket, io);

  socket.on("authenticate", function({ token }) {
    verify(token, process.env.JWT_SECRET, function(err, decoded) {
      if (err) {
        console.error(err);
        socket.emit("logout");
      } else {
        try {
          userId = decoded.id;
          sharedb.listen(stream, { userId });
          // console.log("authorized user connected", { userId });
        } catch (err) {
          console.error(err);
          socket.emit("logout");
        }
      }
    });
  });

  setTimeout(function() {
    if (!userId) {
      console.log(
        `booting ${socket.client.id} because they've not authenticated in time`
      );
      socket.disconnect(true);
    }
  }, 1000);

  // socket.on("signS3Upload", (params, callback) => {
  //   signS3Upload(params.filename, params.filetype, data => {
  //     callback(data);
  //   });
  // });

  socket.on("join", (params, callback) => {
    socket.join(params.room);
    // stream.setRoom(params.room);
    console.log(userId + " joined room " + params.room);
    callback();
  });

  socket.on("leave", (params, callback) => {
    socket.leave(params.room);
    // stream.setRoom(null);
    console.log(userId + " left room " + params.room);
    callback();
  });

  socket.on("disconnect", function() {
    console.log(`client disconnected: ${socket.client.id}`);
    // console.log("user left", { userId });
  });
});

console.log(`socket.io listening on: ws://127.0.0.1:${WS_PORT}`);

// typeorm/express REST API

createConnection()
  .then(async () => {
    const app = express();
    app.use(cors());
    app.use(helmet());
    app.use(json());

    app.use("/", routes);

    const PORT = process.env.REST_API_PORT || 5001;
    app.listen(PORT);

    console.log(`express listening on: http://127.0.0.1:${PORT}`);
  })
  .catch(error => console.error(error));
