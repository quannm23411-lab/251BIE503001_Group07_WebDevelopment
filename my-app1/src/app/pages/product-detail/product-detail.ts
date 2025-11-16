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
import { Auth } from '../../services/auth/auth';

type CategorySlug = 'xe-may-dien' | 'xe-dap-dien' | 'xe-dap-dien-gap-gon';

const TYPE_CATEGORY: Record<string, { label: string; slug: CategorySlug }> = {
  'Xe máy điện': {
    label: 'Xe máy điện',
    slug: 'xe-may-dien'
  },
  'Xe đạp điện': {
    label: 'Xe đạp điện',
    slug: 'xe-dap-dien'
  },
  'Xe đạp điện gấp gọn': {
    label: 'Xe đạp điện gấp gọn',
    slug: 'xe-dap-dien-gap-gon'
  }
};

// ====== Pending cart action (sau login quay lại) ======
type PendingCartMode = 'addToCart' | 'bookNow' | 'preOrder';

interface PendingCartAction {
  mode: PendingCartMode;
  productId: string;
  rentStart: string;
  rentEnd: string;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})
export class ProductDetail {
  // ====== Thuê ngày (set trong constructor) ======
  rentStart: string = '';
  rentEnd: string = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private products = inject(ProductLoadingService);
  private reviewsService = inject(ProductReviewService);
  private cart = inject(CartService);
  private auth = inject(Auth);

  readonly stars = [1, 2, 3, 4, 5];

  // Main image để animate lên giỏ
  @ViewChild('mainImage') mainImage?: ElementRef<HTMLImageElement>;

  // Slider related
  @ViewChild('slider') slider!: ElementRef;

  // ====== Product theo /rent/:id ======
  id = toSignal(
    this.route.paramMap.pipe(map(pm => pm.get('id') || '')),
    { initialValue: '' }
  );

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

  // ====== Category cho breadcrumb (Xe máy điện / Xe đạp điện / ...) ======
  private resolveCategoryForProduct(
    p: ProductVM
  ): { label: string; slug: CategorySlug } {
    const normalized = this.products.getVehicleTypeLabel(p.vehicleType ?? '');
    const direct = TYPE_CATEGORY[normalized];
    if (direct) return direct;

    const tags = (p.tags ?? []).map(t => String(t).toLowerCase());
    if (tags.some(t => t.includes('gấp') || t.includes('compact') || t.includes('fold'))) {
      return TYPE_CATEGORY['Xe đạp điện gấp gọn'];
    }

    return TYPE_CATEGORY['Xe đạp điện'];
  }

  category = computed<{ label: string; slug: CategorySlug }>(() => {
    const p = this.product();
    if (!p) {
      return TYPE_CATEGORY['Xe đạp điện'];
    }
    return this.resolveCategoryForProduct(p);
  });

  categoryLabel = computed(() => this.category().label);
  categorySlug = computed(() => this.category().slug);

  // ====== Query cho breadcrumb ======
  buildBreadcrumbQueryParams() {
    // dùng cho crumb loại xe
    return {
      type: this.categorySlug(),
      start: this.rentStart,
      end: this.rentEnd
    };
  }

  buildRentRootQueryParams() {
    // dùng cho crumb "Đặt xe"
    return {
      start: this.rentStart,
      end: this.rentEnd,
      type: this.categorySlug()
    };
  }

  // ====== Related products (ưu tiên theo tags) ======
  allProducts = toSignal(this.products.getAll(), {
    initialValue: [] as ProductVM[]
  });

  related = computed<ProductVM[]>(() => {
    const cur = this.product();
    const list = this.allProducts();
    if (!cur || !list.length) return [];

    const curId = String(cur.id);
    const curTypeLabel = this.products.getVehicleTypeLabel(cur.vehicleType ?? '');
    const curTags = new Set(
      (cur.tags ?? []).map(t => String(t).toLowerCase())
    );

    // cùng loại xe
    const sameType = list.filter(
      x =>
        this.products.getVehicleTypeLabel(x.vehicleType ?? '') ===
        curTypeLabel && String(x.id) !== curId
    );

    // ưu tiên những thằng trùng tag với xe hiện tại
    const withTag: ProductVM[] = [];
    const withoutTag: ProductVM[] = [];

    for (const p of sameType) {
      const tags = (p.tags ?? []).map(t => String(t).toLowerCase());
      const hasCommon = tags.some(t => curTags.has(t));
      if (hasCommon) withTag.push(p);
      else withoutTag.push(p);
    }

    return [...withTag, ...withoutTag].slice(0, 8);
  });

  // ====== Reviews (CHỈ lấy approved) ======
  private reviews$ = this.route.paramMap.pipe(
    map(pm => pm.get('id') || ''),
    switchMap(id =>
      id
        ? this.reviewsService.getApprovedByVehicleId(id)
        : of([] as ProductReview[])
    ),
    map(list => (list ?? []) as ProductReview[])
  );

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

  // ====== PENDING CART ACTION (localStorage) ======
  private readonly pendingCartKey = 'eco_pending_cart_action';
  private pendingHandled = false;

