import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountReview } from './account-review';

describe('AccountReview', () => {
  let component: AccountReview;
  let fixture: ComponentFixture<AccountReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountReview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountReview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
