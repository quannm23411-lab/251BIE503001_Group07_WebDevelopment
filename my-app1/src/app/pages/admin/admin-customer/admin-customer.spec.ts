import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCustomer } from './admin-customer';

describe('AdminCustomer', () => {
  let component: AdminCustomer;
  let fixture: ComponentFixture<AdminCustomer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCustomer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCustomer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
