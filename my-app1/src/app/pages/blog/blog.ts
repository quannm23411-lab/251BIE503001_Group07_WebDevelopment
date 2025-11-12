import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd, RouterModule } from '@angular/router';
import { filter, startWith } from 'rxjs/operators';

type BlogType = 'offers' | 'products' | 'news';

@Component({
  standalone: true,
  selector: 'app-blog',
  imports: [CommonModule, RouterModule],
  templateUrl: './blog.html',
  styleUrls: ['./blog.css'],
})
export class Blog implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Breadcrumb text
  crumb = signal<string>('Ưu đãi');
  // Tab đang active (để giữ highlight khi ở trang details)
  activeTab = signal<BlogType>('offers');
  // Ẩn/hiện cụm Tabs
  showTabs = signal<boolean>(true);

  ngOnInit(): void {
    // Cập nhật khi điều hướng, gồm cả lúc đang ở /blog/details/:type/:id
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), startWith(null))
      .subscribe(() => {
        const child = this.route.firstChild;
        if (!child) return;

        let type: BlogType | null = null;
        const path = child.snapshot.routeConfig?.path ?? '';

        // A) /blog/offers | /blog/products | /blog/news
        if (path === 'offers' || path === 'products' || path === 'news') {
          type = path as BlogType;
          this.showTabs.set(true);   // ở tab -> hiện tabs
        }

        // B) /blog/details/:type/:id
        if (path?.startsWith('details')) {
          const t = child.snapshot.paramMap.get('type');
          if (t === 'offers' || t === 'products' || t === 'news') {
            type = t as BlogType;
          }
          this.showTabs.set(false);  // ở chi tiết -> ẩn tabs
        }

        // fallback
        if (!type) type = 'offers';

        this.activeTab.set(type);
        this.crumb.set(this.mapCrumb(type));
      });
  }

  private mapCrumb(t: BlogType): string {
    switch (t) {
      case 'offers': return 'Ưu đãi';
      case 'products': return 'Sản phẩm mới';
      case 'news': return 'Tin tức';
    }
  }
}
