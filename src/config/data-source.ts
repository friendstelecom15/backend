
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

export const dataSourceOptions: DataSourceOptions = {
    type: 'mongodb',
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/fdtelecom',
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/migrations/*.js'],
    synchronize: true,
    logging: false,
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
