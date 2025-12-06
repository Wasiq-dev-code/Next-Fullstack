import { IVideo } from "@/model/Video.model"

export type VideoFormData = Omit<IVideo, "_id">

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE",
  body?: any,
  headers?: Record<string, string>
}

class ApiClient {
  private async fetch<T>(
    endPoint: string,
    options: FetchOptions = {}
  ) : Promise<T> {
    const {method = "GET", body, headers = {}} = options

    const defaultHeaders = {
      "Content-Type": "application/json",
      ...headers
    }

    const response = await fetch(`/api${endPoint}`, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined
    })

    if(!response.ok) {
      throw new Error(await response.text())
    }

    return response.json()
  }

  async getVideos() {
    return await this.fetch("/videos")
  }

  async createVideo (videoData:VideoFormData) {
    return await this.fetch<IVideo>("/videos", {
      method: "POST",
      body: videoData
    })
  }

}

export const apiClient = new ApiClient()