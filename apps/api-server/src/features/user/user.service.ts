import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  testing() {
    return { message: 'Hello world!!!' };
  }
}
