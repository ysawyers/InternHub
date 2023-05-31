import { Request } from "express";

export interface AuthorizedRequest extends Request {
  user: {
    id: number;
  };
}

export interface RegisterFields {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  dob: string;
}

export interface Listing {
  companyName: string;
  season: string;
  city: string;
  state: string;
  year: number;
  monthlyBudget: number;
  description: string;
}

export interface Relationship {
  messageId: string;
  recipientId: number;
  lastMessage: string;
  lastSenderId: number;
  recipient: {
    firstName: string;
    lastName: string;
    profile: {
      profilePicture: string;
    };
  };
}

export interface ChatMessage {
  messageId: string;
  senderId: number;
  body: string;
}
