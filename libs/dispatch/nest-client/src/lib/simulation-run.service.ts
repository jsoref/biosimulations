import {
  CombineArchiveLog,
  CreateSimulationRunLogBody,
  SimulationRun,
} from '@biosimulations/dispatch/api-models';
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Endpoints } from '@biosimulations/config/common';
import { AuthClientService } from '@biosimulations/auth/client';
import { pluck, map, mergeMap, retry, catchError } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import { SimulationRunStatus } from '@biosimulations/datamodel/common';
import {
  SubmitProjectFile,
  ProjectFile,
  SimulationRunSpecifications,
  SimulationRunMetadataInput,
  SimulationRunMetadata,
} from '@biosimulations/datamodel/api';
@Injectable({})
export class SimulationRunService {
  private endpoint = this.configService.get('urls').dispatchApi;
  private endpoints = new Endpoints();
  private logger = new Logger(SimulationRunService.name);
  public constructor(
    private auth: AuthClientService,
    private http: HttpService,
    private configService: ConfigService,
  ) {
    const env = this.configService.get('server.env');
    this.endpoints = new Endpoints(env);
  }

  public postMetadata(
    metadata: SimulationRunMetadataInput,
  ): Observable<SimulationRunMetadata> {
    const endpoint = this.endpoints.getSimulationRunMetadataEndpoint();
    return this.postAuthenticated<
      SimulationRunMetadataInput,
      SimulationRunMetadata
    >(endpoint, metadata);
  }

  public postSpecs(
    id: string,
    specs: SimulationRunSpecifications[],
  ): Observable<SimulationRunSpecifications[]> {
    const endpoint = this.endpoints.getSpecificationsEndpoint(id);
    return this.postAuthenticated<
      SimulationRunSpecifications[],
      SimulationRunSpecifications[]
    >(endpoint, specs);
  }

  public postFiles(
    id: string,
    files: SubmitProjectFile[],
  ): Observable<ProjectFile[]> {
    const body: SubmitProjectFile[] = files;
    const endpoint = this.endpoints.getFilesEndpoint();
    return this.postAuthenticated<SubmitProjectFile[], ProjectFile[]>(
      endpoint,
      body,
    );
  }
  public updateSimulationRunStatus(
    id: string,
    status: SimulationRunStatus,
    statusReason: string,
  ): Observable<SimulationRun> {
    const response = from(this.auth.getToken()).pipe(
      map((token) => {
        const httpRes = this.http
          .patch<SimulationRun>(
            `${this.endpoint}run/${id}`,
            {
              status,
              statusReason,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
          .pipe(pluck('data'));

        return httpRes;
      }),
      mergeMap((value) => value),
    );
    return response;
  }

  public updateSimulationRunResultsSize(
    id: string,
    size: number,
  ): Observable<SimulationRun> {
    return from(this.auth.getToken()).pipe(
      map((token) => {
        return this.http
          .patch<SimulationRun>(
            `${this.endpoint}run/${id}`,
            { resultsSize: size },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
          .pipe(
            catchError((err, caught) => {
              this.logger.error(err);
              return caught;
            }),
            retry(2),
            pluck('data'),
          );
      }),
      mergeMap((value) => value),
    );
  }
  // TODO convert to observable
  public async getJob(simId: string): Promise<SimulationRun> {
    const token = await this.auth.getToken();
    const res: Promise<SimulationRun> = this.http
      .get<SimulationRun>(`${this.endpoint}/run/${simId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(pluck('data'))
      .toPromise() as Promise<SimulationRun>;

    return res;
  }

  public sendLog(
    simId: string,
    log: CombineArchiveLog,
  ): Observable<CombineArchiveLog> {
    const body: CreateSimulationRunLogBody = {
      simId: simId,
      log: log,
    };
    const endpoint = this.endpoints.getSimulationRunLogsEndpoint();
    return this.postAuthenticated<
      CreateSimulationRunLogBody,
      CombineArchiveLog
    >(endpoint, body);
  }

  private postAuthenticated<T, U>(url: string, body: T): Observable<U> {
    return from(this.auth.getToken()).pipe(
      map((token) => {
        return this.http
          .post<U>(url, body, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .pipe(pluck('data'));
      }),
      mergeMap((value) => value),
    );
  }
}
