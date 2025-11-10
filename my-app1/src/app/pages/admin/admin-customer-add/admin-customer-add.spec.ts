import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCustomerAdd } from './admin-customer-add';

describe('AdminCustomerAdd', () => {
  let component: AdminCustomerAdd;
  let fixture: ComponentFixture<AdminCustomerAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCustomerAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCustomerAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
