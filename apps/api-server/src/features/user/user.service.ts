import { Injectable } from '@nestjs/common';
import { KyselyService } from '@peernest/db';

@Injectable()
export class UserService {
  constructor(private readonly kyselyService: KyselyService) {}

  async testing() {
    const email = 'fadfjaldfjlj';
    const users = await this.kyselyService.db
      .selectFrom('user')
      .where('email', '=', email)
      .execute();
    return { message: 'Hello world!!!', users };
  }
}
