import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { BoxStatus } from '../enums/box-status.enum';
import { ProductEntity } from '../../products/entities/product.entity';

@Entity('boxes')
@Unique(['label'])
export class BoxEntity {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'The unique identifier of the box' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'BOX-001', description: 'The unique label of the box' })
  @Column({ type: 'varchar', length: 32 })
  label!: string;

  @ApiProperty({ enum: BoxStatus, example: BoxStatus.CREATED, description: 'The status of the box' })
  @Column({
    type: 'enum',
    enum: BoxStatus,
    default: BoxStatus.CREATED,
  })
  status!: BoxStatus;

  @ApiProperty({ type: () => [ProductEntity], description: 'The products contained in the box' })
  @OneToMany(() => ProductEntity, (product) => product.box, {
    cascade: true,
  })
  products!: ProductEntity[];

  @ApiProperty({ description: 'The date and time the box was created' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at!: Date;

  @ApiProperty({ description: 'The date and time the box was last updated' })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at!: Date;
}
