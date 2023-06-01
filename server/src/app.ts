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

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? `https://${process.env.CLIENT_DOMAIN}`
        : "http://127.0.0.1:3000",
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
