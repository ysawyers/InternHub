export interface Listing {
  id: number;
  authorId: number;
  companyName: string;
  description: string;
  season: string;
  state: string;
  city: string;
  year: number;
  monthlyBudget: number;
  author: {
    firstName: string;
    lastName: string;
    profile: {
      profilePicture: string;
    };
  };
  createdAt: string;
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
  id: number;
  messageId: string;
  senderId: number;
  body: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  profile: {
    profilePicture: string;
  };
}
