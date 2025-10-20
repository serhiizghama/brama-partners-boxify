import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoxEntity } from '../../domain/boxes/box.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BoxEntity])],
})
export class BoxesModule { }
