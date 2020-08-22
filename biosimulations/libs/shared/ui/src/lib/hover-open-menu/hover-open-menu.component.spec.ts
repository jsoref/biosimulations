import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverOpenMenuComponent } from './hover-open-menu.component';

describe('HoverOpenMenuComponent', () => {
  let component: HoverOpenMenuComponent;
  let fixture: ComponentFixture<HoverOpenMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HoverOpenMenuComponent],
      imports: [],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoverOpenMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
