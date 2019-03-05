require("dotenv").config({ path: "../.env" });

import * as React from "react";
import { render } from "react-dom";
import SocketAdapter from "./socket_adapter";

new SocketAdapter(`ws://localhost:${process.env.SOCKET_API_PORT}`);

const App = () => <h1>APP</h1>;

render(<App />, document.getElementById("client"));
