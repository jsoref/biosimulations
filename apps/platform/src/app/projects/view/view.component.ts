import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTabChangeEvent } from '@angular/material/tabs';
// import { SimulationRun } from '@biosimulations/dispatch/api-models';
import { Observable, combineLatest, map } from 'rxjs';
import { ProjectMetadata, Directory, File, List, VisualizationList, Visualization } from './view.model';
import { ViewService } from './view.service';
import { ProjectVisualizationComponent } from '../project-visualization/project-visualization.component';

@Component({
  selector: 'biosimulations-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {
  public loaded$!: Observable<true>;
  
  public id!: string;

  public projectMetadata$?: Observable<ProjectMetadata | undefined> = undefined;
  public simulationRun$?: Observable<List[]>;
  
  public projectFiles$?: Observable<(Directory | File)[]>;
  public files$?: Observable<(Directory | File)[]>;
  public outputs$?: Observable<File[]>;

  public visualizations$?: Observable<VisualizationList[]>;
  public visualization: Visualization | null = null;

  @ViewChild(ProjectVisualizationComponent)
  private visualizationComponent!: ProjectVisualizationComponent;
  
  constructor(private service: ViewService, private route: ActivatedRoute) {}
  
  public ngOnInit(): void {
    const id = this.id = this.route.snapshot.params['id'];
    
    this.projectMetadata$ = this.service.getFormattedProjectMetadata(id);
    this.simulationRun$ = this.service.getFormattedSimulationRun(id);

    this.projectFiles$ = this.service.getFormattedProjectFiles(id);
    this.files$ = this.service.getFormattedFiles(id);
    this.outputs$ = this.service.getFormattedOutputs(id);

    this.visualizations$ = this.service.getVisualizations(id);

    this.loaded$ = combineLatest(
      this.projectMetadata$,
      this.simulationRun$, 
      this.projectFiles$,
      this.files$,
      this.outputs$,
      this.visualizations$,
    ).pipe(
      map((observables: any) => {
        return true;
      }),
    );
  }

  selectedTabIndex = 0;
  viewVisualizationTabDisabled = true;
  selectVisualizationTabIndex = 2;
  visualizationTabIndex = 3;

  public renderVisualization(visualization: Visualization): void {    
    this.visualization = visualization;
    this.viewVisualizationTabDisabled = false;
    this.selectedTabIndex = this.visualizationTabIndex;    
  }

  public selectedTabChange($event: MatTabChangeEvent): void {
    if ($event.index == this.visualizationTabIndex) {
      if (this.viewVisualizationTabDisabled) {
        this.selectedTabIndex = this.selectVisualizationTabIndex;
        return;
      }
    }
    this.selectedTabIndex = $event.index;
  }
}
