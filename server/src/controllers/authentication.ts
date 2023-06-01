import { Request, Response } from "express";
import { prisma } from "../db/connection";
import {
  errorCode,
  DatabaseConflictException,
  InvalidRequestException,
  NotAuthorizedException,
} from "../utils/exceptions";
import { validateLogin, validateRegister } from "../utils/validation";
import { RegisterFields } from "../utils/types";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const createNewSession = async (res: Response, userId: number): Promise<string> => {
  const refreshToken = jwt.sign({}, process.env.AUTH_TOKEN_SECRET!);
  res.cookie("refreshToken", refreshToken, {
    domain: process.env.NODE_ENV === "production" ? process.env.CLIENT_DOMAIN : "127.0.0.1",
    httpOnly: true,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7 * 365 * 10,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  const accessToken = jwt.sign({ id: userId }, process.env.AUTH_TOKEN_SECRET!, {
    expiresIn: "30s",
    algorithm: "HS256",
  });

  await prisma.session.create({
    data: {
      userId,
      refreshToken,
    },
  });
  return accessToken;
};

const loginWithDefault = async (req: Request, res: Response) => {
  const routeFields: { email: string; password: string } = req.body;

  try {
    validateLogin(routeFields);
    const user = await prisma.user.findFirst({
      where: {
        email: routeFields.email,
      },
    });

    if (user) {
      if (await bcrypt.compare(routeFields.password, user.password)) {
        const accessToken = await createNewSession(res, user.id);
        res.status(200).json({ accessToken }).end();
      } else {
        throw new InvalidRequestException("Invalid username or password");
      }
    } else {
      throw new InvalidRequestException("Invalid username or password");
    }
  } catch (error: any) {
    res.status(errorCode(error)).json(error.message).end();
  }
};

// FIX: Potential DB Trigger applied
const registerWithDefault = async (req: Request, res: Response) => {
  const routeFields: RegisterFields = req.body;

  try {
    validateRegister(routeFields);
    const registered = !!(await prisma.user.findFirst({
      where: {
        email: routeFields.email,
        type: "default",
      },
    }));
    if (registered) throw new DatabaseConflictException("Account already exists!");

    const { id } = await prisma.user.create({
      data: {
        email: routeFields.email,
        firstName: routeFields.firstName,
        lastName: routeFields.lastName,
        password: await bcrypt.hash(routeFields.password, 10),
        dob: new Date(routeFields.dob),
        type: "default",
      },
    });
    await prisma.profile.create({
      data: {
        userId: id,
        profilePicture: `https://ui-avatars.com/api/?name=${routeFields.firstName}+${routeFields.lastName}&length=2`,
        bio: "",
      },
    });

    const accessToken = await createNewSession(res, id);
    res.status(201).json({ accessToken }).end();
  } catch (error: any) {
    res.status(errorCode(error)).json(error.message).end();
  }
};

const loginWithGoogle = (req: Request, res: Response) => {};

const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    if (!refreshToken) throw new NotAuthorizedException("Please login and try again.");

    const validRefreshToken = jwt.verify(refreshToken!, process.env.AUTH_TOKEN_SECRET!);
    if (!validRefreshToken) throw new NotAuthorizedException("Please login and try again.");

    const currentSession = await prisma.session.findUnique({ where: { refreshToken } });
    if (!currentSession) throw new NotAuthorizedException("Signed out. Please login and try again.");

    const newAccessToken = jwt.sign({ id: currentSession.userId }, process.env.AUTH_TOKEN_SECRET!, {
      expiresIn: "30s",
      algorithm: "HS256",
    });
    res.status(200).json(newAccessToken).end();
  } catch (error: any) {
    res.status(errorCode(error)).json(error.message).end();
  }
};

export const authenticationController = {
  loginWithGoogle,
  loginWithDefault,
  registerWithDefault,
  refreshAccessToken,
};
