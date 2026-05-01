export interface RegisterUserDTO {
  username: string;
  email: string;
  password: string;
  profilePhoto: {
    url: string;
    fileId: string;
  };
}

export type RegisterUserResponse = {
  message: string;
  userId: string;
};

export type emailVeri = {
  username: string;
  code: string;
};
