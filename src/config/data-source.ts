import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

export const dataSourceOptions: DataSourceOptions = {
    type: 'mongodb',
    url: process.env.DATABASE_URL,
    entities: [process.env.NODE_ENV === 'production' ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts'],
    migrations: [process.env.NODE_ENV === 'production' ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
    synchronize: false, // Disabled to avoid index conflicts - MongoDB doesn't need synchronize
    logging: false,
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
