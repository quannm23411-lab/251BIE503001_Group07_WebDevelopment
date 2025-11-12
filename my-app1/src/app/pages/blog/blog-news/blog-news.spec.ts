import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogNews } from './blog-news';

describe('BlogNews', () => {
  let component: BlogNews;
  let fixture: ComponentFixture<BlogNews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogNews]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogNews);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
