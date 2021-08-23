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
import { SedModelChange } from './sedModelChange';

/**
 * A SED model.
 */
export interface SedModel {
  /**
   * Unique identifier within its parent SED document.
   */
  id: string;
  /**
   * Brief description.
   */
  name?: string;
  /**
   * A SED URN for a model language.  The full list of recognized values is available at http://sed-ml.org/urns.html.
   */
  language: string;
  /**
   * Location of the file for the model.
   */
  source: string;
  /**
   * Type.
   */
  _type: SedModelType;
  /**
   * Changes to the model.
   */
  changes: Array<SedModelChange>;
}
export enum SedModelType {
  SedModel = 'SedModel',
}
