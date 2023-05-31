import { Request, Response } from "express";
import { AuthorizedRequest, Relationship } from "../utils/types";
import { prisma } from "../db/connection";
import { errorCode, DatabaseConflictException, InvalidRequestException } from "../utils/exceptions";
import { NotAuthorizedException } from "../utils/exceptions";
import { Messages } from "@prisma/client";

const PRISMA_RELATIONSHIP_RESULT = {
  sender: {
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
  receiver: {
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
};

const determineRecipient = (senderId: number, result: Messages | null): Relationship => {
  const relationship = {} as Relationship;

  if (result === null) return relationship;

  if (senderId !== result.senderId) {
    relationship.recipientId = result.senderId;
    // @ts-ignore
    relationship.recipient = result.sender;
    relationship.messageId = result.id;
    relationship.lastMessage = result.lastMessage;
    relationship.lastSenderId = result.lastSenderId;
  } else {
    relationship.recipientId = result.receiverId;
    // @ts-ignore
    relationship.recipient = result.receiver;
    relationship.messageId = result.id;
    relationship.lastMessage = result.lastMessage;
    relationship.lastSenderId = result.lastSenderId;
  }
  return relationship;
};

const fetchMessages = async (req: Request, res: Response) => {
  const { user } = req as AuthorizedRequest;

  try {
    const relationships: Messages[] = await prisma.messages.findMany({
      include: PRISMA_RELATIONSHIP_RESULT,
      where: {
        OR: [
          {
            senderId: user.id,
          },
          {
            receiverId: user.id,
          },
        ],
      },
      orderBy: {
        updatedAt: "desc",
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
        relationships
          .map((relationship) => determineRecipient(user.id, relationship))
          .filter((relationship) => {
            for (const user of filteredUsers) {
              if (user.blockedId === relationship.recipientId) return false;
            }
            return true;
          })
      )
      .end();
  } catch (error: any) {
    res.status(500).json({ error: error.message }).end();
  }
};

const fetchChat = async (req: Request, res: Response) => {
  const { user } = req as AuthorizedRequest;

  try {
    const relationship = await prisma.messages.findFirst({
      where: {
        id: req.params.messageId,
        OR: [
          {
            senderId: user.id,
          },
          {
            receiverId: user.id,
          },
        ],
      },
      include: {
        chat: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!relationship) {
      res.status(200).json([]).end();
      return;
    }
    res.status(200).json(relationship!.chat).end();
  } catch (error: any) {
    res.status(errorCode(error)).json({ error: error.message }).end();
  }
};

const createRelationship = async (req: Request, res: Response) => {
  const { user } = req as AuthorizedRequest;

  let relationship: Messages | null;
  try {
    const receiverId = parseInt(req.params.receiverId);

    if (user.id === receiverId) {
      throw new InvalidRequestException("Cannot create a conversation with yourself.");
    }

    relationship = await prisma.messages.findFirst({
      include: PRISMA_RELATIONSHIP_RESULT,
      where: {
        OR: [
          {
            senderId: user.id,
            receiverId: receiverId,
          },
          {
            senderId: receiverId,
            receiverId: user.id,
          },
        ],
      },
    });

    if (!!relationship) throw new DatabaseConflictException("Relationship already exists");

    const generatedResult = await prisma.messages.create({
      include: PRISMA_RELATIONSHIP_RESULT,
      data: {
        senderId: user.id,
        receiverId: receiverId,
        lastMessage: "",
        lastSenderId: user.id,
      },
    });
    res.status(201).json(determineRecipient(user.id, generatedResult)).end();
  } catch (error: any) {
    if (error instanceof DatabaseConflictException) {
      res.status(200).json(determineRecipient(user.id, relationship!)).end();
    } else {
      res.status(errorCode(error)).json({ error: error.message }).end();
    }
  }
};

const fetchRelationship = async (req: Request, res: Response) => {
  const { user } = req as AuthorizedRequest;

  try {
    const existingRelationship = await prisma.messages.findFirst({
      include: PRISMA_RELATIONSHIP_RESULT,
      where: {
        OR: [
          {
            senderId: user.id,
            receiverId: parseInt(req.params.receiverId),
          },
          {
            senderId: parseInt(req.params.receiverId),
            receiverId: user.id,
          },
        ],
      },
    });
    res.status(200).json(determineRecipient(user.id, existingRelationship)).end();
  } catch (error: any) {
    res.status(errorCode(error)).json({ error: error.message }).end();
  }
};

export const messagesController = {
  fetchMessages,
  fetchChat,
  createRelationship,
  fetchRelationship,
};
