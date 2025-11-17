import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';

import { OffersService, OfferItem } from '../../../services/blog/blog-offers.services';
import { ProductsService, ProductItem } from '../../../services/blog/blog-products.services';
import { NewsService, NewsItem } from '../../../services/blog/blog-news.services';

type BlogType = 'offers' | 'products' | 'news';

type AnyBlogItem = OfferItem | ProductItem | NewsItem;

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf, NgFor],
  templateUrl: './blog-details.html',
  styleUrls: ['./blog-details.css'],
})
export class BlogDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private offers = inject(OffersService);
  private products = inject(ProductsService);
  private news = inject(NewsService);
  private cdr = inject(ChangeDetectorRef);

  item: AnyBlogItem | null = null;
  related: AnyBlogItem[] = [];
  type: BlogType | '' = '';
  showContent = false;

  badgeText = 'Bài viết';
  badgeClass = 'badge--default';

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.type = params.get('type') as BlogType;
      const id = params.get('id') ?? '';

      console.log('[BlogDetails] params', { type: this.type, id });

      if (!this.type || !id) return;

      this.loadData(this.type, id);
    });
  }

  private loadData(type: BlogType, id: string) {
    let source$;

    switch (type) {
      case 'offers':
        source$ = this.offers.getAll();
        break;
      case 'products':
        source$ = this.products.getAll();
        break;
      case 'news':
        source$ = this.news.getAll();
        break;
      default:
        console.warn('[BlogDetails] Unknown type', type);
        return;
    }

    source$.subscribe({
      next: (list: AnyBlogItem[]) => {
        console.log('[BlogDetails] list length', list.length);
        this.item = list.find((x: AnyBlogItem) => x.id === id) || null;
        this.related = list.filter((x: AnyBlogItem) => x.id !== id).slice(0, 4);

        console.log('[BlogDetails] found item', this.item);

        if (type === 'offers') {
          this.badgeText = 'Ưu đãi';
          this.badgeClass = 'badge--offers';
        } else if (type === 'products') {
          this.badgeText = 'Sản phẩm mới';
          this.badgeClass = 'badge--products';
        } else if (type === 'news') {
          this.badgeText = 'Tin tức';
          this.badgeClass = 'badge--news';
        }

        this.showContent = !!this.item;

        // scroll lên đầu + ép Angular render
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('[BlogDetails] Error loading list', err);
      }
    });
  }

  formatVN(dateStr?: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  trackById(_: number, item: AnyBlogItem) {
    return item.id;
  }
}
