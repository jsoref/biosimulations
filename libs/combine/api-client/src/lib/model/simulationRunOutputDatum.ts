/**
 * BioSimulations COMBINE service
 * Endpoints for working with models (e.g., [CellML](http://cellml.org/), [SBML](http://sbml.org/)), simulation experiments (e.g., [Simulation Experiment Description Language (SED-ML)](http://sed-ml.org/)), metadata ([OMEX Metadata](https://sys-bio.github.io/libOmexMeta/)), and simulation projects ([COMBINE/OMEX archives](https://combinearchive.org/)).  Note, this API may change significantly in the future.
 *
 * The version of the OpenAPI document: 0.1
 * Contact: info@biosimulations.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * Result of a dataset of a SED-ML report or a data generator involved in a SED-ML plot.
 */
export interface SimulationRunOutputDatum {
  /**
   * Type
   */
  _type: SimulationRunOutputDatumType;
  /**
   * Id of the datum
   */
  id: string;
  /**
   * Label of the datum.
   */
  label: string;
  /**
   * Name of the datum.
   */
  name?: string;
  /**
   * Shape of `values`.
   */
  shape?: string;
  /**
   * Data type of `values`.
   */
  type?: string;
  /**
   * Result of the datum.
   */
  values?: Array<any>;
}
export enum SimulationRunOutputDatumType {
  SimulationRunOutputDatum = 'SimulationRunOutputDatum',
}
