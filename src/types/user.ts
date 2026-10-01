export interface RegisterUserDTO {
  username: string;
  email: string;
  password: string;
  profilePhoto: {
    url: string;
    fileId: string;
  };

  location:{
    country:  String, 
    region:   String, 
    city:     String, 
  };

  preferences:{
    language: String, 
    timezone: String
  } 

}

export type RegisterUserResponse = {
  message: string;
  userId: string;
};

export type emailVeri = {
  username: string;
  code: string;
};
