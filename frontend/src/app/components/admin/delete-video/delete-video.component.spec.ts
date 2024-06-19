import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteVideoComponent } from './delete-video.component';

describe('DeleteVideoComponent', () => {
  let component: DeleteVideoComponent;
  let fixture: ComponentFixture<DeleteVideoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteVideoComponent]
    });
    fixture = TestBed.createComponent(DeleteVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
