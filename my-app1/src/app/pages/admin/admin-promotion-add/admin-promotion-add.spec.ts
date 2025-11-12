import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPromotionAdd } from './admin-promotion-add';

describe('AdminPromotionAdd', () => {
  let component: AdminPromotionAdd;
  let fixture: ComponentFixture<AdminPromotionAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPromotionAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPromotionAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
