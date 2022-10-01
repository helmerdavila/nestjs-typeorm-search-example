import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pet } from './entities/pet';
import { Owner } from './entities/owner';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'mysql',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'demo_db',
      entities: [Pet, Owner],
      logging: true,
      // Never use this, only for demo purposes
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Pet, Owner]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
