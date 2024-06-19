import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoFrequenciesGraphComponent } from './video-frequencies-graph.component';

describe('VideoFrequenciesGraphComponent', () => {
  let component: VideoFrequenciesGraphComponent;
  let fixture: ComponentFixture<VideoFrequenciesGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoFrequenciesGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoFrequenciesGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
