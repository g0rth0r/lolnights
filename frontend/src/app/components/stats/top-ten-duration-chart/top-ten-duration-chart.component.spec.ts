import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopTenDurationChartComponent } from './top-ten-duration-chart.component';

describe('TopTenDurationChartComponent', () => {
  let component: TopTenDurationChartComponent;
  let fixture: ComponentFixture<TopTenDurationChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopTenDurationChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopTenDurationChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
