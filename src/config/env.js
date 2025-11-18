
import dotenv from 'dotenv';

export function loadEnv() {
  dotenv.config();
  return {
    PORT: process.env.PORT || 3000,
    DB_SERVER: process.env.DB_SERVER || '',
    DB_USER: process.env.DB_USER || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_DATABASE: process.env.DB_DATABASE || '',
    JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  };
}
