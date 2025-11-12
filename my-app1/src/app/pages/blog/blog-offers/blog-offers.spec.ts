import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogOffersComponent } from './blog-offers';

describe('BlogOffers', () => {
  let component: BlogOffersComponent;
  let fixture: ComponentFixture<BlogOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogOffersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
