import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoxEntity } from '../../domain/boxes/box.entity';
import { BoxesService } from './boxes.service';
import { BoxesController } from './boxes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BoxEntity])],
  providers: [BoxesService],
  controllers: [BoxesController],
  exports: [BoxesService],
})
export class BoxesModule { }
