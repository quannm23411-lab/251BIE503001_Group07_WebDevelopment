import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { BLOG_OFFERS } from '../../../../assets/data/blog-offers.data';
import { BLOG_PRODUCTS } from '../../../../assets/data/blog-products.data';
import { BLOG_NEWS } from '../../../../assets/data/blog-news.data';

type BlogType = 'offers' | 'products' | 'news';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-details.html',
  styleUrls: ['./blog-details.css'],
})
export class BlogDetails implements OnInit {
  private route = inject(ActivatedRoute);

  item: any;
  related: any[] = [];
  type: BlogType | '' = '';
  showContent = false;

  badgeText: string = 'Bài viết';
  badgeClass: string = 'badge--default';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const t = (params.get('type') ?? '') as BlogType | '';
      const id = params.get('id') ?? '';
      this.type = t;

      const data = this.pickDataset(t);
      this.item = data.find((x: any) => x.id === id) || null;
      this.related = data.filter((x: any) => x.id !== id).slice(0, 4);

      const cat = (this.item?.category || '').toString().toLowerCase();
      if (this.type === 'offers' || cat.includes('ưu đãi')) {
        this.badgeText = 'Ưu đãi';
        this.badgeClass = 'badge--offers';
      } else if (this.type === 'products' || cat.includes('sản phẩm')) {
        this.badgeText = 'Sản phẩm mới';
        this.badgeClass = 'badge--products';
      } else if (this.type === 'news' || cat.includes('tin')) {
        this.badgeText = 'Tin tức';
        this.badgeClass = 'badge--news';
      } else {
        this.badgeText = 'Bài viết';
        this.badgeClass = 'badge--default';
      }

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  private pickDataset(t: BlogType | ''): any[] {
    switch (t) {
      case 'offers': return BLOG_OFFERS.items;
      case 'products': return BLOG_PRODUCTS.items;
      case 'news': return BLOG_NEWS.items;
      default: return [];
    }
  }

  formatVN(dateStr?: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  trackById(_: number, item: any): string | number {
    return item?.id ?? _;
  }
}
