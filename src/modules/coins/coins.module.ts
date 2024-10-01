import { Module } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { CoinsController } from './coins.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coins } from 'src/modules/coins/entities/coin.entity';
import { Prices } from './entities/prices.entity';
import { Alert } from './entities/alert.entity';
import { EmailService } from 'src/services/EmailService';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coins, Prices, Alert]),
  ],
  controllers: [CoinsController],
  providers: [CoinsService, EmailService],
})
export class CoinsModule {}
