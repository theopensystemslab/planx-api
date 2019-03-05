require("dotenv").config();

import { json } from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as helmet from "helmet";
import "reflect-metadata";
import * as ShareDB from "sharedb";
import * as IO from "socket.io";
import { createConnection } from "typeorm";
import PostgresDB from "./db";
import routes from "./routes";

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
  console.log({ socket });
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
