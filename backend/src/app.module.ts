import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ReservationModule } from './modules/reservation/reservation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGO_URI') ??
          config.get<string>('DB_LOCAL_URL') ??
          'mongodb://127.0.0.1:27017/la-luna',
      }),
    }),
    // One SQLite file for reservations. No separate database server.
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'data/la-luna.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    ReservationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