  private savePendingCartAction(data: PendingCartAction) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(this.pendingCartKey, JSON.stringify(data));
    } catch {
      // kệ, không lưu được thì coi như bỏ
    }
  }

  private readAndClearPendingCartAction(): PendingCartAction | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(this.pendingCartKey);
      if (!raw) return null;
      window.localStorage.removeItem(this.pendingCartKey);
      return JSON.parse(raw) as PendingCartAction;
    } catch {
      return null;
    }
  }

  // ====== CART ACTIONS ======
  private addCurrentProductToCart(options?: { redirectToCart?: boolean }) {
    const p = this.product();
    if (!p || !p.availabilityStatus) return;

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
      const cartItemId = `${p.id}_${this.rentStart || 'none'}_${this.rentEnd || 'none'}`;
      this.router.navigate(['/cart'], {
        state: { autoSelectId: cartItemId }
      });
    }
  }

  private animateToCart() {
    if (typeof window === 'undefined') return;

    const imgEl = this.mainImage?.nativeElement;
    const cartIcon = document.querySelector(
      '.header-cart-icon'
    ) as HTMLElement | null; // đảm bảo icon giỏ có class này

    if (!imgEl || !cartIcon) return;

    const imgRect = imgEl.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    const clone = imgEl.cloneNode(true) as HTMLElement;
    clone.style.position = 'fixed';
    clone.style.left = imgRect.left + 'px';
    clone.style.top = imgRect.top + 'px';
    clone.style.width = imgRect.width + 'px';
    clone.style.height = imgRect.height + 'px';
    clone.style.borderRadius = '50%';
    clone.style.zIndex = '9999';
    clone.style.transition = 'transform 0.5s ease, opacity 0.6s ease';
    clone.style.pointerEvents = 'none';

    document.body.appendChild(clone);

    const translateX =
      cartRect.left +
      cartRect.width / 2 -
      (imgRect.left + imgRect.width / 2);
    const translateY =
      cartRect.top +
      cartRect.height / 2 -
      (imgRect.top + imgRect.height / 2);

    requestAnimationFrame(() => {
      clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.1)`;
      clone.style.opacity = '0';
    });

    setTimeout(() => {
      clone.remove();
    }, 650);
  }

  // ====== PUBLIC ACTIONS (gắn với nút) ======

  bookNow() {
    if (this.isOutOfStock()) return;
    const p = this.product();
    if (!p) return;

    // chưa login: lưu pending + đá qua login
    if (!this.auth.isLoggedIn()) {
      this.savePendingCartAction({
        mode: 'bookNow',
        productId: String(p.id),
        rentStart: this.rentStart,
        rentEnd: this.rentEnd
      });

      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: this.router.url
        }
      });
      return;
    }

    // đã login
    this.addCurrentProductToCart({ redirectToCart: true });
  }

  addToCart() {
    if (this.isOutOfStock()) return;
    const p = this.product();
    if (!p) return;

    if (!this.auth.isLoggedIn()) {
      this.savePendingCartAction({
        mode: 'addToCart',
        productId: String(p.id),
        rentStart: this.rentStart,
        rentEnd: this.rentEnd
      });

      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: this.router.url
        }
      });
      return;
    }

    this.addCurrentProductToCart();
    this.animateToCart();
  }

  // giữ để template khỏi lỗi (nếu sau này bỏ nút thì xoá)
  preOrder() {
    if (this.isOutOfStock()) return;
    const p = this.product();
    if (!p) return;

    if (!this.auth.isLoggedIn()) {
      this.savePendingCartAction({
        mode: 'preOrder',
        productId: String(p.id),
        rentStart: this.rentStart,
        rentEnd: this.rentEnd
      });

      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: this.router.url
        }
      });
      return;
    }

    this.addCurrentProductToCart();
  }

  goTo(p: ProductVM) {
    const cat = this.resolveCategoryForProduct(p);

    this.router
      .navigate(['/rent', p.id], {
        queryParams: {
          start: this.rentStart,
          end: this.rentEnd,
          type: cat.slug
        }
      })
      .then(() => {
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  }

  constructor() {
    // 1) Default: ngày mai -> ngày mốt
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

    // 2) Đọc query params ?start=&end=
    const qp = this.route.snapshot.queryParamMap;
    const startParam = qp.get('start');
    const endParam = qp.get('end');

    if (startParam && endParam) {
      const s = this.parseDate(startParam);
      const e = this.parseDate(endParam);

      if (s && e && e.getTime() > s.getTime()) {
        this.rentStart = this.toInputDate(s);
        this.rentEnd = this.toInputDate(e);
      } else {
        this.rentStart = defaultStart;
        this.rentEnd = defaultEnd;
      }
    } else {
      this.rentStart = defaultStart;
      this.rentEnd = defaultEnd;
    }

    // 3) Mỗi lần đổi id thì reset slider
    effect(() => {
      this.id();
      this.activeIndex.set(0);
    });

    // 4) Sau khi product load xong, xử lý pending cart action (nếu có)
    effect(() => {
      const p = this.product();
      if (!p || this.pendingHandled) return;

      const pending = this.readAndClearPendingCartAction();
      if (!pending) {
        this.pendingHandled = true;
        return;
      }

      // phải đúng product
      if (String(p.id) !== pending.productId) {
        this.pendingHandled = true;
        return;
      }

      // cập nhật lại ngày theo pending (nếu có)
      if (pending.rentStart && pending.rentEnd) {
        this.rentStart = pending.rentStart;
        this.rentEnd = pending.rentEnd;
      }

      switch (pending.mode) {
        case 'addToCart':
          this.addCurrentProductToCart();
          this.animateToCart();
          break;
        case 'bookNow':
          this.addCurrentProductToCart({ redirectToCart: true });
          break;
        case 'preOrder':
          this.addCurrentProductToCart();
          break;
      }

      this.pendingHandled = true;
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
