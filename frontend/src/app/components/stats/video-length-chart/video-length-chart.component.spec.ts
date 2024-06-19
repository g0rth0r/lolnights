import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoLengthChartComponent } from './video-length-chart.component';

describe('VideoLengthChartComponent', () => {
  let component: VideoLengthChartComponent;
  let fixture: ComponentFixture<VideoLengthChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoLengthChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoLengthChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
