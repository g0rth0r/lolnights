import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoMosaicComponent } from './video-mosaic.component';

describe('VideoMosaicComponent', () => {
  let component: VideoMosaicComponent;
  let fixture: ComponentFixture<VideoMosaicComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VideoMosaicComponent]
    });
    fixture = TestBed.createComponent(VideoMosaicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
