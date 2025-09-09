import { VKClient } from './client';
import { VKGroupInfo, VKAPIResponse } from './types';

export class VKGroupsAPI {
  constructor(private client: VKClient) {}

  async create(params: {
    title: string;
    description?: string;
    type?: 'group' | 'page' | 'event';
    subtype?: 'place' | 'company' | 'organization' | 'group' | 'event';
    public_category?: number;
    public_subcategory?: number;
    website?: string;
    age_limits?: 1 | 2 | 3;
  }): Promise<VKAPIResponse<{ id: number }>> {
    return this.client.callMethod('groups.create', params);
  }

  async edit(params: {
    group_id: number;
    title?: string;
    description?: string;
    website?: string;
    public_category?: number;
    public_subcategory?: number;
    public_date?: string;
    wall?: 0 | 1 | 2 | 3;
    topics?: 0 | 1 | 2;
    photos?: 0 | 1 | 2;
    video?: 0 | 1 | 2;
    audio?: 0 | 1 | 2;
    links?: 0 | 1;
    events?: 0 | 1;
    places?: 0 | 1;
    contacts?: 0 | 1;
    docs?: 0 | 1 | 2;
    wiki?: 0 | 1 | 2;
    messages?: 0 | 1;
    articles?: 0 | 1;
    addresses?: 0 | 1;
    age_limits?: 1 | 2 | 3;
    market?: 0 | 1;
    market_comments?: 0 | 1;
    market_country?: number[];
    market_city?: number[];
    market_currency?: number;
    market_contact?: number;
    market_wiki?: number;
    obscene_filter?: 0 | 1;
    obscene_stopwords?: 0 | 1;
    obscene_words?: string;
    main_section?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
    secondary_section?: number;
    country?: number;
    city?: number;
  }): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('groups.edit', params);
  }

  async getById(params: {
    group_ids?: string;
    group_id?: number;
    fields?: string;
  }): Promise<VKAPIResponse<VKGroupInfo[]>> {
    return this.client.callMethod('groups.getById', params);
  }

  async addAddress(params: {
    group_id: number;
    title: string;
    address: string;
    additional_address?: string;
    country_id: number;
    city_id: number;
    metro_id?: number;
    latitude: number;
    longitude: number;
    phone?: string;
    work_info_status?: 'always_opened' | 'forever_closed' | 'timetable' | 'no_information';
    timetable?: {
      [key: string]: {
        is_open: boolean;
        break_open_time?: number;
        break_close_time?: number;
        close_time?: number;
        open_time?: number;
      };
    };
    is_main_address?: boolean;
  }): Promise<VKAPIResponse<{ id: number }>> {
    return this.client.callMethod('groups.addAddress', params);
  }

  async toggleMarket(params: {
    group_id: number;
    enabled: 0 | 1;
    contact_id?: number;
    currency?: number;
    country_id?: number;
    city_id?: number;
  }): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('groups.toggleMarket', params);
  }

  async setLongPollSettings(params: {
    group_id: number;
    enabled: 0 | 1;
    api_version?: string;
    message_new?: 0 | 1;
    message_reply?: 0 | 1;
    message_allow?: 0 | 1;
    message_deny?: 0 | 1;
    message_typing_state?: 0 | 1;
    message_edit?: 0 | 1;
    photo_new?: 0 | 1;
    audio_new?: 0 | 1;
    video_new?: 0 | 1;
    wall_reply_new?: 0 | 1;
    wall_reply_edit?: 0 | 1;
    wall_reply_delete?: 0 | 1;
    wall_reply_restore?: 0 | 1;
    wall_post_new?: 0 | 1;
    wall_repost?: 0 | 1;
    board_post_new?: 0 | 1;
    board_post_edit?: 0 | 1;
    board_post_restore?: 0 | 1;
    board_post_delete?: 0 | 1;
    photo_comment_new?: 0 | 1;
    photo_comment_edit?: 0 | 1;
    photo_comment_delete?: 0 | 1;
    photo_comment_restore?: 0 | 1;
    video_comment_new?: 0 | 1;
    video_comment_edit?: 0 | 1;
    video_comment_delete?: 0 | 1;
    video_comment_restore?: 0 | 1;
    market_comment_new?: 0 | 1;
    market_comment_edit?: 0 | 1;
    market_comment_delete?: 0 | 1;
    market_comment_restore?: 0 | 1;
    poll_vote_new?: 0 | 1;
    group_join?: 0 | 1;
    group_leave?: 0 | 1;
    group_change_settings?: 0 | 1;
    group_change_photo?: 0 | 1;
    group_officers_edit?: 0 | 1;
    user_block?: 0 | 1;
    user_unblock?: 0 | 1;
    lead_forms_new?: 0 | 1;
    like_add?: 0 | 1;
    like_remove?: 0 | 1;
    message_event?: 0 | 1;
    donut_subscription_create?: 0 | 1;
    donut_subscription_prolonged?: 0 | 1;
    donut_subscription_cancelled?: 0 | 1;
    donut_subscription_price_changed?: 0 | 1;
    donut_subscription_expired?: 0 | 1;
    donut_money_withdraw?: 0 | 1;
    donut_money_withdraw_error?: 0 | 1;
  }): Promise<VKAPIResponse<1>> {
    return this.client.callMethod('groups.setLongPollSettings', params);
  }

  async addCallbackServer(params: {
    group_id: number;
    url: string;
    title: string;
    secret_key?: string;
  }): Promise<VKAPIResponse<{ server_id: number }>> {
    return this.client.callMethod('groups.addCallbackServer', params);
  }
}
