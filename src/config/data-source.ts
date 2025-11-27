

import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

config();

// Universal __dirname for both CommonJS and ESM
let _dirname: string;
try {
    // @ts-ignore
    _dirname = typeof __dirname !== 'undefined'
        ? __dirname
        // @ts-ignore
        : path.dirname(require('url').fileURLToPath(import.meta.url));
} catch {
    _dirname = process.cwd();
}

const isProduction = process.env.NODE_ENV === 'production';

export const dataSourceOptions: DataSourceOptions = {
    type: 'mongodb',
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/fdtelecom',
    entities: [path.join(_dirname, 'src', '**', '*.entity.{ts,js}')],
    migrations: [path.join(_dirname, 'src', 'migrations', '*.{ts,js}')],
    synchronize: false,
    logging: true,
    connectTimeoutMS: 30000,
    // Add extra options for MongoDB if needed
    // extra: {},
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
