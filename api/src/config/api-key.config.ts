import { registerAs } from '@nestjs/config';

export default registerAs('apiKey', () => ({
  expiresIn: process.env.API_KEY_EXPIRES_IN || null,
}));

