import {
  Component, HostListener, inject, ElementRef, ViewChild, OnInit, OnDestroy, Renderer2
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../services/auth/auth';

// Dùng hot-products
import { HotProductService, Product } from '../../services/hot-products.services';
import { Subscription } from 'rxjs';

export interface TrendItem {
  id: string;
  label: string;
  img: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit, OnDestroy {
  private router = inject(Router);
  private auth = inject(Auth);
  private renderer = inject(Renderer2);
  private hot = inject(HotProductService);

  // shrink state
  isShrink = false;

  // location button
  currentCity = 'Hồ Chí Minh';

  // search state
  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;
  suggestOpen = false;
  query = '';

  // suggestions: lấy từ hot-products service
  hotSuggestions: TrendItem[] = [];
  private subs: Subscription[] = [];
  private cachedTop: TrendItem[] = [];

  ngOnInit(): void {
    // nạp gợi ý top (hero/hot) cho lần đầu
    this.subs.push(
      this.hot.getTopRent(6).subscribe(list => {
        this.cachedTop = list.map(this.mapToTrend);
        this.hotSuggestions = this.cachedTop;
      })
    );

    this.updateOffset();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // shrink + offset handlers
  @HostListener('window:scroll')
  onScroll() {
    this.isShrink = window.scrollY > 120;
    this.updateOffset();
  }
  @HostListener('window:resize')
  onResize() { this.updateOffset(); }

  private updateOffset() {
    const h = document.getElementById('mainHeader');
    const height = (h?.offsetHeight ?? 145) + 'px';
    this.renderer.setStyle(document.documentElement, '--header-offset', height);
  }

  // click outside to close suggestion
  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const path = e.composedPath() as HTMLElement[];
    const inside = path.some(el => (el as HTMLElement)?.classList?.contains('header__search'));
    if (!inside) this.suggestOpen = false;
  }

  // location button
  notifyLocationWip() {
    alert('Tính năng lọc địa điểm đang phát triển.');
  }

  // search handlers
  openSuggest() { this.suggestOpen = true; }

  onQueryChange(v: string) {
    this.query = v;
    const q = (v ?? '').trim();

    // nếu rỗng thì trả lại top
    if (!q) {
      this.hotSuggestions = this.cachedTop;
      return;
    }

    // gợi ý theo search
    this.subs.push(
      this.hot.searchProducts(q).subscribe(products => {
        const mapped = products.slice(0, 8).map(this.mapToTrend);
        this.hotSuggestions = mapped.length ? mapped : this.cachedTop;
      })
    );
  }

  onSearch(ev: Event) {
    ev.preventDefault();
    this.goSearch(this.query.trim());
  }
  onSearchKey(ev: KeyboardEvent) {
    if (ev.key === 'Enter') this.goSearch(this.query.trim());
  }
  applySuggestion(s: TrendItem) {
    this.query = s.label;
    this.searchInputRef?.nativeElement?.focus();
    this.suggestOpen = false;
    this.goSearch(this.query);
  }
  private goSearch(q: string) {
    if (!q) return;
    this.router.navigate(['/search'], { queryParams: { q } });
  }

  // map Product -> TrendItem cho phần gợi ý
  private mapToTrend(p: Product): TrendItem {
    return { id: p.id, label: p.vehicleName, img: p.image };
  }

  // --- giữ nguyên logic đăng nhập ---
  get currentUser() { return this.auth.getCurrentUser(); } // { fullname, email, role } | null
  isLoggedIn() { return this.auth.isLoggedIn(); }
  logout() { this.auth.logout(); this.router.navigate(['/login']); }
}
