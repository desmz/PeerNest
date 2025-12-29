import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigurableModuleBuilder, DynamicModule, Module } from '@nestjs/common';

import { mailConfig, TMailConfig } from '@/configs/mail.config';

import { MailSenderService } from './mail-sender.service';

export interface IMailSenderModuleOptions {
  global?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { ConfigurableModuleClass: MailSenderModuleClass, OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<IMailSenderModuleOptions>().build();

@Module({})
export class MailSenderModule extends MailSenderModuleClass {
  static register(options?: typeof OPTIONS_TYPE): DynamicModule {
    const { global } = options || {};

    const module = MailerModule.forRootAsync({
      inject: [mailConfig.KEY],

      useFactory: (mailConfig: TMailConfig) => ({
        transport: {
          host: mailConfig.host,
          port: mailConfig.port,
          secure: mailConfig.secure,
          auth: {
            user: mailConfig.auth.user,
            pass: mailConfig.auth.password,
          },
        },
        defaults: {
          // from: `"${mailConfig.senderName}" <${mailConfig.sender}>`,
          from: mailConfig.sender,
        },
      }),
    });

    return {
      imports: [module],
      module: MailSenderModule,
      global,
      providers: [MailSenderService],
      exports: [MailSenderService],
    };
  }
}
