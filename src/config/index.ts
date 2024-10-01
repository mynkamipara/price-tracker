import * as dotenv from 'dotenv';

dotenv.config();

interface HttpConfig {
    host: string;
    port: number;
}

interface AppConfig {
    name: string;
    globalPrefix: string;
    language: string;
    http: HttpConfig;
    timezone: string;
    locale: string;
}

interface Logging {
    timestampFormat: string;
    logDataConsole: boolean;
}

interface SwaggerContact {
    name: string;
    url: string;
    email: string;
}

interface Swagger {
    enabled: boolean;
    endpoint: string;
    title: string;
    description: string;
    version: string;
    contact: SwaggerContact;
}

interface EmailCredentials {
    user: string;
    password: string;
    support_email: string;
}

interface External {
   coin_market_base_url: string;
   coin_market_api_key: string;
}




interface Config {
    env: string;
    logging: Logging;
    instrumentation: {
        enabled: boolean;
        debug: boolean;
    };
    appConfig: AppConfig;
    swagger: Swagger;
    email: EmailCredentials;
    external: External;
}

export const config: Config = {
    env: process.env.NODE_ENV || 'development',
    appConfig: {
        name: process.env.APP_NAME || 'tracker-api',
        globalPrefix: process.env.APP_GLOBAL_PREFIX || 'api',
        language: process.env.LANGUAGE || 'en',
        http: {
            host: process.env.HOST || '0.0.0.0',
            port: parseInt(process.env.PORT) || 3000,
        },
        timezone: process.env.TZ || 'UTC',
        locale: process.env.LOCALE || 'es-EC',
    },
    logging: {
        timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS',
        logDataConsole: false,
    },
    instrumentation: {
        enabled: false,
        debug: process.env.DEBUG === 'true' || false,
    },
    swagger: {
        enabled: true,
        title: 'Tracker API',
        description: `Tracker API`,
        version: '0.0.1',
        endpoint: 'api',
        contact: {
            name: 'Tracker',
            url: '',
            email: '',
        },
    },
    email: {
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        support_email: process.env.SUPPORT_EMAIL,
    },
    external:{
        coin_market_base_url:process.env.COIN_MARKET_BASE_URL,
        coin_market_api_key:process.env.COIN_MARKET_API_KEY,
    }
};

export function bool(value: boolean | string): boolean {
    if (typeof value === 'boolean') {
        return value;
    }

    return value === 'true';
}
