import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOrderAdd } from './admin-order-add';

describe('AdminOrderAdd', () => {
  let component: AdminOrderAdd;
  let fixture: ComponentFixture<AdminOrderAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOrderAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminOrderAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
