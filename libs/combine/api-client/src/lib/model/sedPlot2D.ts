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
import { SedAxisScale } from './sedAxisScale';
import { SedCurve } from './sedCurve';

/**
 * Specifications for a 2D SED plot.
 */
export interface SedPlot2D {
  /**
   * Unique identifier within its parent SED document.
   */
  id: string;
  /**
   * Brief description.
   */
  name?: string;
  /**
   * List of the curves of the plot (tuples of x and y data).
   */
  curves: Array<SedCurve>;
  xScale: SedAxisScale;
  yScale: SedAxisScale;
  /**
   * Type of the plot.
   */
  _type: SedPlot2DType;
}
export enum SedPlot2DType {
  SedPlot2D = 'SedPlot2D',
}
