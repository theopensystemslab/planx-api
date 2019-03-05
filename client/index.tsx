require("dotenv").config({ path: "../.env" });

import * as React from "react";
import { render } from "react-dom";
import * as ShareDB from "sharedb/lib/client";
import SocketAdapter from "./lib/socket_adapter";

const socketUrl = `ws://localhost:${process.env.SOCKET_API_PORT}`;
const socket = new SocketAdapter(socketUrl);
const connection = new ShareDB.Connection(socket);

const doc = connection.get("flows", 123);
console.log({ doc });

const App = () => <h1>APP</h1>;

render(<App />, document.getElementById("client"));
