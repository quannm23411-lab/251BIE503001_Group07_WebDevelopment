import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';                 // ✅ THÊM DÒNG NÀY
import { BLOG_OFFERS } from '../blog-offers.data';

interface OfferItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image?: string;
  category?: string;
}

@Component({
  selector: 'app-blog-offers',
  standalone: true,
  // Import rõ ràng để khỏi cảnh báo NG8103 (dù CommonModule đã đủ với Angular cũ)
  imports: [CommonModule, NgFor, NgIf, RouterLink],           // ✅ THÊM RouterLink VÀO ĐÂY
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

  ngOnInit(): void {
    this.items = BLOG_OFFERS.items;
    this.applySearch('');
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
      : this.items.filter((i) =>
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

export default BlogOffersComponent;
