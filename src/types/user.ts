export interface RegisterUserDTO {
  username: string;
  email: string;
  password: string;
  captchaToken: string;
  recaptchaToken: string;
  profilePhoto: {
    url: string;
    fileId: string;
  };

  location:{
    country: string;
    region: string;
    city: string;
  };

  preferences:{
    language: string;
    timezone: string;
  } 

}

export type RegisterUserResponse = {
  message: string;
  userId: string;
};

export type emailVeri = {
  username: string;
  code: string;
  captchaToken: string;
  recaptchaToken: string;
};
