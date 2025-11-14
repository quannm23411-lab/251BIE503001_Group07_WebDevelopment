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
