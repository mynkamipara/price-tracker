import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
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

  // Create Alert for notify your target price
  async createAlert(chain, price, email) {
    const coin = await this.coinRepository.findOne({ where: { slug: chain } });
    if (!coin || !VALID_COIN_SLUG.includes(coin?.slug)) {
      throw new BadRequestException('Invlaid slug');
    }
    const alert = new Alert();
    alert.coin = coin;
    alert.price = price;
    alert.email = email;
    return this.alertRepository.save(alert);
  }

  // return all or get by slug coin info with price within 24hours
  async findAll(slug?: string) {
    if (slug && !VALID_COIN_SLUG.includes(slug)) {
      throw new BadRequestException('Invlaid slug');
    }
    if (slug && VALID_COIN_SLUG.includes(slug)) {
      return await this.getCoinPricesWithInDay(slug);
    }
    const ether = await this.getCoinPricesWithInDay(VALID_COIN_SLUG[0]);
    const polygon = await this.getCoinPricesWithInDay(VALID_COIN_SLUG[1]);
    return [ether, polygon];
  }

  @Cron('*/5 * * * *') // Every 5 minutes to fetch coin price
  async handleCronToGetCoinPrice() {
    this.logger.info('Run Cron for get coin information')
    const slugs = ['ethereum', 'polygon'];
    const convertCurrency = 'USD';
    const ether = await this.coinRepository.findOne({ where: { slug: 'ethereum' } });
    const polygon = await this.coinRepository.findOne({ where: { slug: 'polygon' } });

    try {
      const data = await fetchPrices(slugs, convertCurrency);
      const etherData: any = Object.values(data).find((coin: any) => coin.slug == 'ethereum');
      const polygonData: any = Object.values(data).find((coin: any) => coin.slug == 'polygon');

      const priceList = [];

      const ethPrice = new Prices();
      ethPrice.price = etherData.quote.USD.price;
      ethPrice.percent_change_1h = etherData.quote.USD.percent_change_1h;
      ethPrice.percent_change_24h = etherData.quote.USD.percent_change_24h;
      ethPrice.timestamp = moment().startOf('minutes').toDate();
      ethPrice.coin = ether;
      priceList.push(ethPrice);

      const polygonPrice = new Prices();
      polygonPrice.price = polygonData.quote.USD.price;
      polygonPrice.percent_change_1h = polygonData.quote.USD.percent_change_1h;
      polygonPrice.percent_change_24h = polygonData.quote.USD.percent_change_24h;
      polygonPrice.timestamp = moment().startOf('minutes').toDate();
      polygonPrice.coin = polygon;
      priceList.push(polygonPrice);

      await this.priceRepository.save(priceList);

      // Check Ethereum and Polygon price increases by more than 3% compared to one hour ago
      await this.checkPriceAlerts(ethPrice);
      await this.checkPriceAlerts(polygonPrice);

      await this.checkAlertTargetPrice(ethPrice);
      await this.checkAlertTargetPrice(polygonPrice);

    } catch (error) {
      this.logger.error(error);
    }
  }

  async getCoinPricesWithInDay(slug) {
    const twentyFourHoursAgo = moment().subtract(24, 'hours').toDate();
    const coininfo = await this.coinRepository.findOne({ where: { slug: slug } });
    let coinPrices = await this.priceRepository.find({
      where: { coin: coininfo, timestamp: MoreThan(twentyFourHoursAgo) },
      order: { timestamp: 'DESC' },
    });

    const hourlyPricesMap = {};

    // Iterate over filtered prices to get the latest for each hour
    coinPrices.forEach((price: any) => {
      const hour = moment(price.timestamp).startOf('hour').format('YYYY-MM-DD hh:mm a');
      hourlyPricesMap[hour] = parseFloat(price.price);
    });

    // Convert the map into an array
    let hourlyPricesArray = Object.keys(hourlyPricesMap).map(hour => ({
      time: hour,
      price: hourlyPricesMap[hour],
    }));

    // Sort by time
    hourlyPricesArray = hourlyPricesArray.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    return {
      ...coininfo,
      prices: hourlyPricesArray,
    };

  }

  private async checkAlertTargetPrice(priceCoin: Prices) {
    const findAlerts = await this.alertRepository.find({ where: { coin_id: priceCoin.coin_id, is_achive: false } });
    console.log('findAlerts: ', findAlerts);

    for (let alert of findAlerts) {
      if (alert.price <= priceCoin.price) {
        // Send Email for target achived
        await this.emailService.sendEmail(alert.email, 'Your target is Achived.', `Your target for ${priceCoin.coin.name} at $${alert.price} Achived.`);

        // Update to target achived
        await this.alertRepository.update(alert, {
          is_achive: true
        })
      }
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
      const currentPrice = priceCoin.price;
      const percentChange = ((currentPrice - historicalPrice.price) / historicalPrice.price) * 100;
      
      if (percentChange > 3) {

        // Send an email for price increased by more than 3%
        await this.emailService.sendEmail(config.email.support_email, `${priceCoin.coin.name} Price increased by more than 3%`, `Price alert: ${priceCoin.coin.name} price increased by more than 3%. Current price: ${currentPrice}, Previous price: ${historicalPrice.price}`);

        this.logger.info(`Price alert: ${priceCoin.coin.slug} price increased by more than 3%. Current price: ${currentPrice}, Previous price: ${historicalPrice.price}`);
      }
    } else {
      this.logger.warn(`No historical price found for ${priceCoin.coin.slug} from the last hour.`);
    }
  }

}
