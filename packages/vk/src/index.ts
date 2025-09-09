export { VKClient } from './client';
export { VKGroupsAPI } from './groups';
export { VKPhotosAPI } from './photos';
export { VKWallAPI } from './wall';
export { VKMarketAPI } from './market';
export { VKBoardAPI } from './board';
export * from './types';

import { VKClient } from './client';
import { VKGroupsAPI } from './groups';
import { VKPhotosAPI } from './photos';
import { VKWallAPI } from './wall';
import { VKMarketAPI } from './market';
import { VKBoardAPI } from './board';
import { VKConfig } from './types';

export class VKAPI {
  public groups: VKGroupsAPI;
  public photos: VKPhotosAPI;
  public wall: VKWallAPI;
  public market: VKMarketAPI;
  public board: VKBoardAPI;

  constructor(accessToken: string, config: VKConfig) {
    const client = new VKClient(accessToken, config);
    
    this.groups = new VKGroupsAPI(client);
    this.photos = new VKPhotosAPI(client);
    this.wall = new VKWallAPI(client);
    this.market = new VKMarketAPI(client);
    this.board = new VKBoardAPI(client);
  }
}

// Создаем экземпляр с дефолтными настройками
export function createVKAPI(accessToken: string, customConfig?: Partial<VKConfig>): VKAPI {
  const defaultConfig: VKConfig = {
    apiVersion: '5.199',
    baseURL: 'https://api.vk.com',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    ...customConfig,
  };

  return new VKAPI(accessToken, defaultConfig);
}
