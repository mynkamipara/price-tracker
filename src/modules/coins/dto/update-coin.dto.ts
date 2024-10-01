import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCoinDto {
  @ApiPropertyOptional({ example: 'Ethereum' })
  name?: string;

  @ApiPropertyOptional({ example: 'ETH', description: 'Symbol of the coin' })
  symbol?: string;

  @ApiPropertyOptional({ example: 'ethereum', description: 'Slug of the coin' })
  slug?: string;
}
