import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OffersService, OfferItem } from '../../../services/blog/blog-offers.services';

@Component({
  selector: 'app-blog-offers',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, RouterLink],
  templateUrl: './blog-offers.html',
  styleUrls: ['./blog-offers.css'],
})
export class BlogOffersComponent implements OnInit {
  items: OfferItem[] = [];
  filtered: OfferItem[] = [];

  hero?: OfferItem;
  side: OfferItem[] = [];

  visibleList: OfferItem[] = [];
  visibleCount = 5;

  keyword = '';

  constructor(
    private offersService: OffersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.offersService.getAll().subscribe({
      next: (list: OfferItem[]) => {
        console.log('Offers loaded:', list.length);
        this.items = list;
        this.applySearch('');
        // ép Angular render lại ngay, tránh phải click mới thấy
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi load offers', err);
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
