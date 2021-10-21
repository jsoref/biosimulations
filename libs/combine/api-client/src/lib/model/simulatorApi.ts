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
 * BioSimulators API for a simulation tool.
 */
export interface SimulatorApi {
  _type: SimulatorApiType;
  /**
   * Python package which implements the BioSimulators API for the simulation tool (e.g., PyPI: biosimulators_tellurium, git+https://github.com/biosimulators/biosimulators_tellurium.git).
   */
  _package: string;
  /**
   * Python module which implements the BioSimulators API for the simulation tool.
   */
  module: string;
  /**
   * Version of the API of the simulation tool.
   */
  version: string;
}
export enum SimulatorApiType {
  SimulatorApi = 'SimulatorApi',
}
