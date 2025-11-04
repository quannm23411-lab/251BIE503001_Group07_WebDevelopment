import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSignUp } from './form-sign-up';

describe('FormSignUp', () => {
  let component: FormSignUp;
  let fixture: ComponentFixture<FormSignUp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSignUp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormSignUp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
