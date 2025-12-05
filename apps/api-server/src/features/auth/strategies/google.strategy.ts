// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Profile, Strategy } from 'passport-google-oauth20';

// import { EnvironmentService } from '@/environment/environment.service';

// import { GoogleAuthRo } from '../types/social-auth.type';

// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
//   constructor(environmentService: EnvironmentService) {
//     super({
//       clientID: environmentService.getGoogleClientId(),
//       clientSecret: environmentService.getGoogleClientSecret(),
//       callbackURL: environmentService.getGoogleClientCallbackUrl(),
//       scope: ['profile', 'email'],
//     });
//   }

//   async validate(
//     accessToken: string,
//     refreshToken: string,
//     profile: Profile
//   ): Promise<GoogleAuthRo> {
//     const { id, emails, displayName, photos } = profile;
//     const email = emails?.[0].value;

//     if (!email) {
//       throw new UnauthorizedException('No email provided from google');
//     }

//     return {
//       id,
//       email,
//       displayName,
//       avatarUrl: photos?.[0].value,
//     };
//   }
// }
