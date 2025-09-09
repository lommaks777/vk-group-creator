import { VKClient } from './client';
import { VKBoardTopic, VKAPIResponse } from './types';

export class VKBoardAPI {
  constructor(private client: VKClient) {}

  async addTopic(params: {
    group_id: number;
    title: string;
    text?: string;
    from_group?: 0 | 1;
    attachments?: string;
  }): Promise<VKAPIResponse<{ topic_id: number }>> {
    return this.client.callMethod('board.addTopic', params);
  }

  async editTopic(params: {
    group_id: number;
    topic_id: number;
    title: string;
  }): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('board.editTopic', params);
  }

  async deleteTopic(params: {
    group_id: number;
    topic_id: number;
  }): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('board.deleteTopic', params);
  }

  async fixTopic(params: {
    group_id: number;
    topic_id: number;
  }): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('board.fixTopic', params);
  }

  async unfixTopic(params: {
    group_id: number;
    topic_id: number;
  }): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('board.unfixTopic', params);
  }

  async closeTopic(params: {
    group_id: number;
    topic_id: number;
  }): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('board.closeTopic', params);
  }

  async openTopic(params: {
    group_id: number;
    topic_id: number;
  }): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('board.openTopic', params);
  }

  async getTopics(params: {
    group_id: number;
    topic_ids?: string;
    order?: 1 | 2;
    offset?: number;
    count?: number;
    extended?: 0 | 1;
    preview?: 0 | 1;
    preview_length?: number;
  }): Promise<VKAPIResponse<{
    count: number;
    items: VKBoardTopic[];
  }>> {
    return this.client.callMethod('board.getTopics', params);
  }

  async getComments(params: {
    group_id: number;
    topic_id: number;
    need_likes?: 0 | 1;
    start_comment_id?: number;
    offset?: number;
    count?: number;
    extended?: 0 | 1;
    sort?: 'asc' | 'desc';
  }): Promise<VKAPIResponse<{
    count: number;
    items: Array<{
      id: number;
      from_id: number;
      date: number;
      text: string;
      likes?: {
        count: number;
        user_likes: number;
        can_like: number;
      };
      attachments?: Array<{
        type: string;
        photo?: any;
        video?: any;
        audio?: any;
        doc?: any;
        link?: any;
        note?: any;
        page?: any;
        market?: any;
        market_album?: any;
        sticker?: any;
        graffiti?: any;
        audio_message?: any;
      }>;
    }>;
  }>> {
    return this.client.callMethod('board.getComments', params);
  }

  async addComment(params: {
    group_id: number;
    topic_id: number;
    message?: string;
    attachments?: string;
    from_group?: 0 | 1;
    sticker_id?: number;
    guid?: number;
  }): Promise<VKAPIResponse<{ comment_id: number }>> {
    return this.client.callMethod('board.addComment', params);
  }

  async editComment(params: {
    group_id: number;
    topic_id: number;
    comment_id: number;
    message: string;
    attachments?: string;
  }): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('board.editComment', params);
  }

  async deleteComment(params: {
    group_id: number;
    topic_id: number;
    comment_id: number;
  }): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('board.deleteComment', params);
  }

  async restoreComment(params: {
    group_id: number;
    topic_id: number;
    comment_id: number;
  }): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('board.restoreComment', params);
  }
}
