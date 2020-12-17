import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  ViewChild,
  Injectable,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Sort } from '@angular/material/sort';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Column,
  ColumnActionType,
  ColumnFilterType,
  IdColumnMap,
  Side,
  RowService,
  ColumnSort,
  ColumnSortDirection,
} from './table.interface';
import { UtilsService } from '@biosimulations/shared/services';
import lunr from 'lunr';
import { ActivatedRoute, Router } from '@angular/router';

// TODO fix datasource / loading functionality
@Injectable()
export class TableDataSource extends MatTableDataSource<any> {
  isLoading = new BehaviorSubject(true);

  constructor() {
    super();

    this.data = [];
    this.isLoading.next(true);
  }

  isLoading$(): Observable<boolean> {
    return this.isLoading.asObservable();
  }

  refresh(): void {}
}

interface ColumnFilterSearchState {
  filter?: { [id: string]: any[] },
  searchQuery?: string,
  showColumns?: { [id: string]: boolean },
  openControlPanelId?: number,
}

@Component({
  selector: 'biosimulations-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  providers: [TableDataSource],
})
export class TableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatTable) table!: MatTable<any>;
  @ViewChild(MatPaginator) private paginator!: MatPaginator;
  @ViewChild(MatSort) private sort!: MatSort;

  private _columns!: Column[];
  showColumns!: { [id: string]: boolean };
  columnsToShow!: string[];
  private idToColumn!: IdColumnMap;
  columnFilterData!: { [id: string]: any };
  isLoading!: Observable<boolean>;
  private isLoaded!: Observable<boolean>;
  private filter: { [id: string]: any[] } = {};
  columnIsFiltered: { [id: string]: boolean } = {};
  columnFilterChanging = false;

  private fullTextIndex!: any;
  private fullTextMatches!: { [index: number]: boolean };

  @Input()
  defaultSort!: ColumnSort;

  @Input()
  linesPerRow = 1;

  @Input()
  set columns(columns: Column[]) {
    this._columns = columns;
    this.columnFilterData = {};
    this.showColumns = {};
    columns.forEach((column: Column): void => {
      this.showColumns[column.id] = column.show !== false;
    });
    this.setColumnsToShow();

    columns.forEach((column: Column, iColumn: number): void => {
      column._index = iColumn;
    });

    this.idToColumn = columns.reduce(
      (map: { [id: string]: Column }, col: Column) => {
        map[col.id] = col;
        return map;
      },
      {}
    );
  }

  get columns(): Column[] {
    return this._columns;
  }

  private _highlightRow!: (element: any) => boolean;

  @Input()
  set highlightRow(func: (element: any) => boolean) {
    this._highlightRow = func;
    this.setRowHighlighting(this.dataSource.data);
  }

  @Input()
  singleLineHeadings = false;

  @Input()
  sortable = true;

  @Input()
  controls = true;

  private subscription?: Subscription;

  @Input()
  set data(data: any) {
    if (data instanceof Observable) {
      this.subscription = data.subscribe((unresolvedData: any[]): void => {
        UtilsService.recursiveForkJoin(unresolvedData).subscribe(
          (resolvedData: any[] | undefined) => {
            if (resolvedData !== undefined) {
              this.setData(resolvedData);
            }
          }
        );
      });
    } else {
      UtilsService.recursiveForkJoin(data).subscribe(
        (resolvedData: any[] | undefined) => {
          if (resolvedData !== undefined) {
            this.setData(resolvedData);
          }
        }
      );
    }
  }

  setData(data: any[]): void {
    this.dataSource.isLoading.next(true);
    const sortedData = RowService.sortData(
      this.idToColumn,
      data,
      this.defaultSort
    );
    sortedData.forEach((datum: any, iDatum: number): void => {
      datum._index = iDatum;
    });

    this.setRowHighlighting(sortedData);

    sortedData.forEach((datum: any): void => {
      const cache: any = {};
      datum['_cache'] = cache;

      this.columns.forEach((column: Column): void => {
        const value = RowService.getElementValue(datum, column)
        cache[column.id] = {
          value: RowService.formatElementValue(
            value,
            column
          ),
          toolTip: RowService.formatElementToolTip(
            value,
            column
          ),
          left: {},
          center: {},
          right: {},
        };

        if (column.leftAction === ColumnActionType.routerLink) {
          const tmp = RowService.getElementRouterLink(
            datum,
            column,
            Side.left
          );
          cache[column.id].left['routerLink'] = tmp.routerLink;
          cache[column.id].left['fragment'] = tmp.fragment;
        } else if (column.leftAction === ColumnActionType.href) {
          cache[column.id].left['href'] = RowService.getElementHref(
            datum,
            column,
            Side.left
          );
        } else if (column.leftAction === ColumnActionType.click) {
          cache[column.id].left['click'] = RowService.getElementClick(
            column,
            Side.left
          );
        }
        cache[column.id].left['icon'] = RowService.getIcon(
          datum,
          column,
          Side.left
        );
        cache[column.id].left['iconTitle'] = RowService.getIconTitle(
          datum,
          column,
          Side.left
        );

        if (column.centerAction === ColumnActionType.routerLink) {
          const tmp = RowService.getElementRouterLink(datum, column, Side.center);
          cache[column.id].center['routerLink'] = tmp.routerLink;
          cache[column.id].center['fragment'] = tmp.fragment;
        } else if (column.centerAction === ColumnActionType.href) {
          cache[column.id].center['href'] = RowService.getElementHref(
            datum,
            column,
            Side.center
          );
        } else if (column.centerAction === ColumnActionType.click) {
          cache[column.id].center['click'] = RowService.getElementClick(
            column,
            Side.center
          );
        }
        // cache[column.id].center['icon'] = RowService.getIcon(datum, column, Side.center);
        // cache[column.id].center['iconTitle'] = RowService.getIconTitle(datum, column, Side.center);

        if (column.rightAction === ColumnActionType.routerLink) {
          const tmp = RowService.getElementRouterLink(datum, column, Side.right);
          cache[column.id].right['routerLink'] = tmp.routerLink;
          cache[column.id].right['fragment'] = tmp.fragment;
        } else if (column.rightAction === ColumnActionType.href) {
          cache[column.id].right['href'] = RowService.getElementHref(
            datum,
            column,
            Side.right
          );
        } else if (column.rightAction === ColumnActionType.click) {
          cache[column.id].right['click'] = RowService.getElementClick(
            column,
            Side.right
          );
        }
        cache[column.id].right['icon'] = RowService.getIcon(
          datum,
          column,
          Side.right
        );
        cache[column.id].right['iconTitle'] = RowService.getIconTitle(
          datum,
          column,
          Side.right
        );
      });
    });

    this.columns.forEach((column: Column): void => {
      switch (column.filterType) {
        case ColumnFilterType.number:
          this.columnFilterData[column.id] = this.getNumericColumnRange(
            sortedData,
            column
          );
          break;
        case ColumnFilterType.date:
          this.columnFilterData[column.id] = this.filter?.[column.id] || [null, null];
          break;
        default:
          this.columnFilterData[column.id] = this.getTextColumnValues(
            sortedData,
            column
          );
          break;
      }
    });

    // set up full text index
    const columns = this.columns;
    this.fullTextIndex = lunr(function (this: any) {
      this.ref('index');
      columns.forEach((column: Column): void => {
        this.field(column.heading.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-'));
      });

      sortedData.forEach((datum: any, iDatum: number): void => {
        const fullTextDoc: { index: string; [colId: string]: string } = {
          index: iDatum.toString(),
        };
        columns.forEach((column: Column): void => {
          fullTextDoc[
            column.heading.toLowerCase().replace(' ', '-')
          ] = RowService.getElementSearchValue(datum, column);
        });
        this.add(fullTextDoc);
      });
    });

    // set data for table
    this.dataSource.data = sortedData;
    this.dataSource.isLoading.next(false);

    // set filtering
    this.setDataSourceFilter();
  }

  constructor(public dataSource: TableDataSource, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.isLoading = this.dataSource.isLoading$();
    this.isLoaded = this.dataSource
      .isLoading$()
      .pipe(map((isloaded: boolean) => !isloaded));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.filter = {};
    this.columnIsFiltered = {};
    this.setDataSourceFilter();
    this.dataSource.filterPredicate = this.filterData.bind(this);
    this.dataSource.sort = this.sort;
    this.dataSource.sortData = (data: any[], sort: Sort) => {
      const columnSort: ColumnSort = {
        active: sort.active,
        direction: sort.direction ? ColumnSortDirection[sort.direction] : undefined,
      }
      return RowService.sortData(this.idToColumn, data, columnSort);
    };
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;

    this.route.fragment
      .subscribe((fragment: string): void => {
        if (fragment != null && !this.columnFilterChanging) {
          const state = this.parseFilterSearchQueryFragment(fragment);
          const searchQuery = state?.searchQuery;
          const filter = state?.filter;
          const showColumns = state?.showColumns;
          const openControlPanelId = state?.openControlPanelId;

          setTimeout(() => {

            if (searchQuery !== undefined) {
              this.searchQuery = searchQuery;
            }

            let filterChanged = false;
            if (filter !== undefined) {
              this.filter = filter;

              const columnIsFiltered: { [id: string]: boolean } = {};              
              this.columns.forEach((column: Column): void => {
                columnIsFiltered[column.id] = column.id in filter;
                if (columnIsFiltered[column.id]) {
                  switch (column.filterType) {
                    case ColumnFilterType.number:
                      if (filter[column.id][0] !== this.columnFilterData[column.id].minSelected) {
                        this.columnFilterData[column.id].minSelected = filter[column.id][0];
                        filterChanged = true;
                      }
                      if (filter[column.id][1] !== this.columnFilterData[column.id].maxSelected) {
                        this.columnFilterData[column.id].maxSelected = filter[column.id][1];
                        filterChanged = true;
                      }                      
                      break;
                    case ColumnFilterType.date: {
                      if (filter[column.id][0] != null) {
                        const date = new Date(filter[column.id][0]);
                        if (date !== filter[column.id][0]) {
                          filter[column.id][0] = date;
                          filterChanged = true;
                        }
                      }
                      if (filter[column.id][1] != null) {
                        const date = new Date(filter[column.id][1]);
                        if (date !== filter[column.id][1]) {
                          filter[column.id][1] = date;
                          filterChanged = true;
                        }
                      }
                      this.columnFilterData[column.id] = filter[column.id];
                      break;
                    }
                    default:
                      this.columnFilterData[column.id].forEach((val: any): void => {
                        const checked = filter[column.id].includes(val.value);
                        if (checked !== val.checked) {
                          val.checked = checked;
                          filterChanged = true;
                        }
                      });
                      break;
                  }
                }
              });
              this.columnIsFiltered = columnIsFiltered;              
            }

            if ((filter !== undefined || searchQuery !== undefined) && filterChanged) {
              this.setDataSourceFilter();
            }

            if (showColumns !== undefined) {
              this.showColumns = showColumns;
              this.setColumnsToShow();
            }

            if (openControlPanelId !== undefined) {
              this.openControlPanelId = openControlPanelId;
            }
          });
        }
        this.columnFilterChanging = false;
      });
  }

  buildFilterSearchQueryFragment(): string | undefined {
    const opts = new URLSearchParams();

    if (this.searchQuery) {
      opts.set('q', this.searchQuery);
    }

    this.columns.forEach((column: Column): void => {
      if (column.id in this.filter) {
        opts.set(column.id, JSON.stringify(this.filter[column.id]));
      }
    });

    this.columns.forEach((column: Column): void => {
      if (this.showColumns[column.id]) {
        opts.append('c', column.id);
      }
    });

    opts.set('p', this.openControlPanelId.toString());

    return opts.toString() || undefined;
  }

  parseFilterSearchQueryFragment(value: string): ColumnFilterSearchState {
    const opts = new URLSearchParams(value);

    const searchQuery = opts.get('q') || undefined;

    const filter: { [id: string]: any[] } = {};
    opts.forEach((val: string, key: string): void => {
      if (key !== 'q' && key !== 'c' && key != 'p' && key in this.showColumns) {
        try {
          filter[key] = JSON.parse(val);
        } catch (e) {} // eslint-disable-line no-empty
      }
    });

    const showColumns: {[id: string]: boolean} = {};
    this.columns.forEach((column: Column): void => {
      showColumns[column.id] = false;
    });
    opts.getAll('c').forEach((columnId: string): void => {
      if (columnId in showColumns) {
        showColumns[columnId] = true;
      }
    });

    let openControlPanelId: undefined | number = undefined;
    if (opts.get('p') != null) {
      try {
        openControlPanelId = parseInt(opts.get('p') as string);
      } catch (e) {} // eslint-disable-line no-empty
    }

    return {
      searchQuery,
      filter,
      showColumns,
      openControlPanelId,
    }
  }

  setRowHighlighting(rows: any[]) {
    rows.forEach((row: any): void => {
      if (this._highlightRow === undefined) {
        row['_highlight'] = false;
      } else {
        row['_highlight'] = this._highlightRow(row);
      }
    });
  }

  getTextColumnValues(data: any[], column: Column): any[] {
    const values: any[] = column.filterValues
      ? column.filterValues
      : data.map((datum: any): any => RowService.getElementFilterValue(datum, column));

    const formattedValuesMap: any = {};
    const allValues = new Set<any>();
    for (const value of values) {
      if (Array.isArray(value)) {
        for (const v of value) {
          const formattedV = RowService.formatElementFilterValue(v, column);
          if (formattedV != null && formattedV !== '') {
            formattedValuesMap[v] = formattedV;
            allValues.add(v);
          }
        }
      } else {
        const formattedValue = RowService.formatElementFilterValue(
          value,
          column
        );
        if (formattedValue != null && formattedValue !== '') {
          formattedValuesMap[value] = formattedValue;
          allValues.add(value);
        }
      }
    }

    const comparator = RowService.getFilterComparator(column);
    const formattedValuesArr = [];
    for (const value of allValues) {
      const formattedValue = {
        value: value,
        formattedValue: formattedValuesMap[value],
        checked: this.filter?.[column.id]?.includes(value) || false,
      };
      formattedValuesArr.push(formattedValue);
    }
    formattedValuesArr.sort((a: any, b: any): number => {
      return comparator(a.value, b.value);
    });

    if (column.filterSortDirection === ColumnSortDirection.desc) {
      formattedValuesArr.reverse();
    }

    return formattedValuesArr;
  }

  getNumericColumnRange(data: any[], column: Column): any {
    if (data.length === 0) {
      return { min: null, max: null, step: null, minSelected: null, maxSelected: null };
    }

    const range: any = {
      min: null,
      max: null,
      step: null,
      minSelected: null,
      maxSelected: null,
    };

    for (const datum of data) {
      const value = RowService.getElementFilterValue(datum, column);
      if (value == null || value === undefined) {
        continue;
      }

      if (range.min == null) {
        range.min = value;
        range.max = value;
      } else {
        if (value < range.min) {
          range.min = value;
        }
        if (value > range.max) {
          range.max = value;
        }
      }
    }

    if (range.min != null) {
      range.min = Math.floor(range.min);
      range.max = Math.ceil(range.max);
    }

    if (column.numericFilterStep !== undefined) {
      range.step = column.numericFilterStep;
    } else if (range.max === range.min) {
      range.step = 0;
    } else {
      range.step = Math.pow(
        10,
        Math.floor(Math.log10((range.max - range.min) / 1000))
      );
    }
    range.step = Math.max(1, range.step);

    if (column.id in this.filter) {
      range.minSelected = this.filter[column.id][0];
      range.maxSelected = this.filter[column.id][1];
    } else {
      range.minSelected = range.min;
      range.maxSelected = range.max;
    }

    return range;
  }

  filterSetValue(column: Column, value: any, show: boolean): void {
    if (show) {
      if (!(column.id in this.filter)) {
        this.filter[column.id] = [];
      }
      this.filter[column.id].push(value.value);
    } else {
      this.filter[column.id].splice(
        this.filter[column.id].indexOf(value.value),
        1
      );
      if (this.filter[column.id].length === 0) {
        delete this.filter[column.id];
      }
    }
    value.checked = show;
    this.columnIsFiltered[column.id] = column.id in this.filter;

    this.columnFilterChanging = true;
    this.router.navigate([], { fragment: this.buildFilterSearchQueryFragment() });

    this.setDataSourceFilter();
  }

  filterNumberValue(
    column: Column,
    fullRange: any,
    selectedRange: number[]
  ): void {
    if (
      fullRange.min === selectedRange[0] &&
      fullRange.max === selectedRange[1]
    ) {
      if (column.id in this.filter) {
        delete this.filter[column.id];
      }
    } else {
      this.filter[column.id] = selectedRange;
    }
    this.columnIsFiltered[column.id] = column.id in this.filter;

    this.columnFilterData[column.id].minSelected = selectedRange[0];
    this.columnFilterData[column.id].maxSelected = selectedRange[1];
    this.columnFilterChanging = true;
    this.router.navigate([], { fragment: this.buildFilterSearchQueryFragment() });
    this.setDataSourceFilter();
  }

  filterStartDateValue(
    column: Column,
    event: MatDatepickerInputEvent<Date>
  ): void {
    let min: any = null;
    let max: any = null;
    if (event.value == null) {
      if (column.id in this.filter) {
        if (this.filter[column.id][1] == null) {
          delete this.filter[column.id];
        } else {
          this.filter[column.id][0] = null;
          max = this.filter[column.id][1];
        }
      }
    } else {
      if (column.id in this.filter) {
        this.filter[column.id][0] = event.value;
      } else {
        this.filter[column.id] = [event.value, null];
      }
      min = this.filter[column.id][0];
      max = this.filter[column.id][1];
    }
    this.columnIsFiltered[column.id] = column.id in this.filter;
    this.columnFilterData[column.id] = [min, max];
    this.columnFilterChanging = true;
    this.router.navigate([], { fragment: this.buildFilterSearchQueryFragment() });
    this.setDataSourceFilter();
  }

  filterEndDateValue(
    column: Column,
    event: MatDatepickerInputEvent<Date>
  ): void {
    let min: any = null;
    let max: any = null;
    if (event.value == null) {
      if (column.id in this.filter) {
        if (this.filter[column.id][0] == null) {
          delete this.filter[column.id];
        } else {
          this.filter[column.id][1] = null;
        }
        min = this.filter[column.id][0];
      }
    } else {
      if (column.id in this.filter) {
        this.filter[column.id][1] = event.value;
      } else {
        this.filter[column.id] = [null, event.value];
      }
      min = this.filter[column.id][0];
      max = this.filter[column.id][1];
    }
    this.columnIsFiltered[column.id] = column.id in this.filter;
    this.columnFilterData[column.id] = [min, max];
    this.columnFilterChanging = true;
    this.router.navigate([], { fragment: this.buildFilterSearchQueryFragment() });
    this.setDataSourceFilter();
  }

  setDataSourceFilter(): void {
    // conduct full text search
    this.fullTextMatches = {};
    if (this.searchQuery) {
      this.fullTextIndex
        .search(this.searchQuery)
        .forEach((match: any): void => {
          this.fullTextMatches[parseInt(match.ref)] = true;
        });
    }

    // trigger table to filter data via calling the filterData method for each entry
    if (Object.keys(this.filter).length || this.searchQuery) {
      // Hack: alternate between value of 'a' and 'b' to force data source to filter the data
      if (this.dataSource.filter === 'a') {
        this.dataSource.filter = 'b';
      } else {
        this.dataSource.filter = 'a';
      }
    } else {
      this.dataSource.filter = '';
    }
  }

  filterData(datum: any, filter: string): boolean {
    /* filtering */
    for (const columnId in this.filter) {
      const column = this.idToColumn[columnId];

      let passesFilter;
      if (column.passesFilter === undefined) {
        passesFilter = this.passesColumnFilter.bind(this, column);
      } else {
        passesFilter = column.passesFilter;
      }

      const filterValue = this.filter[column.id];

      if (!passesFilter(datum, filterValue)) {
        return false;
      }
    }

    // full text search
    if (this.searchQuery) {
      if (!(datum._index in this.fullTextMatches)) {
        return false;
      }
    }

    /* return */
    return true;
  }

  passesColumnFilter(column: Column, datum: any, filterValue: any[]): boolean {
    const value = RowService.getElementFilterValue(datum, column);

    if (column.filterType === ColumnFilterType.number) {
      if (
        value == null ||
        value === undefined ||
        (filterValue[0] != null && value < filterValue[0]) ||
        (filterValue[1] != null && value > filterValue[1])
      ) {
        return false;
      }
    } else if (column.filterType === ColumnFilterType.date) {
      const startDate = filterValue[0];
      const endDate = filterValue[1];
      if (endDate != null) {
        endDate.setDate(endDate.getDate() + 1);
      }

      if (
        value == null ||
        value === undefined ||
        (startDate != null && value < startDate) ||
        (endDate != null && value >= endDate)
      ) {
        return false;
      }
    } else {
      if (Array.isArray(value)) {
        let match = false;
        for (const v of value) {
          if (filterValue.includes(v)) {
            match = true;
            break;
          }
        }
        if (!match) {
          return false;
        }
      } else {
        if (!filterValue.includes(value)) {
          return false;
        }
      }
    }

    return true;
  }

  clearFilter(column: Column): void {
    delete this.filter[column.id];
    for (const val of this.columnFilterData[column.id]) {
      val.checked = false;
    }
    this.columnIsFiltered[column.id] = false;
    this.columnFilterChanging = true;
    this.router.navigate([], { fragment: this.buildFilterSearchQueryFragment() });
    this.setDataSourceFilter();
  }

  toggleColumn(column: Column): void {
    this.showColumns[column.id] = this.showColumns[column.id] === false;
    this.setColumnsToShow();
    this.columnFilterChanging = true;
    this.router.navigate([], { fragment: this.buildFilterSearchQueryFragment() });
  }

  setColumnsToShow(): void {
    this.columnsToShow = [];
    Object.keys(this.showColumns).forEach((colId: string): void => {
      if (this.showColumns[colId]) {
        this.columnsToShow.push(colId);
      }
    });
  }

  refresh(): void {
    this.dataSource.refresh();
  }

  isObservable(value: any): boolean {
    return value instanceof Observable;
  }

  controlsOpen = true;

  toggleControls(): void {
    this.controlsOpen = !this.controlsOpen;
  }

  openControlPanelId = 3;

  openControlPanel(id: number): void {
    if (id != this.openControlPanelId) {
      this.openControlPanelId = id;
      this.columnFilterChanging = true;
      this.router.navigate([], { fragment: this.buildFilterSearchQueryFragment() });
    }
  }

  @Input()
  searchPlaceHolder!: string;

  @Input()
  searchToolTip!: string;

  searchQuery: string | undefined = undefined;

  searchRows(query: string): void {
    this.searchQuery = query.toLowerCase();
    this.columnFilterChanging = true;
    this.router.navigate([], { fragment: this.buildFilterSearchQueryFragment() });
    this.setDataSourceFilter();
  }
}
