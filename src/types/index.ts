export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  statusMessage?: string;
};

export type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
};

export type Chat = {
  id: string;
  participants: User[];
  messages: Message[];
  isGroup: boolean;
  name?: string;
};