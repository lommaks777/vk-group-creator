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

export interface VKGroupInfo {
  id: number;
  name: string;
  screen_name: string;
  type: string;
  is_closed: number;
  can_access_closed: boolean;
  photo_50: string;
  photo_100: string;
  photo_200: string;
}

export interface VKMarketItem {
  id: number;
  owner_id: number;
  title: string;
  description: string;
  price: {
    amount: string;
    currency: {
      id: number;
      name: string;
    };
  };
  category: {
    id: number;
    name: string;
  };
  date: number;
  availability: number;
  is_favorite: boolean;
  photos: Array<{
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
  }>;
}

export interface VKBoardTopic {
  id: number;
  title: string;
  created: number;
  created_by: number;
  updated: number;
  updated_by: number;
  is_closed: number;
  is_fixed: number;
  comments: number;
}

export interface VKPost {
  id: number;
  owner_id: number;
  from_id: number;
  date: number;
  text: string;
  reply_owner_id?: number;
  reply_post_id?: number;
  friends_only?: number;
  comments: {
    count: number;
    can_post: number;
    groups_can_post: boolean;
    can_close: boolean;
    can_open: boolean;
  };
  likes: {
    count: number;
    user_likes: number;
    can_like: number;
    can_publish: number;
  };
  reposts: {
    count: number;
    user_reposted: number;
  };
  views: {
    count: number;
  };
  post_type: string;
  attachments?: Array<{
    type: string;
    photo?: VKPhotoSaveResponse;
  }>;
  geo?: {
    type: string;
    coordinates: string;
    place: {
      id: number;
      title: string;
      latitude: number;
      longitude: number;
      created: number;
      icon: string;
      country: string;
      city: string;
      type: number;
      group_id: number;
      group_photo: string;
      checkins: number;
      updated: number;
      address: string;
    };
  };
  signer_id?: number;
  copy_history?: VKPost[];
  can_pin: number;
  can_delete: number;
  can_edit: number;
  is_pinned: number;
  marked_as_ads: number;
  is_favorite: boolean;
  postponed_id?: number;
}

export interface VKConfig {
  apiVersion: string;
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}
