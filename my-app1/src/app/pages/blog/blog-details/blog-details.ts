import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

// ⚠️ Giữ nguyên import cũ của offers (đã có BLOG_OFFERS .js)
import { BLOG_OFFERS } from '../blog-offers.data';

// 👉 Nếu bạn có 2 file JS cho product/news thì mở comment 2 dòng dưới và sửa đúng đường dẫn:
// import { BLOG_PRODUCTS } from '../blog-products.data';
// import { BLOG_NEWS } from '../blog-news.data';

type Post = {
  id: string;
  title: string;
  excerpt?: string;
  date?: string;          // yyyy-mm-dd
  image?: string;
  category?: string;
  content?: string;       // HTML dài
};

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, RouterLink],
  templateUrl: './blog-details.html',
  styleUrls: ['./blog-details.css'],
})
export class BlogDetailsComponent implements OnInit {
  type: 'offers' | 'products' | 'news' = 'offers';
  id = '';

  post?: Post;
  related: Post[] = [];

  ngOnInit(): void {
    const route = (window as any).ng?.getInjector?.() ? null : null; // no-op
  }

  constructor(private ar: ActivatedRoute) {
    this.ar.paramMap.subscribe((p) => {
      this.type = (p.get('type') as any) || 'offers';
      this.id = p.get('id') || '';
      this.resolveData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  private resolveData() {
    const data = this.getDataset(this.type);
    this.post = data.find((x) => x.id === this.id);

    // related: cùng type, khác id
    this.related = data
      .filter((x) => x.id !== this.id)
      .slice(0, 4);
  }

  private getDataset(type: string): Post[] {
    if (type === 'offers') {
      return BLOG_OFFERS.items as unknown as Post[];
    }
    // Nếu đã có 2 file JS tương tự:
    // if (type === 'products') return BLOG_PRODUCTS.items as Post[];
    // if (type === 'news')     return BLOG_NEWS.items as Post[];

    // fallback trống (khi bạn chưa có dữ liệu products/news)
    return [];
  }

  formatVN(dateStr?: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }
}

export default BlogDetailsComponent;
