require("dotenv").config({ path: "../.env" });

import * as React from "react";
import { render } from "react-dom";
import * as ShareDB from "sharedb/lib/client";
import UserForm from "./components/UserForm";
import SocketAdapter from "./lib/socket_adapter";

const socketUrl = `ws://localhost:${process.env.SOCKET_API_PORT}`;
const socket = new SocketAdapter(socketUrl);
const connection = new ShareDB.Connection(socket);

const doc = connection.get("flows", 123);
console.log({ doc });

const App = () => (
  <div>
    <p>working log in and sign up forms, (watch your console)</p>
    <UserForm text="Log in" url="http://localhost:3001/auth/login" />
    <UserForm text="Sign up" url="http://localhost:3001/users" />
  </div>
);

render(<App />, document.getElementById("client"));
