export interface GeneralTokenData {
  payload: any;
  expiresIn: number;
  secret: string;
}

export interface generatedToken {
  token: string;
  uuid: string;
}
