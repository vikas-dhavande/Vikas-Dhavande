export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  role: 'user' | 'admin' | 'super_user';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail_url?: string;
  author_name: string;
  metadata: Record<string, any>;
  created_at: string;
  published_at?: string;
  updated_at: string;
}
