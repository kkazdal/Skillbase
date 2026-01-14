import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './project.entity';
import { UsersModule } from '../users/users.module';
import { AuthGuard } from '../common/guards/auth.guard';
import jwtConfig from '../config/jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    UsersModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, AuthGuard],
  exports: [ProjectsService],
})
export class ProjectsModule {}

