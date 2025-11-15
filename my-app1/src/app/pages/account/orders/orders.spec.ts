import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountOrders } from './orders';

describe('Orders', () => {
  let component: AccountOrders;
  let fixture: ComponentFixture<AccountOrders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountOrders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountOrders);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
