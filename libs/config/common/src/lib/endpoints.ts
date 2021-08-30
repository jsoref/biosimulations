import { environment } from '@biosimulations/shared/environments';

export type endpoints =
  | 'simulationRuns'
  | 'simulationRunResults'
  | 'simulationRunLogs'
  | 'simulationRunMetadata'
  | 'simulationRunDownload'
  | 'simulationRunResultsDownload'
  | 'simulators';

type endpointMap = { [key in endpoints]: string };

const baseUrl = environment.baseUrl;

export const Endpoints: endpointMap = {
  simulationRuns: `${baseUrl}/runs`,
  simulationRunResults: `${baseUrl}/results`,
  simulationRunLogs: `${baseUrl}/logs`,
  simulationRunMetadata: `${baseUrl}/metadata`,
  simulationRunDownload: `${baseUrl}/runs/download`,
  simulationRunResultsDownload: `${baseUrl}/results/download`,
  simulators: `${baseUrl}/simulators`,
};
