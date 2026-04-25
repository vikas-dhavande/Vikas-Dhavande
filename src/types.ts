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
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface Profile {
  id: string;
  role: 'user' | 'admin' | 'super_user';
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_name: string;
  path: string;
  session_id: string;
  user_id: string | null;
  user_agent: string;
  referrer: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AnalyticsStats {
  totalViews: number;
  uniqueVisitors: number;
  bounceRate: string;
  topPages: Array<{ path: string; views: number }>;
  chartData: Array<{ name: string; views: number }>;
}
