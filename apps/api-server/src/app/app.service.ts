import { Injectable } from '@nestjs/common';
import { envObj } from '@peernest/config';

@Injectable()
export class AppService {
  getData() {
    console.log(envObj);
    return { message: 'Hello API!!!!' };
  }
}
