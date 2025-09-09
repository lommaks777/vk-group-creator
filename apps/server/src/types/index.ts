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

export interface VKGroupCreationResult {
  group_id: number;
  screen_name: string;
  url: string;
  status: 'created' | 'in_progress' | 'completed' | 'failed';
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
  error?: string;
}

export interface VKAccessToken {
  access_token: string;
  expires_in: number;
  user_id: number;
  scope: string;
}

export interface GroupCreationJob {
  id: string;
  student_id: string;
  student_data: StudentData;
  vk_token: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: VKGroupCreationResult['progress'];
  result?: VKGroupCreationResult;
  error?: string;
  created_at: Date;
  updated_at: Date;
}

export interface VKAPIResponse<T = any> {
  response?: T;
  error?: {
    error_code: number;
    error_msg: string;
    request_params: Array<{
      key: string;
      value: string;
    }>;
  };
}

export interface VKUploadResponse {
  server: number;
  photo: string;
  hash: string;
}

export interface VKPhotoSaveResponse {
  id: number;
  album_id: number;
  owner_id: number;
  user_id: number;
  photo_75: string;
  photo_130: string;
  photo_604: string;
  photo_807: string;
  photo_1280: string;
  photo_2560: string;
  width: number;
  height: number;
  text: string;
  date: number;
  post_id?: number;
}
