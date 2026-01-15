import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const user = await this.usersService.create(
        registerDto.email,
        registerDto.password,
        registerDto.name,
      );

      const { password, ...result } = user;
      const accessToken = await this.generateToken(user);

      return {
        user: result,
        accessToken,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      user,
      loginDto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...result } = user;
    const accessToken = await this.generateToken(user);

    return {
      user: result,
      accessToken,
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }

  /**
   * Refreshes a JWT token by validating it and generating a new one
   * Mobile-friendly: Allows apps to refresh tokens before expiration
   */
  async refreshToken(token: string): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    try {
      const secret = this.configService.get<string>('jwt.secret');
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      // Fetch user to ensure they still exist
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new token
      const accessToken = await this.generateToken(user);
      const { password, ...userWithoutPassword } = user;

      return {
        accessToken,
        user: userWithoutPassword,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private async generateToken(user: User): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    const secret = this.configService.get<string>('jwt.secret');
    const expiresIn = this.configService.get<string>('jwt.expiresIn');

    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
  }
}

