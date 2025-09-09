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

export interface ImageGenerationOptions {
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
}

export interface AvatarOptions extends ImageGenerationOptions {
  showPhone?: boolean;
  showTelegram?: boolean;
}

export interface CoverOptions extends ImageGenerationOptions {
  showTechniques?: boolean;
  showPricing?: boolean;
}
