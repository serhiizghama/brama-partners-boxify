// src/config/typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME ?? 'boxify',
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  synchronize: process.env.DB_SYNC === 'true',
  autoLoadEntities: true,
  logging: process.env.DB_LOGGING === 'true' ? ['query', 'error'] : ['error'],
});
