import path from "path";
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

import express, { Express, Request, Response } from "express";
import { parseUser } from "./middlewares/parseUser";
import publicRoutes from "./routes/public";
import protectedRoutes from "./routes/protected";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

const app: Express = express();

const requestFilter = (req: Request, res: Response) => {
  if (req.url === "/refresh-token") {
    return true;
  }
  return false;
};

let whitelist = [`https://${process.env.CLIENT_DOMAIN}`, `https://www.${process.env.CLIENT_DOMAIN}`];

if (process.env.NODE_ENV === "development") {
  whitelist = [`http://127.0.0.1:3000`];
}

app.use(
  cors({
    origin: (origin: any, callback) => {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },

    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(
    morgan("dev", {
      skip: requestFilter,
    })
  );
}

app.use("/public", publicRoutes);
app.use("/protected", parseUser, protectedRoutes);

export default app;
