import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import DatabaseConfig from '../config/database.config';
import { User } from 'src/modules/user/user.entity';

try {
  dotenv.config();
} catch {
  console.error('Error loading environment variables');
}

const { databaseConnection } = DatabaseConfig();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: databaseConnection.host,
  port: databaseConnection.port,
  username: databaseConnection.username,
  password: databaseConnection.password,
  database: databaseConnection.database,
  entities: [User],
  migrations: ['src/migrations/*.{ts,js}'],
  synchronize: false,
});
