import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  StrategyOptions,
  JwtFromRequestFunction,
} from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const jwtExtractor: JwtFromRequestFunction = (
      req: Request,
    ): string | null => {
      const authorization = req?.headers?.authorization;
      if (!authorization) return null;
      const parts = authorization.split(' ');
      if (parts.length !== 2) return null;
      const [scheme, token] = parts;
      if (scheme.toLowerCase() !== 'bearer') return null;
      return token?.length ? token : null;
    };
    const options: StrategyOptions = {
      jwtFromRequest: jwtExtractor,
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'secret',
    };
    super(options);
  }

  validate(payload: { sub: string; username: string }) {
    return { userId: payload.sub, username: payload.username };
  }
}
