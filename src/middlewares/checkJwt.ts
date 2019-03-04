import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

function getToken(req: Request): string | null {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    // Authorization: Bearer g1jipjgi1ifjioj
    // Handle token presented as a Bearer token in the Authorization header
    return req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    // Handle token presented as URI param
    return req.query.token;
  } else if (req.cookies && req.cookies.token) {
    // Handle token presented as a cookie parameter
    return req.cookies.token;
  }
  // If we return null, we couldn't find a token.
  // In this case, the JWT middleware will return a 401 (unauthorized) to the client for this request
  return null;
}

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  const token = getToken(req);

  console.log({ token });

  let jwtPayload;

  try {
    jwtPayload = <any>jwt.verify(token, process.env.JWT_SECRET);
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    //If token is not valid, respond with 401 (unauthorized)
    res.status(401).send();
    return;
  }

  // The token is valid for 1 hour
  // We want to send a new token on every request
  const { id, username } = jwtPayload;
  const newToken = jwt.sign({ id, username }, process.env.JWT_SECRET, {
    expiresIn: "1h"
  });
  res.setHeader("token", newToken);

  //Call the next middleware or controller
  next();
};
