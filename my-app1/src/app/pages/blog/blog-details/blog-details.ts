import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { OffersService } from '../../../services/blog/blog-offers.services';
import { ProductsService } from '../../../services/blog/blog-products.services';
import { NewsService } from '.././../../services/blog/blog-news.services';

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
  private offers = inject(OffersService);
  private products = inject(ProductsService);
  private news = inject(NewsService);

  item: any = null;
  related: any[] = [];
  type: BlogType | '' = '';
  showContent = false;

  badgeText = 'Bài viết';
  badgeClass = 'badge--default';

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.type = params.get('type') as BlogType;
      const id = params.get('id') ?? '';

      this.loadData(this.type, id);
    });
  }

  private loadData(type: BlogType, id: string) {
    let source$;

    switch (type) {
      case 'offers': source$ = this.offers.getAll(); break;
      case 'products': source$ = this.products.getAll(); break;
      case 'news': source$ = this.news.getAll(); break;
      default: return;
    }

    source$.subscribe(list => {
      this.item = list.find(x => x.id === id) || null;
      this.related = list.filter(x => x.id !== id).slice(0, 4);

      // Badge
      const cat = (this.item?.category || '').toLowerCase();
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

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  formatVN(dateStr?: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  trackById(_: number, item: any) {
    return item.id;
  }
}
