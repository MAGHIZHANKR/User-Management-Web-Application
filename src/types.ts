export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  createdAt: string;
}

export interface Stats {
  totalUsers: number;
  citySummary: {
    city: string;
    count: number;
  }[];
}

export interface FileData {
  filename: string;
  language: string;
  content: string;
  description: string;
}
