import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Coins } from './entities/coin.entity';
import { CreateAlertDto } from './dto/alert.dto';
import { Alert } from './entities/alert.entity';
import { CommonApiResponse } from 'src/utils/ApiResponse';

@ApiTags('coins') // Group all Coin-related routes
@Controller('coins')
export class CoinsController {
  constructor(private readonly coinsService: CoinsService) { }

  @Get()
  @ApiOperation({ summary: 'Fetch All coins or a specific coin by slug' })
  @ApiResponse({ status: 200, description: 'Return coins.', type: [Coins] })
  @ApiQuery({ name: 'slug', required: false, description: 'Slug of the coin to filter by ex.[ethereum,polygon]', }) // Marking slug as optional
  async findAll(@Query('slug') slug?: string) {
    const coins = await this.coinsService.findAll(slug);
    return new CommonApiResponse(HttpStatus.OK, coins);
  }

  @Post('/setalert')
  @Post()
  @ApiOperation({ summary: 'Set an alert for a specific price' })
  @ApiResponse({ status: 201, description: 'Alert created successfully', type: Alert })
  async setAlert(@Body() createAlertDto: CreateAlertDto) {
    const { chain, price, email } = createAlertDto;
    await this.coinsService.createAlert(chain, price, email);
    return new CommonApiResponse(HttpStatus.OK, {});
  }

}
