require("dotenv").config();

import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entity/User";

createConnection()
  .then(async connection => {
    console.log("Inserting a new user into the database...");
    // const user = new User();
    // user.username = "john";
    // user.passwordHash = "john";
    // await connection.manager.save(user);
    // console.log("Saved a new user with id: " + user.id);

    console.log("Loading users from the database...");
    const users = await connection.manager.find(User);
    console.log("Loaded users: ", users);
    // await connection.manager.find(Flow);
    // await connection.manager.find(Team);

    console.log("Here you can setup and run express/koa/any other framework.");
  })
  .catch(error => console.log(error));
