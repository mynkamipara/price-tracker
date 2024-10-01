import { ApiProperty } from '@nestjs/swagger';

export class CreateCoinDto {
  @ApiProperty({ example: 'Ethereum' })
  name: string;

  @ApiProperty({ example: 'ETH', description: 'Symbol of the coin' })
  symbol: string;

  @ApiProperty({ example: 'ethereum', description: 'Slug of the coin' })
  slug: string;
}