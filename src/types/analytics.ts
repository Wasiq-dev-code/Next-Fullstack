export type AnalyticsRange = '7d' | '28d' | '90d';

export interface AnalyticsSummary {
  totalViews: number;
  uniqueViewers: number;
  loggedOutViewers: number;
  watchSeconds: number;
  newFollowers: number;
}

export interface DailyPoint {
  date: string; // YYYY-MM-DD (UTC)
  views: number;
  uniqueViewers: number;
  loggedOutViewers: number;
  watchSeconds: number;
  newFollowers: number;
}

export interface TimeseriesResponse {
  daily: DailyPoint[];
}

export interface NamedCount {
  name: string;
  views: number;
}

export interface CountryRow {
  country: string; // ISO-2, '' when unknown
  views: number;
  watchSeconds: number;
}

export interface CityRow {
  city: string; // '' when unknown
  country: string;
  views: number;
  watchSeconds: number;
}

export interface TopVideoRow {
  videoId: string;
  title: string;
  thumbnail: string;
  views: number;
}