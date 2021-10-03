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
import { SubmitProjectFile, ProjectFile } from '@biosimulations/datamodel/api';
@Injectable({})
export class SimulationRunService {
  private endpoint = this.configService.get('urls').dispatchApi;
  private endpoints = new Endpoints();
  public constructor(
    private auth: AuthClientService,
    private http: HttpService,
    private configService: ConfigService,
  ) {
    const env = this.configService.get('server.env');
    this.endpoints = new Endpoints(env);
  }
  private logger = new Logger(SimulationRunService.name);

  // TODO implement and remvoe direct calls in other code
  public postMetadata() {
    throw new Error('Method not implemented.');
  }

  public postFiles(
    id: string,
    files: SubmitProjectFile[],
  ): Observable<ProjectFile[]> {
    const body: SubmitProjectFile[] = files;
    const endpoint = this.endpoints.getFilesEndpoint();

    const response = from(this.auth.getToken()).pipe(
      map((token) => {
        return this.http
          .post<ProjectFile[]>(`${endpoint}`, body, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .pipe(pluck('data'));
      }),
      mergeMap((value) => value),
    );

    return response;
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

    return from(this.auth.getToken()).pipe(
      map((token) => {
        return this.http
          .post(`${this.endpoint}logs/`, body, {
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
