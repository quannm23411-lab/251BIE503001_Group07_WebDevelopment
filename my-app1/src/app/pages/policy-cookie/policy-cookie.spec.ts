import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyCookie } from './policy-cookie';

describe('PolicyCookie', () => {
  let component: PolicyCookie;
  let fixture: ComponentFixture<PolicyCookie>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyCookie]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyCookie);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
