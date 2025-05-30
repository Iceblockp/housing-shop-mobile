export interface Request {
  id: string;
  userId: string;
  title: string;
  description: string;
  adminReply: string | null;
  createdAt: string; // ISO 8601 string format
  updatedAt: string; // ISO 8601 string format
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
}
