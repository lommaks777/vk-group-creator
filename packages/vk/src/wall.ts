import { VKClient } from './client';
import { VKPost, VKAPIResponse } from './types';

export class VKWallAPI {
  constructor(private client: VKClient) {}

  async post(params: {
    owner_id?: number;
    friends_only?: 0 | 1;
    from_group?: 0 | 1;
    message?: string;
    attachments?: string;
    services?: string;
    signed?: 0 | 1;
    publish_date?: number;
    lat?: number;
    long?: number;
    place_id?: number;
    post_id?: number;
    guid?: number;
    mark_as_ads?: 0 | 1;
    close_comments?: 0 | 1;
    donut_paid_duration?: number;
    mute_notifications?: 0 | 1;
  }): Promise<VKAPIResponse<{ post_id: number }>> {
    return this.client.callMethod('wall.post', params);
  }

  async edit(params: {
    owner_id?: number;
    post_id: number;
    friends_only?: 0 | 1;
    message?: string;
    attachments?: string;
    services?: string;
    signed?: 0 | 1;
    publish_date?: number;
    lat?: number;
    long?: number;
    place_id?: number;
    mark_as_ads?: 0 | 1;
    close_comments?: 0 | 1;
    donut_paid_duration?: number;
    mute_notifications?: 0 | 1;
  }): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('wall.edit', params);
  }

  async delete(params: {
    owner_id?: number;
    post_id: number;
  }): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('wall.delete', params);
  }

  async pin(params: {
    owner_id?: number;
    post_id: number;
  }): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('wall.pin', params);
  }

  async unpin(params: {
    owner_id?: number;
  } = {}): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('wall.unpin', params);
  }

  async get(params: {
    owner_id?: number;
    domain?: string;
    offset?: number;
    count?: number;
    filter?: 'owner' | 'others' | 'all' | 'postponed' | 'suggests';
    extended?: 0 | 1;
    fields?: string;
  }): Promise<VKAPIResponse<{
    count: number;
    items: VKPost[];
  }>> {
    return this.client.callMethod('wall.get', params);
  }

  async getById(params: {
    posts: string;
    extended?: 0 | 1;
    copy_history_depth?: number;
    fields?: string;
  }): Promise<VKAPIResponse<{
    items: VKPost[];
    profiles?: any[];
    groups?: any[];
  }>> {
    return this.client.callMethod('wall.getById', params);
  }
}
