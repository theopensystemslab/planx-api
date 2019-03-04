require("dotenv").config();

import * as cors from "cors";
import * as express from "express";
import { Request, Response } from "express";
import * as helmet from "helmet";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { AppRoutes } from "./routes";
import bodyParser = require("body-parser");

createConnection()
  .then(async () => {
    const app = express();
    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());

    AppRoutes.forEach(route => {
      app[route.method](
        route.path,
        (request: Request, response: Response, next: Function) => {
          route
            .action(request, response)
            .then(() => next)
            .catch(err => next(err));
        }
      );
    });

    const port = process.env.PORT || 3000;
    app.listen(port);

    console.log(`listening: http://127.0.0.1:${port}`);
  })
  .catch(error => console.error(error));
