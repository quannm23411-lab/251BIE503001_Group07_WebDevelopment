import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBike } from './admin-bike';

describe('AdminBike', () => {
  let component: AdminBike;
  let fixture: ComponentFixture<AdminBike>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBike]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminBike);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
