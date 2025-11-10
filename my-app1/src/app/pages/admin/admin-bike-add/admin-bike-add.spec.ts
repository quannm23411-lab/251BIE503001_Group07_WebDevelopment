import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBikeAdd } from './admin-bike-add';

describe('AdminBikeAdd', () => {
  let component: AdminBikeAdd;
  let fixture: ComponentFixture<AdminBikeAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBikeAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminBikeAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
