import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogProducts } from './blog-products';

describe('BlogProducts', () => {
  let component: BlogProducts;
  let fixture: ComponentFixture<BlogProducts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogProducts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogProducts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
