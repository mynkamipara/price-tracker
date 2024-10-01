import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Coins } from './coin.entity';

@Entity()
export class Prices {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: '2f1f7f36-802d-4895-be3e-ff014f1acb6f' })
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty({ example: 45000, description: 'Current price of the coin' })
  price: number;

  @Column()
  timestamp: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty({ example: 36.36, description: 'percent change in 1h' })
  percent_change_1h: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty({ example: 36.36, description: 'percent change in 24h' })
  percent_change_24h: number;

  @Column()
  coin_id: string;

  @ManyToOne(() => Coins)
  @JoinColumn({ name: 'coin_id' })
  coin: Coins;

}
