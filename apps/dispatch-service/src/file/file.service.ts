import { Endpoints } from '@biosimulations/config/common';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

import { CombineWrapperService } from '../combineWrapper.service';
import {
  combineLatest,
  firstValueFrom,
  map,
  mergeMap,
  Observable,
  pluck,
} from 'rxjs';
import {
  CombineArchiveContent,
  CombineArchiveContentFile,
} from '@biosimulations/combine-api-client';
import {} from '@biosimulations/datamodel/common';
import { ProjectFile, SubmitProjectFile } from '@biosimulations/datamodel/api';
import { SimulationRunService } from '@biosimulations/dispatch/nest-client';

@Injectable()
export class FileService {
  private logger = new Logger(FileService.name);
  private endpoints: Endpoints;

  public constructor(
    private config: ConfigService,
    private combine: CombineWrapperService,
    private httpService: HttpService,
    private submit: SimulationRunService,
  ) {
    const env = config.get('server.env');
    this.endpoints = new Endpoints(env);
  }

  public async processFiles(id: string): Promise<void> {
    this.logger.log(`Processing files for ${id}`);
    const url = this.endpoints.getRunDownloadEndpoint(id, true);

    const files: Observable<ProjectFile[]> = this.combine
      .getManifest(undefined, url)
      .pipe(
        pluck('data'),
        pluck('contents'),
        map((combineFiles: CombineArchiveContent[]) => {
          const apiFiles: Observable<SubmitProjectFile>[] = combineFiles
            .filter((file: CombineArchiveContent) => file.location.path != '.')
            .map((file: CombineArchiveContent) => {
              const fileUrl = this.endpoints.getSimulationRunFileEndpoint(
                id,
                file.location.path,
              );
              // This is a silly way to get the filesize, but it works for now
              const apiFile = this.httpService.head(fileUrl).pipe(
                pluck('headers'),
                pluck('content-length'),
                map((size: number) => {
                  const fileObject: SubmitProjectFile = new ProjectFile(
                    id + '/' + file.location.path.replace('./', ''),
                    (file.location.value as CombineArchiveContentFile).filename,
                    id,
                    file.location.path.replace('./', ''),
                    size,
                    file.format,
                    fileUrl,
                    '',
                    '',
                  );
                  return fileObject;
                }),
              );
              return apiFile;
            });
          // Array of observables to observable of array
          return combineLatest(apiFiles);
        }),

        // collapse observables into one and post to API
        mergeMap((files: Observable<SubmitProjectFile[]>) => {
          return files.pipe(
            map((files: SubmitProjectFile[]) =>
              this.submit.postFiles(id, files),
            ),
          );
        }),
        mergeMap((files) => files),
      );

    const filesArray: ProjectFile[] = await firstValueFrom(files);
  }
}
