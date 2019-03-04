require("dotenv").config();

import * as cors from "cors";
import * as express from "express";
import * as helmet from "helmet";
import "reflect-metadata";
import { createConnection } from "typeorm";
import routes from "./routes";
import bodyParser = require("body-parser");

createConnection()
  .then(async () => {
    const app = express();
    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());

    app.use("/", routes);

    const port = process.env.PORT || 3000;
    app.listen(port);

    console.log(`listening: http://127.0.0.1:${port}`);
  })
  .catch(error => console.error(error));
