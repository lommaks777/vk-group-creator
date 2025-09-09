export interface StudentData {
  name: string;
  city: string;
  area: string;
  phone: string;
  telegram?: string;
  techniques: string[];
  pricing: Array<{
    title: string;
    price: number;
  }>;
  is_home_visit: boolean;
  address?: string;
}

export interface GroupCreationResponse {
  auth_url: string;
  state: string;
}

export interface GroupStatus {
  id: string;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress: {
    group_created: boolean;
    avatar_uploaded: boolean;
    cover_uploaded: boolean;
    posts_published: number;
    total_posts: number;
    reviews_topic_created: boolean;
    market_enabled: boolean;
    services_added: number;
    total_services: number;
    address_added: boolean;
    auto_responder_enabled: boolean;
  };
  result?: {
    group_id: number;
    screen_name: string;
    url: string;
  };
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
}
