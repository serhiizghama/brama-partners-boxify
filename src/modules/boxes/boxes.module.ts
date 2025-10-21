import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoxEntity } from '../../domain/boxes/entities/box.entity';
import { BoxesService } from './boxes.service';
import { BoxesController } from './boxes.controller';
import { BoxRepository } from './infrastructure/box.repository';
import { ProductRepository } from '../products/infrastructure/product.repository';
import { ProductEntity } from '../../domain/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BoxEntity, ProductEntity])],
  providers: [BoxesService, BoxRepository, ProductRepository],
  controllers: [BoxesController],
  exports: [BoxesService],
})
export class BoxesModule { }
