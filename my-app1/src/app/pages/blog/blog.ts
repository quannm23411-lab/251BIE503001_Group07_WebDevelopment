import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog.html',
  styleUrls: ['./blog.css'],
})
export class Blog {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // lưu current url để tính tab + breadcrumb
  private currentUrl = signal<string>(this.router.url);

  constructor() {
    // cập nhật currentUrl mỗi lần điều hướng xong
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.currentUrl.set(e.urlAfterRedirects || e.url);
      });
  }

  // xác định tab đang active: offers / products / news
  activeTab() {
    const url = this.currentUrl();
    if (url.includes('/blog/products')) return 'products';
    if (url.includes('/blog/news')) return 'news';
    return 'offers';
  }

  // breadcrumb text
  crumb() {
    const tab = this.activeTab();
    if (tab === 'products') return 'Sản phẩm mới';
    if (tab === 'news') return 'Tin tức';
    return 'Ưu đãi';
  }

  // ẩn tabs khi đang ở trang chi tiết
  showTabs() {
    const url = this.currentUrl();
    return !url.includes('/blog/details/');
  }
}
