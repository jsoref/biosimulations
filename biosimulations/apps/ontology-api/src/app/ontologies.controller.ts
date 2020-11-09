import { Controller, Get } from '@nestjs/common';

import { edamTerms } from '@biosimulations/ontology/sources';
import { Ontologies } from '@biosimulations/datamodel/common';
import { ApiTags } from '@nestjs/swagger';
@Controller()
@ApiTags('Info')
export class OntologiesController {
  constructor() {}

  @Get('/list')
  ontologyList() {
    return Ontologies;
  }
}
