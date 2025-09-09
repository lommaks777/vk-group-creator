import fetch from 'node-fetch';
import FormData from 'form-data';
import { VKAPIResponse, VKConfig } from './types';

export class VKClient {
  private accessToken: string;
  private config: VKConfig;

  constructor(accessToken: string, config: VKConfig) {
    this.accessToken = accessToken;
    this.config = config;
  }

  async callMethod<T = any>(
    method: string,
    params: Record<string, any> = {}
  ): Promise<VKAPIResponse<T>> {
    const url = `${this.config.baseURL}/method/${method}`;
    
    const requestParams = {
      access_token: this.accessToken,
      v: this.config.apiVersion,
      ...params,
    };

    let attempts = 0;
    while (attempts < this.config.retryAttempts) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(requestParams),
          timeout: this.config.timeout,
        });

        const data = await response.json() as VKAPIResponse<T>;

        // Обработка ошибок VK API
        if (data.error) {
          const error = data.error;
          
          // Flood control - ждем и повторяем
          if (error.error_code === 9 || error.error_code === 6) {
            attempts++;
            if (attempts < this.config.retryAttempts) {
              const delay = this.config.retryDelay * Math.pow(2, attempts - 1);
              await this.sleep(delay);
              continue;
            }
          }
          
          // Captcha - для MVP просто логируем
          if (error.error_code === 14) {
            console.warn('Captcha required:', error);
            throw new Error(`Captcha required: ${error.error_msg}`);
          }
          
          throw new Error(`VK API Error ${error.error_code}: ${error.error_msg}`);
        }

        return data;
      } catch (error) {
        attempts++;
        if (attempts >= this.config.retryAttempts) {
          throw error;
        }
        
        // Сетевые ошибки - повторяем
        if (error instanceof Error && (
          error.message.includes('timeout') ||
          error.message.includes('ECONNRESET') ||
          error.message.includes('ENOTFOUND')
        )) {
          const delay = this.config.retryDelay * Math.pow(2, attempts - 1);
          await this.sleep(delay);
          continue;
        }
        
        throw error;
      }
    }

    throw new Error('Max retry attempts exceeded');
  }

  async uploadFile(
    uploadUrl: string,
    fileBuffer: Buffer,
    fieldName: string = 'file'
  ): Promise<any> {
    const form = new FormData();
    form.append(fieldName, fileBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
    });

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: form,
      timeout: this.config.timeout,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
