/**
 * BioSimulations COMBINE service
 * Endpoints for working with COMBINE/OMEX archives and model (e.g., SBML) and simulation (e.g., SED-ML) files that they typically contain.  Note, this API may change significantly in the future.
 *
 * The version of the OpenAPI document: 0.1
 * Contact: info@biosimulations.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { SedOutputElementLog } from './sedOutputElementLog';
import { Exception } from './exception';

export interface SedPlot3DLog {
  id: string;
  status: SedPlot3DLogStatus;
  exception: Exception | null;
  skipReason: Exception | null;
  output: string | null;
  duration: number | null;
  surfaces: Array<SedOutputElementLog> | null;
}
export enum SedPlot3DLogStatus {
  Queued = 'QUEUED',
  Running = 'RUNNING',
  Skipped = 'SKIPPED',
  Succeeded = 'SUCCEEDED',
  Failed = 'FAILED',
  Unknown = 'UNKNOWN',
}
