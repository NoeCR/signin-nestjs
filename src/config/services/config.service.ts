import * as fs from 'fs';
import { parse } from 'dotenv';

export class ConfigService {
    private readonly envConfig: { [key: string]: string };

    constructor() {
        const isDevelopmentEnv = process.env.NODE_ENV !== 'production';

        if (isDevelopmentEnv) {
            const envFilePath = `${process.cwd()}/.env`;

            if (!fs.existsSync(envFilePath)) {
                throw new Error(`file .env not exists in path: ${envFilePath}`);
            }

            this.envConfig = parse(fs.readFileSync(envFilePath));
        }
        else {
            this.envConfig = {
                PORT: process.env.PORT
            }
        }
    }

    get(key: string): string {
        return this.envConfig[key];
    }
}