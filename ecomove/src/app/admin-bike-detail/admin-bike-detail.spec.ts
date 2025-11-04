import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBikeDetail } from './admin-bike-detail';

describe('AdminBikeDetail', () => {
  let component: AdminBikeDetail;
  let fixture: ComponentFixture<AdminBikeDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBikeDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminBikeDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
