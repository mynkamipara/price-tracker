import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, In } from 'typeorm';
import { Coins } from './entities/coin.entity';
import { Prices } from './entities/prices.entity';
import { Cron } from '@nestjs/schedule';
import { Logger } from 'src/logging/Logger';
import * as moment from 'moment';
import { VALID_COIN_SLUG } from 'src/utils/const';
import { Alert } from './entities/alert.entity';
import { fetchPrices } from 'src/utils';
import { EmailService } from 'src/services/EmailService';
import { config } from 'src/config';

interface PriceQuote {
  USD: {
    price: number;
    percent_change_1h: number;
    percent_change_24h: number;
  };
}

interface PriceData {
  quote: PriceQuote;
}

@Injectable()
export class CoinsService {
  private readonly logger = new Logger('PriceTracking');

  constructor(
    @InjectRepository(Coins)
    private readonly coinRepository: Repository<Coins>,
    @InjectRepository(Prices)
    private readonly priceRepository: Repository<Prices>,
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,

    private readonly emailService: EmailService,

  ) { }

  private async findCoinBySlug(slug: string) {
    return this.coinRepository.findOne({ where: { slug } });
  }

  private validateCoinSlug(slug: string) {
    if (!slug || !VALID_COIN_SLUG.includes(slug)) {
      throw new BadRequestException('Invalid slug');
    }
  }

  private buildAlertRecord(coin: Coins, price: number, email: string): Alert {
    const alert = new Alert();
    alert.coin = coin;
    alert.price = price;
    alert.email = email;
    return alert;
  }

  private buildPriceRecord(coin: Coins, priceData: PriceData): Prices {
    const price = new Prices();
    price.price = priceData.quote.USD.price;
    price.percent_change_1h = priceData.quote.USD.percent_change_1h;
    price.percent_change_24h = priceData.quote.USD.percent_change_24h;
    price.timestamp = moment().startOf('minutes').toDate();
    price.coin = coin;
    return price;
  }


  // Create Alert for notify your target price
  async createAlert(chain: string, price: number, email: string) {
    const coin = await this.findCoinBySlug(chain);
    this.validateCoinSlug(coin?.slug);
    const alert = this.buildAlertRecord(coin, price, email);
    return this.alertRepository.save(alert);
  }

  // return all or get by slug coin info with price within 24hours
  async findAll(slug?: string) {
    if(slug){
      this.validateCoinSlug(slug);
      return this.getCoinPricesWithInDay(slug);
    }
    return Promise.all([
      this.getCoinPricesWithInDay(VALID_COIN_SLUG[0]),
      this.getCoinPricesWithInDay(VALID_COIN_SLUG[1])
    ]);
  }

  @Cron('*/5 * * * *') // Every 5 minutes
  async handleCronToGetCoinPrice() {
    this.logger.info('Run Cron for get coin information');
    const slugs = ['ethereum', 'polygon'];
    try {
      const data = await fetchPrices(slugs, 'USD');
      await Promise.all(slugs.map(slug => this.processCoinData(slug, data)));
    } catch (error) {
      this.logger.error('Error fetching prices', error);
    }
  }

  private async processCoinData(slug: string, data: PriceData) {
    const coin = await this.findCoinBySlug(slug);
    const priceData = Object.values(data).find((coin: Coins) => coin.slug === slug);
    const priceRecord = this.buildPriceRecord(coin, priceData);
    await this.priceRepository.save(priceRecord);
    await Promise.all([
      this.checkPriceAlerts(priceRecord),
      this.checkAlertTargetPrice(priceRecord)
    ]);
  }

  async getCoinPricesWithInDay(slug: string) {
    const twentyFourHoursAgo = moment().subtract(24, 'hours').toDate();
    const coin = await this.findCoinBySlug(slug);
    const coinPrices = await this.priceRepository.find({
      where: { coin, timestamp: MoreThan(twentyFourHoursAgo) },
      order: { timestamp: 'DESC' },
    });

    const hourlyPrices = this.buildHourlyPrices(coinPrices);
    return { ...coin, prices: hourlyPrices };
  }

  private buildHourlyPrices(coinPrices: Prices[]): { time: string; price: number }[] {
    const hourlyPricesMap: Record<string, number> = {};
    coinPrices.forEach((price: Prices) => {
      const hour = moment(price.timestamp).startOf('hour').format('YYYY-MM-DD hh:mm a');
      hourlyPricesMap[hour] = price.price;
    });
    return Object.entries(hourlyPricesMap)
      .map(([time, price]) => ({ time, price }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }

  private async checkAlertTargetPrice(priceCoin: Prices) {
    const findAlerts = await this.alertRepository.find({ where: { coin_id: priceCoin.coin_id, is_achive: false } });
    const alertsToUpdate = [];
    const emailPromises = [];

    for (const alert of findAlerts) {
      if (alert.price <= priceCoin.price) {
        // Send Email for target achived
        emailPromises.push(this.emailService.sendEmail(alert.email, 'Your target is Achived.', `Your target for ${priceCoin.coin.name} at $${alert.price} Achived.`));
        alertsToUpdate.push(alert.id);
      }
    }

    // Sending email at once
    await Promise.all(emailPromises);

    if (alertsToUpdate.length > 0) {
      // Update to target achived
      await this.alertRepository.update({ id: In(alertsToUpdate) }, { is_achive: true });
    }
  }

  private async checkPriceAlerts(priceCoin: Prices) {
    const oneHourAgo = moment(priceCoin.timestamp).subtract(1, 'hour').toDate();

    const historicalPrice = await this.priceRepository.findOne({
      where: [
        {
          coin_id: priceCoin.coin_id,
          timestamp: LessThan(oneHourAgo),
        }
      ],
      order: { timestamp: 'DESC' },
    });

    if (historicalPrice) {
      const percentChange = ((priceCoin.price - historicalPrice.price) / historicalPrice.price) * 100;
      if (percentChange > 3) {

        // Send an email for price increased by more than 3%
        await this.emailService.sendEmail(config.email.support_email, `${priceCoin.coin.name} Price increased by more than 3%`, `Price alert: ${priceCoin.coin.name} price increased by more than 3%. Current price: ${priceCoin.price}, Previous price: ${historicalPrice.price}`);

        this.logger.info(`Price alert: ${priceCoin.coin.slug} price increased by more than 3%. Current price: ${priceCoin.price}, Previous price: ${historicalPrice.price}`);
      }
    } else {
      this.logger.warn(`No historical price found for ${priceCoin.coin.slug} from the last hour.`);
    }
  }

}
