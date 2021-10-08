export * from './metadataOMEXMetadata.service';
import { MetadataOMEXMetadataService } from './metadataOMEXMetadata.service';
export * from './model.service';
import { ModelService } from './model.service';
export * from './simulationAlgorithmsKiSAO.service';
import { SimulationAlgorithmsKiSAOService } from './simulationAlgorithmsKiSAO.service';
export * from './simulationExecution.service';
import { SimulationExecutionService } from './simulationExecution.service';
export * from './simulationExperimentsSEDML.service';
import { SimulationExperimentsSEDMLService } from './simulationExperimentsSEDML.service';
export * from './simulationProjectsCOMBINEOMEXArchives.service';
import { SimulationProjectsCOMBINEOMEXArchivesService } from './simulationProjectsCOMBINEOMEXArchives.service';
export * from './validation.service';
import { ValidationService } from './validation.service';
export const APIS = [
  MetadataOMEXMetadataService,
  ModelService,
  SimulationAlgorithmsKiSAOService,
  SimulationExecutionService,
  SimulationExperimentsSEDMLService,
  SimulationProjectsCOMBINEOMEXArchivesService,
  ValidationService,
];
