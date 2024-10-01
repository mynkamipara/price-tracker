import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config as dotenvConfig } from 'dotenv';
import { CoinsModule } from 'src/modules/coins/coins.module';
import { Coins } from 'src/modules/coins/entities/coin.entity';
import { Prices } from './modules/coins/entities/prices.entity';
import { Alert } from './modules/coins/entities/alert.entity';
import { ScheduleModule } from '@nestjs/schedule';
dotenvConfig({ path: '.env' });

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      schema: process.env.DB_SCHEMA,
      entities: [
        Coins,
        Prices,
        Alert
      ],
      synchronize: false,
      retryAttempts: 1,
      retryDelay: 3000, 
    }),
    CoinsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
