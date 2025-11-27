import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

export const dataSourceOptions: DataSourceOptions = {
    type: 'mongodb',
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/fdtelecom',
    entities: [process.env.NODE_ENV === 'production' ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts'],
    migrations: [process.env.NODE_ENV === 'production' ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
    synchronize: true,
    logging: false,
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
