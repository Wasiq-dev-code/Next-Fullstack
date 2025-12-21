export type Profile = {
  _id: string;
  username: string;
  email: string;
  profilePhoto: string;

  followersCount: number;
  followToCount: number;
  postsCount: number;

  isFollowed: boolean;
  isMe: boolean;
};

export type ProfileResponse = {
  profile: Profile;
  message: string;
};
