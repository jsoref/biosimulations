import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { IBreadCrumb } from './bread-crumbs.interface';
import { filter, distinctUntilChanged } from 'rxjs/operators';
@Component({
  selector: 'biosimulations-bread-crumbs',
  templateUrl: './bread-crumbs.component.html',
  styleUrls: ['./bread-crumbs.component.scss'],

})


export class BreadCrumbsComponent implements OnInit {


  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);

  }

  public breadcrumbs: IBreadCrumb[] = []

  @Input()
  color = '#bcdffb'

  @Input()
  pad = true
  buildBreadCrumb(route: ActivatedRoute, url: string = '', breadcrumbs: IBreadCrumb[] = []): IBreadCrumb[] {

    let label =
      route.routeConfig && route.routeConfig.data
        ? route.routeConfig.data.breadcrumb : null
    let path =
      route.routeConfig && route.routeConfig.path ? route.routeConfig.path : '';


    const lastRoutePart = path.split('/').pop() || path;




    const setRoute = (paramName: string, part: string,) => {

      if (!!route.snapshot) {
        path = path.replace(part, route.snapshot.params[paramName]);
        label = label ? label + ' ' + route.snapshot.params[paramName] : route.snapshot.params[paramName];
        console.log(label)
      }
    }

    if (lastRoutePart.startsWith(':')) {
      setRoute(lastRoutePart.split(':')[1], lastRoutePart)

    }






    const nextUrl = path ? `${url}/${path}` : url;

    const breadcrumb: IBreadCrumb = {
      label,
      url: nextUrl
    };

    const newBreadcrumbs = breadcrumb.label
      ? [...breadcrumbs, breadcrumb]
      : [...breadcrumbs];
    if (route.firstChild) {

      return this.buildBreadCrumb(route.firstChild, nextUrl, newBreadcrumbs);
    }
    return newBreadcrumbs;
  }

  ngOnInit(): void {

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      distinctUntilChanged(),
    ).subscribe(() => {
      this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
    })

  }

}
