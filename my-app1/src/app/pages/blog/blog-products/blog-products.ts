import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService, ProductItem } from '../../../services/blog/blog-products.services';

@Component({
  selector: 'app-blog-products',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, RouterLink],
  templateUrl: './blog-products.html',
  styleUrls: ['./blog-products.css'],
  // nhớ ĐỪNG set OnPush ở đây nếu bạn không cần
  // changeDetection: ChangeDetectionStrategy.Default
})
export class BlogProducts implements OnInit {
  items: ProductItem[] = [];
  filtered: ProductItem[] = [];

  hero?: ProductItem;
  side: ProductItem[] = [];

  visibleList: ProductItem[] = [];
  visibleCount = 5;

  keyword = '';

  constructor(
    private productsService: ProductsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productsService.getAll().subscribe({
      next: (list: ProductItem[]) => {
        console.log('Blog products loaded:', list.length);
        this.items = list;
        this.applySearch('');
        // 👇 ép Angular cập nhật lại view ngay
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi load blog products', err);
      }
    });
  }

  onSearch(term: string) {
    this.keyword = term;
    this.applySearch(term);
  }

  loadMore() {
    this.visibleCount += 3;
    this.updateListSlice();
  }

  private applySearch(term: string) {
    const k = term.trim().toLowerCase();

    this.filtered = !k
      ? [...this.items]
      : this.items.filter(i =>
          (i.title + ' ' + i.excerpt).toLowerCase().includes(k)
        );

    this.hero = this.filtered[0];
    this.side = this.filtered.slice(1, 4);

    this.visibleCount = 5;
    this.updateListSlice();
  }

  private updateListSlice() {
    this.visibleList = this.filtered.slice(0, this.visibleCount);
  }

  formatVN(dateStr?: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }
}
