import { Request, Response } from "express";
import { format } from "url";

export async function index(request: Request, response: Response) {
  const url = (path: string): string =>
    format({
      protocol: request.protocol,
      host: request.get("host"),
      pathname: path
    });

  response.send({ flows: url("flows") });
}
