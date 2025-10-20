import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoxEntity } from '../../domain/boxes/entities/box.entity';
import { BoxesService } from './boxes.service';
import { BoxesController } from './boxes.controller';
import { BoxRepository } from './infrastructure/box.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BoxEntity])],
  providers: [BoxesService, BoxRepository],
  controllers: [BoxesController],
  exports: [BoxesService],
})
export class BoxesModule { }
