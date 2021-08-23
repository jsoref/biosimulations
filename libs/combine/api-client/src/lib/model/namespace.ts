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

/**
 * Namespace
 */
export interface Namespace {
  /**
   * Prefix.
   */
  prefix?: string;
  /**
   * URI.
   */
  uri: string;
  /**
   * Type.
   */
  _type: NamespaceType;
}
export enum NamespaceType {
  Namespace = 'Namespace',
}
