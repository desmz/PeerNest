export enum JwtType {
  Access = 'access',
}

export type TJwtRawPayload = {
  userId: string;
  userEmail: string;
};

export type TJwtPayload = {
  sub: string;
  email: string;
  type: 'access';
};
