
import dotenv from 'dotenv';

export function loadEnv() {
  dotenv.config();
  return {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    MAIL_HOST: process.env.MAIL_HOST || 'smtp.gmail.com',
    MAIL_PORT: process.env.MAIL_PORT || 587,
    MAIL_USER: process.env.MAIL_USER || '',
    MAIL_PASSWORD: process.env.MAIL_PASSWORD || '',
    // Database configuration
    DB_SERVER: process.env.DB_SERVER || 'localhost',
    DB_PORT: process.env.DB_PORT || 1433,
    DB_USER: process.env.DB_USER || 'sa',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_DATABASE: process.env.DB_DATABASE || 'proveeduria_db',
    DB_ENCRYPT: process.env.DB_ENCRYPT === 'true',
    DB_TRUST_CERT: process.env.DB_TRUST_CERT !== 'false', // Default true for local dev
    USE_DATABASE: process.env.USE_DATABASE === 'true',
  };
}
