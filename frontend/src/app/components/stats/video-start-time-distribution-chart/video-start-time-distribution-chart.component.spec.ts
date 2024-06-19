import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoStartTimeDistributionChartComponent } from './video-start-time-distribution-chart.component';

describe('VideoStartTimeDistributionChartComponent', () => {
  let component: VideoStartTimeDistributionChartComponent;
  let fixture: ComponentFixture<VideoStartTimeDistributionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoStartTimeDistributionChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoStartTimeDistributionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
