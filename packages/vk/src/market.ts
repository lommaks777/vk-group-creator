import { VKClient } from './client';
import { VKMarketItem, VKAPIResponse } from './types';

export class VKMarketAPI {
  constructor(private client: VKClient) {}

  async add(params: {
    owner_id: number;
    name: string;
    description: string;
    category_id: number;
    price: number;
    currency_id?: number;
    deleted?: 0 | 1;
    main_photo_id?: number;
    photo_ids?: string;
    url?: string;
    dimension_width?: number;
    dimension_height?: number;
    dimension_length?: number;
    weight?: number;
    sku?: string;
  }): Promise<VKAPIResponse<{ market_item_id: number }>> {
    return this.client.callMethod('market.add', params);
  }

  async edit(params: {
    owner_id: number;
    item_id: number;
    name: string;
    description: string;
    category_id: number;
    price: number;
    currency_id?: number;
    deleted?: 0 | 1;
    main_photo_id?: number;
    photo_ids?: string;
    url?: string;
    dimension_width?: number;
    dimension_height?: number;
    dimension_length?: number;
    weight?: number;
    sku?: string;
  }): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('market.edit', params);
  }

  async delete(params: {
    owner_id: number;
    item_id: number;
  }): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('market.delete', params);
  }

  async get(params: {
    owner_id: number;
    album_id?: number;
    count?: number;
    offset?: number;
    extended?: 0 | 1;
    status?: 0 | 1 | 2;
  }): Promise<VKAPIResponse<{
    count: number;
    items: VKMarketItem[];
  }>> {
    return this.client.callMethod('market.get', params);
  }

  async getById(params: {
    item_ids: string;
    extended?: 0 | 1;
  }): Promise<VKAPIResponse<{
    count: number;
    items: VKMarketItem[];
  }>> {
    return this.client.callMethod('market.getById', params);
  }

  async getCategories(params: {
    count?: number;
    offset?: number;
  } = {}): Promise<VKAPIResponse<{
    count: number;
    items: Array<{
      id: number;
      name: string;
      section: {
        id: number;
        name: string;
      };
    }>;
  }>> {
    return this.client.callMethod('market.getCategories', params);
  }

  async addAlbum(params: {
    owner_id: number;
    title: string;
    photo_id?: number;
    main_album?: 0 | 1;
    is_hidden?: 0 | 1;
  }): Promise<VKAPIResponse<{ market_album_id: number }>> {
    return this.client.callMethod('market.addAlbum', params);
  }

  async editAlbum(params: {
    owner_id: number;
    album_id: number;
    title: string;
    photo_id?: number;
    main_album?: 0 | 1;
    is_hidden?: 0 | 1;
  }): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('market.editAlbum', params);
  }

  async deleteAlbum(params: {
    owner_id: number;
    album_id: number;
  }): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('market.deleteAlbum', params);
  }

  async getAlbums(params: {
    owner_id: number;
    count?: number;
    offset?: number;
  }): Promise<VKAPIResponse<{
    count: number;
    items: Array<{
      id: number;
      owner_id: number;
      title: string;
      photo: {
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
      };
      count: number;
      updated_time: number;
    }>;
  }>> {
    return this.client.callMethod('market.getAlbums', params);
  }
}
