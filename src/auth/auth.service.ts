import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Authdto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  //---------------------------------------------------
  async signup(dto: Authdto) {
    try {
      const hash = await argon.hash(dto.password);
      const user = await this.databaseService.user.create({
        data: {
          email: dto.email,
          hash: hash,
        },
      });
      console.log('User saved');
      return this.getToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken, try a new one');
        }
      }
      throw error;
    }
  }

  // ---------------------------------------------------
  async login(dto: Authdto) {
    const user = await this.databaseService.user.findFirst({
      where: { email: dto.email },
    });
    if (!user) {
      throw new ForbiddenException(`User doesn't exist!`);
    }
    const matchedPass = await argon.verify(user.hash, dto.password);
    if (!matchedPass) {
      throw new ForbiddenException('Wrong password!');
    }
    return this.getToken(user.id, user.email);
  }

  // ---------------------------------------------------
  async getToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const token = await this.jwt.signAsync(
      { userId, email },
      {
        expiresIn: '15m',
        secret: this.config.get('ACCESS_TOKEN_SECRET'),
      },
    );
    return { access_token: token };
  }
}
