import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email }
    }
    )
    if (existing) {
      throw new ConflictException('email already exist!');

    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
      }
    })

    //return user;
    return this.signToken(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    }
    )

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const valid = await bcrypt.compare(dto.password, user.password)

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return this.signToken(user.id, user.email);
  }

  private async signToken(userId: string, email: string){
    const token = await this.jwtService.signAsync({
      sub: userId,
      email,
    })

    return { accessToken: token };
  }
}
