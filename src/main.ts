import { NestApplication, NestFactory, Reflector } from '@nestjs/core';

import * as dotenv from 'dotenv';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Logger, initializeWinston } from 'src/logging/Logger';
import { config } from 'src/config';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ApplicationLogger } from 'src/logging/ApplicationLogger';
import { AllExceptionsFilter } from 'src/filters/all-exceptions-filter';
import { GlobalInterceptor } from 'src/interceptors/global.interceptor';
import { globalMiddleware } from 'src/middleware/global.middleware';
import { runMigrations } from './utils/run-migrations';

dotenv.config();

initializeWinston();
const logger = new Logger('Application');

async function bootstrap() {
  runMigrations(); // run migration
  
  const app: NestApplication = await NestFactory.create(
    AppModule,
    new FastifyAdapter({ trustProxy: true }),
    {
      logger:
        process.env.NODE_ENV === 'production' ? false : new ApplicationLogger(),
    },
  );

  app.enableCors();

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new GlobalInterceptor(new Reflector()));
  app.use(globalMiddleware);
  // app.useGlobalPipes(new ValidationPipe());

  // swagger configure
  setupOpenAPI(app);

  await app.listen(config.appConfig.http.port, config.appConfig.http.host);
  logger.debug(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch((e: Error) => logger.error(`Startup error: ${e}`, {}, e));

/**
 * Setup config for OpenAPI (Swagger)
 * @param app NestJS application
 */
function setupOpenAPI(app: NestApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle(config.swagger.title)
    .setDescription(config.swagger.description)
    .setVersion(config.swagger.version)
    .setContact(
      config.swagger.contact.name,
      config.swagger.contact.url,
      config.swagger.contact.email,
    )
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [],
  });
  const options: SwaggerCustomOptions = {
    swaggerOptions: {
      filter: true,
      showRequestDuration: true,
      persistAuthorization: true,
    },
  };
  SwaggerModule.setup(
    `${config.appConfig.globalPrefix}`,
    app,
    document,
    options,
  );
}
