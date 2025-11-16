import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LoginService, UserProfile } from '../../services/login/login.service';
import { HotProductService } from '../../services/hot-products.services';
import { Subscription, map } from 'rxjs';

interface SearchSuggestion {
  id: string;
  name: string;
  image: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit, OnDestroy {
  isShrink = false;
  currentCity = 'TP Hồ Chí Minh';

  // mobile menu
  mobileMenuOpen = false;

  // search
  suggestOpen = false;
  searchTerm = '';
  suggestions: SearchSuggestion[] = [];
  private searchSub?: Subscription;

  // profile dropdown
  profileMenuOpen = false;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private hotService: HotProductService
  ) { }

  /* ========= LIFECYCLE ========= */
private getLatestProfileFromStorage(): UserProfile | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem('eco_profile');
    if (!raw) return null;
    try {
      // Trả về dữ liệu mới nhất
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  }
  ngOnInit(): void {
    this.loadTopSuggestions();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  /* ========= HEADER SCROLL ========= */

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const offset = window.scrollY || window.pageYOffset;
    this.isShrink = offset > 80;
  }

  /* ========= MOBILE MENU ========= */

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;

    if (this.mobileMenuOpen) {
      this.profileMenuOpen = false;
    }
  }

  /* ========= USER / PROFILE ========= */

  isLoggedIn(): boolean {
    return this.loginService.isLoggedIn();
  }

  get currentUser(): any {
    return this.loginService.getCurrentUser();
  }

  get profile(): UserProfile | null {
    return this.loginService.getProfile();
  }

get displayName(): string {
    // Ưu tiên đọc tên mới nhất từ localStorage
    const latestProfile = this.getLatestProfileFromStorage();
    if (latestProfile && latestProfile.fullname) {
      return latestProfile.fullname;
    }
    
    // Nếu thất bại, dùng lại dữ liệu (có thể cũ) từ LoginService
    return this.profile?.fullname || this.currentUser?.fullname || '';
  }

get currentUserAvatar(): string {
    // Ưu tiên đọc avatar mới nhất từ localStorage
    const latestProfile = this.getLatestProfileFromStorage();
    if (latestProfile && latestProfile.avatar) {
      return latestProfile.avatar;
    }
    
    // Nếu thất bại, dùng lại dữ liệu (có thể cũ) từ LoginService
    const p = this.profile;
    return p?.avatar || '/assets/images/avatars/default.png';
  }
  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;

    if (this.profileMenuOpen) {
      this.mobileMenuOpen = false;
    }
  }

  goToProfile(): void {
    this.profileMenuOpen = false;
    this.mobileMenuOpen = false;
    this.router.navigate(['/account/profile']);
  }

  goToOrders(): void {
    this.profileMenuOpen = false;
    this.mobileMenuOpen = false;
    this.router.navigate(['/account/orders']);
  }

  logout(): void {
    this.profileMenuOpen = false;
    this.mobileMenuOpen = false;
    this.loginService.logout();
    this.router.navigate(['/']);
  }

  /* ========= CART ========= */

  cartItemCount(): number {
    if (typeof localStorage === 'undefined') return 0;
    try {
      const raw = localStorage.getItem('eco_cart_count');
      if (!raw) return 0;
      const n = Number(raw);
      return isNaN(n) ? 0 : n;
    } catch {
      return 0;
    }
  }

  /* ========= LOCATION ========= */

  notifyLocationWip(): void {
    alert('Tính năng chọn địa điểm sẽ được cập nhật sau.');
  }

  /* ========= SEARCH LOGIC ========= */

  private loadTopSuggestions(): void {
    this.searchSub?.unsubscribe();
    this.searchSub = this.hotService
      .getTopRent(3)
      .subscribe(list => {
        this.suggestions = (list || []).map(p => ({
          id: String(p.id),
          name: p.vehicleName,
          image: p.image
        }));
      });
  }

  openSuggest(): void {
    this.suggestOpen = true;
    if (!this.searchTerm) {
      this.loadTopSuggestions();
    }
  }

  closeSuggest(): void {
    this.suggestOpen = false;
  }

  onQueryChange(value: string): void {
    const v = (value || '').trim();
    this.searchTerm = v;

    if (!v) {
      this.loadTopSuggestions();
      this.suggestOpen = true;
      return;
    }

    this.searchSub?.unsubscribe();
    this.searchSub = this.hotService
      .searchProducts(v)
      .pipe(map(list => list.slice(0, 3)))
      .subscribe(list => {
        this.suggestions = (list || []).map(p => ({
          id: String(p.id),
          name: p.vehicleName,
          image: p.image
        }));
        this.suggestOpen = true;
      });
  }

  onSearchKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeSuggest();
    }
  }

  onSearch(event: Event): void {
    event.preventDefault();
    this.closeSuggest();
    this.mobileMenuOpen = false;

    const term = this.searchTerm.trim();
    if (!term) {
      this.router.navigate(['/rent']);
    } else {
      this.router.navigate(['/rent'], { queryParams: { q: term } });
    }
  }

  applySuggestion(s: SearchSuggestion): void {
    this.closeSuggest();
    this.mobileMenuOpen = false;

    const keyword = s.name?.trim();
    if (!keyword) {
      this.router.navigate(['/rent']);
      return;
    }

    this.searchTerm = keyword;
    this.router.navigate(['/rent'], { queryParams: { q: keyword } });
  }

  goToAllProducts(): void {
    this.closeSuggest();
    this.mobileMenuOpen = false;

    const term = this.searchTerm.trim();
    if (term) {
      this.router.navigate(['/rent'], { queryParams: { q: term } });
    } else {
      this.router.navigate(['/rent']);
    }
  }

  /** Tô màu phần trùng với searchTerm trong tên xe */
  highlightName(name: string): string {
    const text = name || '';
    const q = this.searchTerm.trim();
    if (!q) return text;

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${escaped})`, 'gi');
    return text.replace(re, '<span class="search-highlight">$1</span>');
  }
}
