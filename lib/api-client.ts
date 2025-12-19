import { IUser } from '@/model/User.model';
import { IVideo } from '@/model/Video.model';
import {
  FeedRequest,
  FeedResponse,
  FetchOptions,
  RegisterData,
  VideoFormData,
} from './types/result';

class ApiClient {
  private async fetch<T>(
    endPoint: string,
    options: FetchOptions = {},
  ): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const response = await fetch(`/api${endPoint}`, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  async getVideos(): Promise<IVideo[]> {
    return await this.fetch<IVideo[]>('/videos');
  }

  async createVideo(videoData: VideoFormData) {
    return await this.fetch<IVideo>('/videos/[videoId]/myvideos', {
      method: 'POST',
      body: videoData,
    });
  }

  async register(data: RegisterData) {
    return await this.fetch<IUser>('/auth/register', {
      method: 'POST',
      body: data,
    });
  }

  async fetchRandomFeed(data: FeedRequest): Promise<FeedResponse> {
    return await this.fetch<FeedResponse>('/videos', {
      method: 'POST',
      body: data,
    });
  }
}

export const apiClient = new ApiClient();
