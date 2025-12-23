import { FetchOptions } from './types/result';

import {
  CreateVideoDTO,
  CreateVideoResponse,
  FeedRequest,
  FeedResponse,
  SingleVideoRes,
} from './types/video';
import {
  CommentListResponse,
  CreateCommentResponse,
  CreateReplyResponse,
} from './types/comment';
import { LikeCommentResponse, LikeVideoResponse } from './types/like';
import { ProfileResponse, ProfileVideoResponse } from './types/profile';
import { RegisterUserDTO, RegisterUserResponse } from './types/user';

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

  async createVideo(videoData: CreateVideoDTO): Promise<CreateVideoResponse> {
    return await this.fetch<CreateVideoResponse>('/videos/myvideos', {
      method: 'POST',
      body: videoData,
    });
  }

  async register(data: RegisterUserDTO): Promise<RegisterUserResponse> {
    return await this.fetch<RegisterUserResponse>('/user/register', {
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

  async fetchSingleVideo(videoId: string): Promise<SingleVideoRes> {
    return await this.fetch<SingleVideoRes>(`/videos/${videoId}`);
  }

  async createVideoComment(
    videoId: string,
    payload: { content: string },
  ): Promise<CreateCommentResponse> {
    return this.fetch<CreateCommentResponse>(`/comments/${videoId}/comments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async fetchVideoComments(
    videoId: string,
    page = 1,
    limit = 10,
  ): Promise<CommentListResponse> {
    return await this.fetch<CommentListResponse>(
      `/comments/${videoId}/comments?page=${page}&limit=${limit}`,
    );
  }

  async createReply(
    commentId: string,
    payload: { content: string },
  ): Promise<CreateReplyResponse> {
    return this.fetch<CreateReplyResponse>(`/comments/${commentId}/replies`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async fetchReplies(
    commentId: string,
    page = 1,
    limit = 5,
  ): Promise<CommentListResponse> {
    return this.fetch<CommentListResponse>(
      `/comments/${commentId}/replies?page=${page}&limit=${limit}`,
    );
  }

  async toggleVideoLike(videoId: string): Promise<LikeVideoResponse> {
    return await this.fetch(`/likes/video/${videoId}`, {
      method: 'POST',
    });
  }

  async toggleCommentLike(commentId: string): Promise<LikeCommentResponse> {
    return await this.fetch(`/likes/comment/${commentId}`, {
      method: 'POST',
    });
  }

  async profileInformation(userId: string): Promise<ProfileResponse> {
    return await this.fetch<ProfileResponse>(`/user/${userId}`);
  }

  async profileVideos(userId: string): Promise<ProfileVideoResponse> {
    return await this.fetch<ProfileVideoResponse>(
      `/videos/${userId}/UserVideos`,
    );
  }
}

export const apiClient = new ApiClient();
