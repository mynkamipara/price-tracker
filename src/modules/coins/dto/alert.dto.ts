import { ApiProperty } from '@nestjs/swagger';

export class CreateAlertDto {
  @ApiProperty({ example: 'ethereum', description: 'coin slug ex.[ethereum,polygon]' })
  chain: string;

  @ApiProperty({ example: 1000, description: 'target price' })
  price: number;

  @ApiProperty({ example: 'abc@gmail.com', description: 'email' })
  email: string;
}