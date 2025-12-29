import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';
import { envObj } from '@peernest/config/dynamic';

export const mailConfig = registerAs('mail', () => ({
  publicOrigin: envObj.PUBLIC_ORIGIN ?? 'http://localhost:3001',
  host: envObj.BACKEND_MAIL_HOST,
  port: envObj.BACKEND_MAIL_PORT ?? 587,
  secure: envObj.BACKEND_MAIL_SECURE,
  sender: envObj.BACKEND_MAIL_SENDER,
  senderName: envObj.BACKEND_MAIL_SENDER_NAME,
  auth: {
    user: envObj.BACKEND_MAIL_AUTH_USER,
    password: envObj.BACKEND_MAIL_AUTH_PASS,
  },
}));

export const MailConfig = () => Inject(mailConfig.KEY);
export type TMailConfig = ConfigType<typeof mailConfig>;
