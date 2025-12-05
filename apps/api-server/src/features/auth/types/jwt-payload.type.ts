export enum JwtType {
  ACCESS = 'access',
}

export type TJwtPayload = {
  sub: string;
  email: string;
  type: 'access';
};
