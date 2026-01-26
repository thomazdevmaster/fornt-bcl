import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedTableComponent } from './table';

describe('SharedTableComponent', () => {
  let component: SharedTableComponent;
  let fixture: ComponentFixture<SharedTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
