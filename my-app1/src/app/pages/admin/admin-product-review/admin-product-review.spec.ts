import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProductReview } from './admin-product-review';

describe('AdminProductReview', () => {
  let component: AdminProductReview;
  let fixture: ComponentFixture<AdminProductReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductReview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProductReview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
