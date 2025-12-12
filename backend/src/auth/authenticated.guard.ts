import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean | Promise<boolean> {
    void _context;
    return true;
  }
}
