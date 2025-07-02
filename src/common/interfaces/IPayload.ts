export default interface IPayload {
  sub: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
  twoFactorEnabled: boolean;
  twoFactorValidated: boolean;
}
