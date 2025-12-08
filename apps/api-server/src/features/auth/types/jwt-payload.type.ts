export enum JwtType {
  ACCESS = 'access',
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
