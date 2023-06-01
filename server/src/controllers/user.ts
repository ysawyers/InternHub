import { Request, Response } from "express";
import { AuthorizedRequest } from "../utils/types";
import { prisma } from "../db/connection";
import { InvalidRequestException, errorCode } from "../utils/exceptions";
import { validateProfile } from "../utils/validation";
import { Upload } from "@aws-sdk/lib-storage";
import { S3Client, S3 } from "@aws-sdk/client-s3";

const fetchUser = async (req: Request, res: Response) => {
  const { user } = req as AuthorizedRequest;
  try {
    const userData = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dob: true,
        profile: {
          select: {
            profilePicture: true,
          },
        },
      },
    });

    if (!userData) throw new InvalidRequestException("Account does not exist.");

    res.status(200).json(userData).end();
  } catch (error: any) {
    res.status(500).json({ error: error.message }).end();
  }
};

const fetchProfile = async (req: Request, res: Response) => {
  const { user } = req as AuthorizedRequest;

  try {
    if (!req.params.userId) throw new InvalidRequestException("Invalid request (no ID provided).");

    const userProfile = await prisma.user.findFirst({
      where: {
        id: parseInt(req.params.userId),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: user.id === parseInt(req.params.userId) ? true : false,
        dob: true,
        profile: {
          select: {
            profilePicture: true,
            bio: true,
          },
        },
      },
    });

    if (!userProfile) throw new InvalidRequestException("Account does not exist.");

    res.status(200).json(userProfile).end();
  } catch (error: any) {
    res.status(errorCode(error)).json({ error: error.message }).end();
  }
};

// FIX: Delete existing profile picture from S3
const updateProfile = async (req: Request, res: Response) => {
  const { user } = req as AuthorizedRequest;

  try {
    validateProfile(req.body);

    let newProfilePicture = null;
    if (Object.keys(req.files!).length > 0) {
      // @ts-ignore
      const file = req.files.profilePicture[0];

      const uploadToS3 = new Upload({
        client: new S3({ region: "us-east-1" }) || new S3Client({ region: "us-east-1" }),
        params: {
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: `${new Date().getTime()}.${file.mimetype.split("/")[1]}`,
          Body: file.buffer,
        },
        partSize: 5 * 1024 * 1024,
      });
      const data: any = await uploadToS3.done();
      newProfilePicture = data.Location;
    }
    await prisma.profile.update({
      where: {
        userId: user.id,
      },
      data: !!newProfilePicture
        ? {
            bio: req.body.bio,
            profilePicture: newProfilePicture,
          }
        : {
            bio: req.body.bio,
          },
    });

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: req.body.email,
      },
    });

    res
      .status(200)
      .json({
        email: req.body.email,
        bio: req.body.bio,
        profilePicture: !!newProfilePicture ? newProfilePicture : "",
      })
      .end();
  } catch (error: any) {
    res.status(errorCode(error)).json(error.message).end();
  }
};

const blockUser = async (req: Request, res: Response) => {
  const { user } = req as AuthorizedRequest;

  try {
    await prisma.blockList.create({
      data: {
        blockerId: user.id,
        blockedId: parseInt(req.params.blockedId),
      },
    });
    res.status(200).end();
  } catch (error: any) {
    res.status(errorCode(error)).json({ error: error.message }).end();
  }
};

// FIX: Prevent logging out from all devices
const logout = async (req: Request, res: Response) => {
  const { user } = req as AuthorizedRequest;

  try {
    await prisma.session.deleteMany({
      where: {
        userId: user.id,
      },
    });
    res.clearCookie("refreshToken", { path: "/" });
    res.status(200).end();
  } catch (error: any) {
    res.status(errorCode(error)).json({ error: error.message }).end();
  }
};

export const userController = {
  fetchUser,
  fetchProfile,
  updateProfile,
  logout,
  blockUser,
};
