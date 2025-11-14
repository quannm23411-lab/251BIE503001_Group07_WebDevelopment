// import {
//   Component,
//   HostListener,
//   inject,
//   ElementRef,
//   ViewChild,
//   OnInit,
//   OnDestroy,
//   Renderer2,
//   computed
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, RouterLink, RouterLinkActive } from '@angular/router';
// import { Auth } from '../../services/auth/auth';

// // Dùng hot-products
// import { HotProductService, Product } from '../../services/hot-products.services';
// import { Subscription } from 'rxjs';

// // Dùng CartService để hiện badge giỏ hàng
// import { CartService } from '../../services/cart.services';

// export interface TrendItem {
//   id: string;
//   label: string;
//   img: string;
// }

// @Component({
//   selector: 'app-header',
//   standalone: true,
//   imports: [RouterLink, RouterLinkActive, CommonModule],
//   templateUrl: './header.html',
//   styleUrls: ['./header.css']
// })
// export class Header implements OnInit, OnDestroy {
//   private router = inject(Router);
//   private auth = inject(Auth);
//   private renderer = inject(Renderer2);
//   private hot = inject(HotProductService);
//   private cart = inject(CartService);

//   // shrink state
//   isShrink = false;

//   // location button
//   currentCity = 'Hồ Chí Minh';

//   // search state
//   @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;
//   suggestOpen = false;
//   query = '';

//   // suggestions: lấy từ hot-products service
//   hotSuggestions: TrendItem[] = [];
//   private subs: Subscription[] = [];
//   private cachedTop: TrendItem[] = [];

//   // số loại xe trong giỏ (items length)
//   cartItemCount = computed(() => this.cart.items().length);

//   ngOnInit(): void {
//     // nạp gợi ý top (hero/hot) cho lần đầu
//     this.subs.push(
//       this.hot.getTopRent(6).subscribe(list => {
//         this.cachedTop = list.map(this.mapToTrend);
//         this.hotSuggestions = this.cachedTop;
//       })
//     );

//     this.updateOffset();
//   }

//   ngOnDestroy(): void {
//     this.subs.forEach(s => s.unsubscribe());
//   }

//   // shrink + offset handlers
//   @HostListener('window:scroll')
//   onScroll() {
//     this.isShrink = window.scrollY > 120;
//     this.updateOffset();
//   }

//   @HostListener('window:resize')
//   onResize() {
//     this.updateOffset();
//   }

//   private updateOffset() {
//     const h = document.getElementById('mainHeader');
//     const height = (h?.offsetHeight ?? 145) + 'px';
//     this.renderer.setStyle(document.documentElement, '--header-offset', height);
//   }

//   // click outside to close suggestion
//   @HostListener('document:click', ['$event'])
//   onDocClick(e: MouseEvent) {
//     const path = e.composedPath() as HTMLElement[];
//     const inside = path.some(el =>
//       (el as HTMLElement)?.classList?.contains('header__search')
//     );
//     if (!inside) this.suggestOpen = false;
//   }

//   // location button
//   notifyLocationWip() {
//     alert('Tính năng lọc địa điểm đang phát triển.');
//   }

//   // search handlers
//   openSuggest() {
//     this.suggestOpen = true;
//   }

//   onQueryChange(v: string) {
//     this.query = v;
//     const q = (v ?? '').trim();

//     // nếu rỗng thì trả lại top
//     if (!q) {
//       this.hotSuggestions = this.cachedTop;
//       return;
//     }

//     // gợi ý theo search
//     this.subs.push(
//       this.hot.searchProducts(q).subscribe(products => {
//         const mapped = products.slice(0, 8).map(this.mapToTrend);
//         this.hotSuggestions = mapped.length ? mapped : this.cachedTop;
//       })
//     );
//   }

//   onSearch(ev: Event) {
//     ev.preventDefault();
//     this.goSearch(this.query.trim());
//   }

//   onSearchKey(ev: KeyboardEvent) {
//     if (ev.key === 'Enter') this.goSearch(this.query.trim());
//   }

//   // CLICK VÀO GỢI Ý HOT SEARCH → ĐI THẲNG TỚI /rent/:id
//   applySuggestion(s: TrendItem) {
//     this.query = s.label;
//     this.suggestOpen = false;
//     this.router.navigate(['/rent', s.id]); // ví dụ /rent/V008
//   }

//   // SEARCH THƯỜNG → TRANG RENT VỚI ?q=
//   private goSearch(q: string) {
//     if (!q) return;
//     this.suggestOpen = false;
//     this.router.navigate(['/rent'], { queryParams: { q } });
//   }

//   // map Product -> TrendItem cho phần gợi ý
//   private mapToTrend(p: Product): TrendItem {
//     return { id: p.id, label: p.vehicleName, img: p.image };
//   }

//   // --- giữ nguyên logic đăng nhập ---
//   get currentUser() {
//     return this.auth.getCurrentUser();
//   } // { fullname, email, role } | null
//   isLoggedIn() {
//     return this.auth.isLoggedIn();
//   }
//   logout() {
//     this.auth.logout();
//     this.router.navigate(['/login']);
//   }
// }
import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LoginService } from '../../services/login/login.service';

interface HotSuggestion {
  img: string;
  label: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {

  isShrink = false;
  currentCity = 'TP Hồ Chí Minh';

  // search
  suggestOpen = false;
  hotSuggestions: HotSuggestion[] = [
    {
      img: 'assets/images/search-scooter.png',
      label: 'Thuê scooter điện đi làm'
    },
    {
      img: 'assets/images/search-bike.png',
      label: 'Xe đạp điện cho sinh viên'
    },
    {
      img: 'assets/images/search-moto.png',
      label: 'Mô tô điện cuối tuần'
    }
  ];

  // profile dropdown
  profileMenuOpen = false;

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  // shrink header khi scroll
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const offset = window.scrollY || window.pageYOffset;
    this.isShrink = offset > 80;
  }

  // ====== USER / PROFILE ======
  isLoggedIn(): boolean {
    return this.loginService.isLoggedIn();
  }

  get currentUser(): any {
    return this.loginService.getCurrentUser();
  }

  get currentUserAvatar(): string {
    const user = this.currentUser;
    return user?.avatar || '/assets/images/avatars/default.png';
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  goToProfile(): void {
    this.profileMenuOpen = false;
    this.router.navigate(['/account/profile']);
  }

  goToOrders(): void {
    this.profileMenuOpen = false;
    this.router.navigate(['/account/orders']);
  }

  logout(): void {
    this.profileMenuOpen = false;
    this.loginService.logout();
    this.router.navigate(['/']);
  }

  // ====== CART ======
  cartItemCount(): number {
    // nếu sau này bạn có CartService thì sửa lại chỗ này
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

  // ====== LOCATION ======
  notifyLocationWip(): void {
    alert('Tính năng chọn địa điểm sẽ được cập nhật sau.');
  }

  // ====== SEARCH (stub cơ bản) ======
  openSuggest(): void {
    this.suggestOpen = true;
  }

  applySuggestion(s: HotSuggestion): void {
    this.suggestOpen = false;
    // bạn có thể điều hướng tới trang tìm kiếm ở đây
    console.log('Apply suggestion:', s.label);
  }

  onSearch(event: Event): void {
    event.preventDefault();
    this.suggestOpen = false;
  }

  onQueryChange(value: string): void {
    // nếu muốn filter hotSuggestions thì làm thêm ở đây
    // hiện tại chỉ đóng gợi ý nếu trống
    if (!value) {
      this.suggestOpen = false;
    }
  }

  onSearchKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.suggestOpen = false;
    }
  }
}
