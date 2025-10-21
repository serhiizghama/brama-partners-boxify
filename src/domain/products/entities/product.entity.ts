import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BoxEntity } from '../../boxes/entities/box.entity';

@Entity('products')
@Unique(['barcode'])
export class ProductEntity {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'The unique identifier of the product' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'My Awesome Product', description: 'The name of the product' })
  @Column({ type: 'varchar', length: 100 })
  @Index()
  name!: string;

  @ApiProperty({ example: 'PROD-12345678', description: 'The unique barcode of the product' })
  @Column({ type: 'varchar', length: 32 })
  @Index()
  barcode!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'The unique identifier of the box this product belongs to', nullable: true })
  @Column({ name: 'box_id', type: 'uuid', nullable: true })
  box_id: string | null;

  @ManyToOne(() => BoxEntity, (box) => box.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'box_id' })
  box?: BoxEntity | null;

  @ApiProperty({ description: 'The date and time the product was created' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;

  @ApiProperty({ description: 'The date and time the product was last updated' })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at!: Date;
}
