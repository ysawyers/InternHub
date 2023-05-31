import { Request, Response } from "express";
import { AuthorizedRequest, Listing } from "../utils/types";
import { prisma } from "../db/connection";
import { errorCode } from "../utils/exceptions";
import { validateListing } from "../utils/validation";

const createListing = async (req: Request, res: Response) => {
  const { user } = req as AuthorizedRequest;

  const routeFields: Listing = req.body;
  try {
    validateListing(routeFields);

    const generatedListing = await prisma.listing.create({
      data: {
        authorId: user.id,
        ...routeFields,
      },
    });
    res.status(201).json(generatedListing).end();
  } catch (error: any) {
    res.status(errorCode(error)).json({ error: error.message }).end();
  }
};

const fetchRecentListings = async (req: Request, res: Response) => {
  const { user } = req as AuthorizedRequest;
  try {
    const listings = await prisma.listing.findMany({
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            profile: {
              select: {
                profilePicture: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const filteredUsers = await prisma.blockList.findMany({
      where: {
        blockerId: user.id,
      },
    });

    res
      .status(200)
      .json(
        listings.filter((listing) => {
          for (const user of filteredUsers) {
            if (user.blockedId === listing.authorId) return false;
          }
          return true;
        })
      )
      .end();
  } catch (error: any) {
    res.status(errorCode(error)).json({ error: error.message }).end();
  }
};

const deleteListing = async (req: Request, res: Response) => {
  const { user } = req as AuthorizedRequest;

  try {
    const listingId = parseInt(req.params.listingId);

    const deletedListing = await prisma.listing.deleteMany({
      where: {
        AND: [
          {
            id: listingId,
          },
          {
            authorId: user.id,
          },
        ],
      },
    });
    res.status(200).json(listingId).end();
  } catch (error: any) {
    res.status(errorCode(error)).json({ error: error.message }).end();
  }
};

export const listingsController = {
  createListing,
  fetchRecentListings,
  deleteListing,
};
