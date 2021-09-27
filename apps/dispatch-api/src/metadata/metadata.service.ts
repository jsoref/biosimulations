import {
  ArchiveMetadata,
  SimulationRunMetadataInput,
} from '@biosimulations/datamodel/api';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SimulationRunModel } from '../simulation-run/simulation-run.model';
import { SimulationRunMetadataModel } from './metadata.model';
import { Endpoints } from '@biosimulations/config/common';

@Injectable()
export class MetadataService {
  private endpoints;
  private logger: Logger = new Logger(MetadataService.name);
  public constructor(
    @InjectModel(SimulationRunMetadataModel.name)
    private metadataModel: Model<SimulationRunMetadataModel>,
    @InjectModel(SimulationRunModel.name)
    private simulationModel: Model<SimulationRunModel>,
    private config: ConfigService,
  ) {
    const env = config.get('server.env');
    this.endpoints = new Endpoints(env);
  }
  public async getAllMetadata(includePrivate = false) {
    const query = includePrivate ? {} : { isPublic: true };
    const metadta = await this.metadataModel.find(query).exec();

    return metadta;
  }

  public async getMetadata(id: string) {
    const metadata = await this.metadataModel
      .findOne({ simulationRun: id }, { id: 0, __v: 0 })
      .lean()
      .exec();

    return metadata;
  }

  public async createMetadata(data: SimulationRunMetadataInput) {
    const sim = await this.simulationModel.findById(data.id);
    if (!sim) {
      //throw new Error('Simulation not found');
    }

    const transformData = data.metadata.map(
      (archiveMetadata: ArchiveMetadata): ArchiveMetadata => {
        const currentUri = archiveMetadata.uri;
        if (currentUri.startsWith('./')) {
          archiveMetadata.uri = `${data.id}/${encodeURI(
            currentUri.substring(1),
          )}`;
        } else if (currentUri == '.') {
          archiveMetadata.uri = `${data.id}`;
        }
        const thumbnails = archiveMetadata.thumbnails;

        if (thumbnails.length > 0) {
          archiveMetadata.thumbnails = thumbnails.map((thumbnail: string) => {
            if (thumbnail.startsWith('./')) {
              // TODO change url of file on S3
              const endpoint = this.endpoints.getCombineFilesEndpoint(
                this.endpoints.getRunDownloadEndpoint(data.id, true),
                thumbnail,
                true,
              );

              return endpoint;
            }
            return thumbnail;
          });
        }
        return archiveMetadata;
      },
    );

    data.metadata = transformData;

    const metadata = new this.metadataModel(data);

    return await metadata.save();
  }
}
