import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from '@biosimulations/shared/ui';
import { SharedVizUiModule } from '@biosimulations/shared/viz-ui';
import { SharedViewSimulationModule } from '@biosimulations/shared/view-simulation';
import { SharedDebugModule } from '@biosimulations/shared/debug';
import { BiosimulationsIconsModule } from '@biosimulations/shared/icons';
import { ProjectsRoutingModule } from './projects-routing.module';
import { ViewComponent } from './view/view.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ProjectCardComponent } from './project-card/project-card.component';
import { BrowseComponent } from './browse/browse.component';
import { ProjectOverviewComponent } from './project-overview/project-overview.component';
import { SharedErrorComponentsModule } from '@biosimulations/shared/error-handler';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  declarations: [
    ViewComponent,
    ProjectCardComponent,
    BrowseComponent,
    ProjectOverviewComponent,
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    MatTabsModule,
    SharedUiModule,
    SharedVizUiModule,
    SharedViewSimulationModule,
    BiosimulationsIconsModule,
    SharedDebugModule,
    SharedErrorComponentsModule,
    LazyLoadImageModule,
  ],
})
export class ProjectsModule {}
