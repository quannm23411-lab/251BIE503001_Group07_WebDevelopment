import {
  Component,
  computed,
  effect,
  inject,
  signal,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

import {
  ProductLoadingService,
  ProductVM
} from '../../services/product-loading.services';
import {
  ProductReviewService,
  ProductReview
} from '../../services/product-review.services';
import { CartService } from '../../services/cart.services';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})
export class ProductDetail {
  // ====== Thuê ngày (sẽ set trong constructor) ======
  rentStart: string = '';
  rentEnd: string = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private products = inject(ProductLoadingService);
  private reviewsService = inject(ProductReviewService);
  private cart = inject(CartService);

  // dùng cho render sao
  readonly stars = [1, 2, 3, 4, 5];

  // ====== Product theo route /rent/:id ======
  id = toSignal(this.route.paramMap.pipe(map(pm => pm.get('id') || '')), {
    initialValue: ''
  });

  product = toSignal<ProductVM | undefined>(
    this.route.paramMap.pipe(
      map(pm => pm.get('id') || ''),
      switchMap(id => (id ? this.products.getById(id) : of(undefined)))
    ),
    { initialValue: undefined }
  );

  detail = computed(() => this.product()?.details ?? null);

  gallery = computed<string[]>(() => {
    const p = this.product();
    if (!p) return [];
    return [this.products.getImageUrl(p, 'detail')];
  });

  activeIndex = signal(0);
  setActive(i: number) {
    this.activeIndex.set(i);
  }

  // ====== Related products ======
  allProducts = toSignal(this.products.getAll(), {
    initialValue: [] as ProductVM[]
  });

  related = computed<ProductVM[]>(() => {
    const cur = this.product();
    const list = this.allProducts();
    if (!cur || !list.length) return [];
    return list
      .filter(
        x => x.vehicleType === cur.vehicleType && String(x.id) !== String(cur.id)
      )
      .slice(0, 8);
  });

  // ====== Reviews ======
  private reviews$ = this.route.paramMap.pipe(
    map(pm => pm.get('id') || ''),
    switchMap(id =>
      id ? this.reviewsService.getByVehicleId(id) : of([] as ProductReview[])
    ),
    map(list => (list ?? []) as ProductReview[])
  );

  // Không truyền initialValue để tránh lỗi overload, chấp nhận kiểu ProductReview[] | undefined
  reviews = toSignal(this.reviews$);

  avgRating = computed(() => {
    const list = this.reviews() ?? [];
    if (!list.length) return 0;
    const sum = list.reduce((s, r) => s + (r.rating || 0), 0);
    return +(sum / list.length).toFixed(1);
  });

  avgRatingRounded = computed(() => Math.round(this.avgRating()));

  reviewCount = computed(() => (this.reviews() ?? []).length);

  // ====== Helpers ======
  statusLabel = computed(() =>
    this.product()?.availabilityStatus ? 'Còn xe' : 'Hết xe'
  );

  statusClass = computed(() =>
    this.product()?.availabilityStatus ? 'ok' : 'bad'
  );

  isOutOfStock = computed(() => !this.product()?.availabilityStatus);

  vnd(n?: number) {
    if (n == null) return '';
    return n.toLocaleString('vi-VN') + '₫';
  }

  // ====== CART ACTIONS ======
  private addCurrentProductToCart(options?: { redirectToCart?: boolean }) {
    const p = this.product();
    if (!p || !p.availabilityStatus) return; // hết hàng thì thôi

    this.cart.addOrUpdateFromProduct({
      productId: String(p.id),
      name: p.vehicleName,
      imageUrl: this.products.getImageUrl(p, 'detail'),
      brandName: p.brandName,
      vehicleType: p.vehicleType,
      pricePerDay: p.pricePerDay ?? p.finalPricePerDay,
      finalPricePerDay: p.finalPricePerDay,
      rentStart: this.rentStart,
      rentEnd: this.rentEnd,
      quantity: 1,
      availabilityStatus: p.availabilityStatus
    });

    if (options?.redirectToCart) {
      // dùng id cartItem đầy đủ (productId_start_end) để auto-tick đúng dòng
      const cartItemId = `${p.id}_${this.rentStart || 'none'}_${this.rentEnd || 'none'}`;
      this.router.navigate(['/cart'], {
        state: { autoSelectId: cartItemId }
      });
    }
  }

  bookNow() {
    if (this.isOutOfStock()) return;
    this.addCurrentProductToCart({ redirectToCart: true });
  }

  addToCart() {
    if (this.isOutOfStock()) return;
    this.addCurrentProductToCart();
  }

  preOrder() {
    this.addCurrentProductToCart();
  }

  goTo(p: ProductVM) {
    this.router.navigate(['/rent', p.id]).then(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // ====== CONSTRUCTOR: xử lý ngày thuê mặc định / từ query ======
  constructor() {
    // 1) Tính default: ngày mai -> ngày mốt
    const today = new Date();
    const tomorrow = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
    const dayAfter = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 2
    );

    const defaultStart = this.toInputDate(tomorrow);
    const defaultEnd = this.toInputDate(dayAfter);

    // 2) Đọc query params ?start=&end= (nếu đi từ trang Rent)
    const qp = this.route.snapshot.queryParamMap;
    const startParam = qp.get('start');
    const endParam = qp.get('end');

    if (startParam && endParam) {
      const s = this.parseDate(startParam);
      const e = this.parseDate(endParam);

      if (s && e && e.getTime() > s.getTime()) {
        // ngày hợp lệ → dùng theo Rent
        this.rentStart = this.toInputDate(s);
        this.rentEnd = this.toInputDate(e);
      } else {
        // query dỏm → fallback default
        this.rentStart = defaultStart;
        this.rentEnd = defaultEnd;
      }
    } else {
      // không có query (vào từ homepage / search / link khác)
      this.rentStart = defaultStart;
      this.rentEnd = defaultEnd;
    }

    // 3) Mỗi lần đổi id thì reset slider
    effect(() => {
      this.id();
      this.activeIndex.set(0);
    });
  }

  // Toggle mô tả
  showFullDescription = false;
  toggleDescription() {
    this.showFullDescription = !this.showFullDescription;
  }

  // Toggle review
  showFullReviews = false;
  toggleReviews() {
    this.showFullReviews = !this.showFullReviews;

    if (this.showFullReviews) {
      setTimeout(() => {
        const reviewSection = document.querySelector(
          '.pd-description.reviews-section'
        );
        reviewSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }

  // Slider related
  @ViewChild('slider') slider!: ElementRef;

  scrollLeft() {
    if (this.slider) {
      this.slider.nativeElement.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  }

  scrollRight() {
    if (this.slider) {
      this.slider.nativeElement.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  }

  // ====== DATE HELPERS ======
  private toInputDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private parseDate(str: string | null | undefined): Date | null {
    if (!str) return null;
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }
}
