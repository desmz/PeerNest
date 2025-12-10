import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import {
  renderResetPasswordPage,
  renderResetPasswordSuccessPage,
  TResetPasswordOptions,
  TResetPasswordSuccessOptions,
} from '@peernest/transactional';

import { AppConfig, type TAppConfig } from '@/configs/app.config';

@Injectable()
export class MailSenderService {
  private logger = new Logger(MailSenderService.name);

  constructor(
    @AppConfig() private readonly appConfig: TAppConfig,

    private readonly mailService: MailerService
  ) {}

  async sendMail(mailOptions: ISendMailOptions, extra?: { shouldThrow?: boolean }) {
    const sender = this.mailService.sendMail(mailOptions).then(() => true);

    if (extra?.shouldThrow) {
      return sender;
    }

    return sender.catch((err) => {
      if (err) {
        console.error(err);
        this.logger.error(`Mail sending failed: ${err.message}`, err.stack);
      }
      return false;
    });
  }

  async resetPasswordEmailOption(info: TResetPasswordOptions) {
    return {
      subject: `Password Reset Request for ${this.appConfig.brandName}`,
      html: await renderResetPasswordPage(info),
    };
  }

  async resetPasswordSuccessEmailOption(info: TResetPasswordSuccessOptions) {
    return {
      subject: `${this.appConfig.brandName} Password Changed`,
      html: await renderResetPasswordSuccessPage(info),
    };
  }
}
