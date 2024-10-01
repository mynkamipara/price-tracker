import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Prices } from './prices.entity';

@Entity()
export class Coins {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: '2f1f7f36-802d-4895-be3e-ff014f1acb6f' })
  id: number;

  @Column()
  @ApiProperty({ example: 'Ethereum' })
  name: string;

  @Column()
  @ApiProperty({ example: 'ETH' })
  symbol: string;

  @Column()
  @ApiProperty({ example: 'ethereum' })
  slug: string;

  @OneToMany(() => Prices, (node) => node.coin)
  prices: Prices[];

}
