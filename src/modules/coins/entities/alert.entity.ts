import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Coins } from './coin.entity';

@Entity()
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  coin_id: string;

  @Column('decimal')
  price: number;

  @Column()
  email: string;

  @Column()
  is_achive: boolean;

  @ManyToOne(() => Coins)
  @JoinColumn({ name: 'coin_id' })
  coin: Coins;
}
