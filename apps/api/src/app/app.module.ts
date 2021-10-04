import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { ConfigService } from '@nestjs/config';
import { BiosimulationsConfigModule } from '@biosimulations/config/nest';
import { MongooseModule } from '@nestjs/mongoose';

import { SimulationRunModule } from '../simulation-run/simulation-run.module';
import { SharedExceptionsFiltersModule } from '@biosimulations/shared/exceptions/filters';
import { ResultsModule } from '../results/results.module';
import { SharedNatsClientModule } from '@biosimulations/shared/nats-client';
import {
  AuthTestModule,
  BiosimulationsAuthModule,
} from '@biosimulations/auth/nest';
import { ImagesModule } from '../images/images.module';
import { LogsModule } from '../logs/logs.module';
import { SharedStorageModule } from '@biosimulations/shared/storage';
import { BullModule } from '@nestjs/bull';
import { MetadataModule } from '../metadata/metadata.module';
import { OntologiesModule } from '../ontologies/ontologies.module';
import { FilesModule } from '../files/files.module';
import { SpecificationsModule } from '../specifications/specifications.module';

@Module({
  imports: [
    BiosimulationsConfigModule,
    BiosimulationsAuthModule,
    ImagesModule,
    HttpModule,
    LogsModule,
    MongooseModule.forRootAsync({
      imports: [BiosimulationsConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('database.uri') || '',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [BiosimulationsConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('queue.host'),
          port: configService.get('queue.port'),
        },
      }),
      inject: [ConfigService],
    }),
    SimulationRunModule,
    ResultsModule,
    MetadataModule,
    OntologiesModule,
    SharedExceptionsFiltersModule,
    AuthTestModule,
    SharedNatsClientModule,
    SharedStorageModule,
    FilesModule,
    SpecificationsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
