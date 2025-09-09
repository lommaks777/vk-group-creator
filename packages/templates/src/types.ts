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

export interface PostTemplate {
  id: string;
  title: string;
  content: string;
  attachments?: string[];
  publish_immediately: boolean;
  delay_days?: number;
}

export interface GroupDescriptionTemplate {
  title: string;
  description: string;
  website?: string;
  public_category: number;
  public_subcategory: number;
}

export interface MarketItemTemplate {
  title: string;
  description: string;
  price: number;
  category_id: number;
  main_photo_id?: number;
  photo_ids?: string;
}
