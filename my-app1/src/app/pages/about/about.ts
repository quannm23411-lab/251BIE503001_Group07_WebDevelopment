// src/app/pages/about/about.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ABOUT_US_DATA, AboutUsDataModel } from './about.data';
import { OffersService } from '../../services/blog/blog-offers.services';
import { ProductsService } from '../../services/blog/blog-products.services';
import { NewsService, NewsItem } from '../../services/blog/blog-news.services';

type BlogType = 'offers' | 'products' | 'news';

interface BlogTeaser {
  id: string;
  title: string;
  excerpt: string;
  date: string;   // "YYYY-MM-DD"
  image?: string;
  type: BlogType; // để routerLink biết gọi qua đâu
}

@Component({
  standalone: true,
  selector: 'app-about-us',
  templateUrl: './about.html',
  styleUrls: ['./about.css'],
  imports: [CommonModule, RouterModule],
})
export class About implements OnInit {
  // ===== PHẦN GIỚI THIỆU (GIỮ NGUYÊN) =====
  data: AboutUsDataModel = ABOUT_US_DATA;

  // ===== BLOG TEASER (GỘP 3 LOẠI) =====
  blogOffers: BlogTeaser[] = [];
  pageSize = 2;
  currentStartIndex = 0;
  visibleBlogOffers: BlogTeaser[] = [];

  constructor(
    private offersService: OffersService,
    private productsService: ProductsService,
    private newsService: NewsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Gọi đồng thời 3 nguồn: offers + products + news
    forkJoin({
      offers: this.offersService.getAll(),
      products: this.productsService.getAll(),
      news: this.newsService.getAll(),
    }).subscribe({
      next: ({ offers, products, news }) => {
        // Gắn thêm field type cho từng item
        const mappedOffers: BlogTeaser[] = (offers || []).map((o: any) => ({
          id: o.id,
          title: o.title,
          excerpt: o.excerpt,
          date: o.date,
          image: o.image,
          type: 'offers',
        }));

        const mappedProducts: BlogTeaser[] = (products || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          excerpt: p.excerpt,
          date: p.date,
          image: p.image,
          type: 'products',
        }));

        const mappedNews: BlogTeaser[] = (news || []).map((n: any) => ({
          id: n.id,
          title: n.title,
          excerpt: n.excerpt,
          date: n.date,
          image: n.image,
          type: 'news',
        }));

        // Gộp 3 mảng + sort theo ngày (mới → cũ)
        this.blogOffers = [
          ...mappedOffers,
          ...mappedProducts,
          ...mappedNews,
        ].sort((a, b) => (a.date < b.date ? 1 : -1));

        this.currentStartIndex = 0;
        this.updateVisible();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[About] Lỗi load blog tổng hợp:', err);
      },
    });
  }

  private updateVisible() {
    if (!this.blogOffers.length) {
      this.visibleBlogOffers = [];
      return;
    }

    this.visibleBlogOffers = this.blogOffers.slice(
      this.currentStartIndex,
      this.currentStartIndex + this.pageSize
    );
  }

  showNextBlog() {
    if (!this.blogOffers.length) return;

    this.currentStartIndex += this.pageSize;
    if (this.currentStartIndex >= this.blogOffers.length) {
      this.currentStartIndex = 0;
    }
    this.updateVisible();
  }

  showPrevBlog() {
    if (!this.blogOffers.length) return;

    this.currentStartIndex -= this.pageSize;
    if (this.currentStartIndex < 0) {
      this.currentStartIndex = Math.max(this.blogOffers.length - this.pageSize, 0);
    }
    this.updateVisible();
  }
}
