import axios from "axios";
import { flow, types } from "mobx-state-tree";
import * as ShareDB from "sharedb/lib/client";
import SocketAdapter from "../lib/socket_adapter";

const socketUrl = `ws://localhost:${process.env.SOCKET_API_PORT}`;

const Auth = types
  .model("Auth", {
    jwt: types.maybe(types.string),
    username: types.maybe(types.string)
  })
  .views(self => ({
    get loggedIn(): Boolean {
      return self.jwt !== undefined;
    }
  }))
  .actions(self => {
    let socket;
    let connection;

    const login = flow(function*(username, password) {
      // const { REST_API_PORT } = process.env;
      // const url = `http://localhost:${REST_API_PORT}/${this.props.endpoint}`;
      // const req = await axios.post(url, this.state);
      // console.log(req.data);
      const response = yield axios.post(
        `http://localhost:${process.env.REST_API_PORT}/auth/login`,
        {
          username,
          password
        }
      );
      self.username = username;
      self.jwt = response.data.token;
      console.log({ self });

      socket = new SocketAdapter(socketUrl, self);
      connection = new ShareDB.Connection(socket);

      // const doc = connection.get("flows", "f6d07575-01b4-499c-b475-898ec7aff4d0");
      // doc.fetch(function(err) {
      //   if (err) {
      //     console.error({ err });
      //   } else if (doc.data === undefined) {
      //     doc.create({ hello: "world" }, err => {
      //       if (err) {
      //         console.error({ err });
      //       } else {
      //         console.log("created doc");
      //       }
      //     });
      //   } else {
      //     console.log("received doc", doc.data);
      //   }
      // });
    });

    const signup = flow(function*(username, password) {
      const response = yield axios.post(
        `http://localhost:${process.env.REST_API_PORT}/users`,
        {
          username,
          password
        }
      );
      self.username = username;
      self.jwt = response.data.token;
    });

    return {
      login,

      signup,

      // afterCreate() {
      //   const jwt = localStorage.getItem("jwt")
      //   if (jwt) self.jwt = jwt
      //   const username = localStorage.getItem("username")
      //   if (username) self.username = username
      // },

      logout() {
        // localStorage.removeItem("jwt")
        // localStorage.removeItem("username")
        socket.close();
        self.jwt = undefined;
        self.username = undefined;
      }
    };
  });

export default Auth;
