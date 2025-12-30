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
import {
  ChangeFieldsResponse,
  Message,
  PayloadChangeFields,
} from './types/profile-softwareenginee';

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
    return await this.fetch<CreateVideoResponse>('/videos/createVideo', {
      method: 'POST',
      body: JSON.stringify(videoData),
    });
  }

  async registerUser(data: RegisterUserDTO): Promise<RegisterUserResponse> {
    return await this.fetch<RegisterUserResponse>('/user/register', {
      method: 'POST',
      body: JSON.stringify(data),
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
    return this.fetch<CreateCommentResponse>(`/videos/${videoId}/comments`, {
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
      `/videos/${videoId}/comments?page=${page}&limit=${limit}`,
    );
  }

  async createReply(
    videoId: string,
    commentId: string,
    payload: { content: string },
  ): Promise<CreateReplyResponse> {
    return this.fetch<CreateReplyResponse>(
      `/videos/${videoId}/comments/${commentId}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  }

  async fetchReplies(
    videoId: string,
    commentId: string,
    page = 1,
    limit = 5,
  ): Promise<CommentListResponse> {
    return this.fetch<CommentListResponse>(
      `/videos/${videoId}/comments/${commentId}?page=${page}&limit=${limit}`,
    );
  }

  async toggleVideoLike(videoId: string): Promise<LikeVideoResponse> {
    return await this.fetch(`/videos/${videoId}/likes`, {
      method: 'POST',
    });
  }

  async toggleCommentLike(
    videoId: string,
    commentId: string,
  ): Promise<LikeCommentResponse> {
    return await this.fetch(`/videos/${videoId}/comments/${commentId}/likes`, {
      method: 'POST',
    });
  }

  async profileInformation(userId: string): Promise<ProfileResponse> {
    return await this.fetch<ProfileResponse>(`/user/${userId}`);
  }

  async profileVideos(
    userId: string,
    cursor: string | null,
  ): Promise<ProfileVideoResponse> {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
    return await this.fetch<ProfileVideoResponse>(
      `/user/${userId}/videos${query}`,
    );
  }

  async passwordChange(
    oldPassword: string,
    newPassword: string,
  ): Promise<Message> {
    return await this.fetch('/user/password', {
      method: 'PATCH',
      body: {
        oldPassword,
        newPassword,
      },
    });
  }

  async changeFields(
    payload: PayloadChangeFields,
  ): Promise<ChangeFieldsResponse> {
    return await this.fetch<ChangeFieldsResponse>('/user/changeFields', {
      method: 'PATCH',
      body: payload,
    });
  }
}

export const apiClient = new ApiClient();
