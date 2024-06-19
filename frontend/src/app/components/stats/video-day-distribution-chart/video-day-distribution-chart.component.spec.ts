import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoDayDistributionChartComponent } from './video-day-distribution-chart.component';

describe('VideoDayDistributionChartComponent', () => {
  let component: VideoDayDistributionChartComponent;
  let fixture: ComponentFixture<VideoDayDistributionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoDayDistributionChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoDayDistributionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
