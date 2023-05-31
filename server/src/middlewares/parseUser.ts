import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthorizedRequest } from "../utils/types";

export const parseUser = (req: Request, res: Response, next: NextFunction) => {
  const mReq = req as AuthorizedRequest;

  try {
    const accessToken: any = req.headers.authorization;
    if (accessToken) {
      const userDetails = jwt.verify(accessToken, process.env.AUTH_TOKEN_SECRET!);
      mReq.user = {
        // @ts-ignore
        id: userDetails.id,
      };

      next();
    } else {
      res.status(401).json({ message: "Invalid token provided." }).end();
    }
  } catch (error: any) {
    res.status(401).json({ message: "You are not authorized." }).end();
  }
};
