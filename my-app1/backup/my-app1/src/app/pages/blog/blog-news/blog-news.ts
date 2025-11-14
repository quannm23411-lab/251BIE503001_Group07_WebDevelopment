import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BLOG_NEWS } from '../blog-news.data.js';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image?: string;
  category?: string;
}

@Component({
  selector: 'app-blog-news',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, RouterLink],
  templateUrl: './blog-news.html',
  styleUrls: ['./blog-news.css']
})
export class BlogNews implements OnInit {
  items: NewsItem[] = [];
  filtered: NewsItem[] = [];

  hero?: NewsItem;
  side: NewsItem[] = [];

  visibleList: NewsItem[] = [];
  visibleCount = 5;

  keyword = '';

  ngOnInit(): void {
    this.items = BLOG_NEWS.items;
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
