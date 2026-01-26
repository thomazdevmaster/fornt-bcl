import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicianComponent } from './musicians';

describe('MusicianComponent', () => {
  let component: MusicianComponent;
  let fixture: ComponentFixture<MusicianComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicianComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicianComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
