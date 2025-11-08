import {
  Component, HostListener, inject, ElementRef, ViewChild, OnInit, OnDestroy, Renderer2
} from '@angular/core';
import { CommonModule } from '@angular/common';                 // <-- THÊM
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../services/auth/auth';
import { TrendingService, TrendItem } from '../../services/trending.services'; // <-- SỬA ĐƯỜNG DẪN
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule], // <-- THÊM
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit, OnDestroy {
  private router = inject(Router);
  private auth = inject(Auth);
  private renderer = inject(Renderer2);
  private trending = inject(TrendingService);

  // shrink state
  isShrink = false;

  // location button
  currentCity = 'Hồ Chí Minh';

  // search state
  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;
  suggestOpen = false;
  query = '';

  // suggestions from homepage hero
  hotSuggestions: TrendItem[] = [];
  private trendingSub?: Subscription;

  ngOnInit(): void {
    // subscribe trending data pushed from Homepage
    this.trendingSub = this.trending.trending$.subscribe(list => {
      this.hotSuggestions = Array.isArray(list) ? list : [];
    });
    this.updateOffset();
  }

  ngOnDestroy(): void {
    this.trendingSub?.unsubscribe();
  }

  // shrink + offset handlers
  @HostListener('window:scroll')
  onScroll() {
    this.isShrink = window.scrollY > 120;
    this.updateOffset();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateOffset();
  }

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
  onQueryChange(v: string) { this.query = v; }
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

  // --- giữ nguyên logic đăng nhập ---
  get currentUser() { return this.auth.getCurrentUser(); } // { fullname, email, role } | null
  isLoggedIn() { return this.auth.isLoggedIn(); }
  logout() { this.auth.logout(); this.router.navigate(['/login']); }
}
