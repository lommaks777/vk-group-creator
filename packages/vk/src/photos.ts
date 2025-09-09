import { VKClient } from './client';
import { VKUploadResponse, VKPhotoSaveResponse, VKAPIResponse } from './types';

export class VKPhotosAPI {
  constructor(private client: VKClient) {}

  async getOwnerPhotoUploadServer(params: {
    owner_id?: number;
  } = {}): Promise<VKAPIResponse<VKUploadResponse>> {
    return this.client.callMethod('photos.getOwnerPhotoUploadServer', params);
  }

  async saveOwnerPhoto(params: {
    photo: string;
    server: number;
    hash: string;
  }): Promise<VKAPIResponse<VKPhotoSaveResponse>> {
    return this.client.callMethod('photos.saveOwnerPhoto', params);
  }

  async getOwnerCoverPhotoUploadServer(params: {
    group_id: number;
    crop_x?: number;
    crop_y?: number;
    crop_x2?: number;
    crop_y2?: number;
  }): Promise<VKAPIResponse<VKUploadResponse>> {
    return this.client.callMethod('photos.getOwnerCoverPhotoUploadServer', params);
  }

  async saveOwnerCoverPhoto(params: {
    photo: string;
    hash: string;
  }): Promise<VKAPIResponse<{
    images: Array<{
      url: string;
      width: number;
      height: number;
    }>;
  }>> {
    return this.client.callMethod('photos.saveOwnerCoverPhoto', params);
  }

  async getWallUploadServer(params: {
    group_id?: number;
  } = {}): Promise<VKAPIResponse<VKUploadResponse>> {
    return this.client.callMethod('photos.getWallUploadServer', params);
  }

  async saveWallPhoto(params: {
    photo: string;
    server: number;
    hash: string;
    user_id?: number;
    group_id?: number;
    caption?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<VKAPIResponse<VKPhotoSaveResponse[]>> {
    return this.client.callMethod('photos.saveWallPhoto', params);
  }

  async getMarketUploadServer(params: {
    group_id: number;
    main_photo?: 0 | 1;
    crop_x?: number;
    crop_y?: number;
    crop_width?: number;
  }): Promise<VKAPIResponse<VKUploadResponse>> {
    return this.client.callMethod('photos.getMarketUploadServer', params);
  }

  async saveMarketPhoto(params: {
    group_id: number;
    photo: string;
    server: number;
    hash: string;
    crop_data?: string;
    crop_hash?: string;
  }): Promise<VKAPIResponse<VKPhotoSaveResponse[]>> {
    return this.client.callMethod('photos.saveMarketPhoto', params);
  }
}
