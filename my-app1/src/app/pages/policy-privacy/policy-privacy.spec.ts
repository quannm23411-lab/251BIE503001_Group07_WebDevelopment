import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyPrivacy } from './policy-privacy';

describe('PolicyPrivacy', () => {
  let component: PolicyPrivacy;
  let fixture: ComponentFixture<PolicyPrivacy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyPrivacy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyPrivacy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
