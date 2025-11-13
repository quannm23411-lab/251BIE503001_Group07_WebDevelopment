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
  // ====== Thuê ngày mặc định ======
  rentStart: string = new Date().toISOString().split('T')[0];
  rentEnd: string = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

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

  vnd(n?: number) {
    if (n == null) return '';
    return n.toLocaleString('vi-VN') + '₫';
  }

  // ====== CART ACTIONS ======
  private addCurrentProductToCart(options?: { redirectToCart?: boolean }) {
    const p = this.product();
    if (!p) return;

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
      quantity: 1
    });

    if (options?.redirectToCart) {
      this.router.navigate(['/cart']);
    }
  }

  bookNow() {
    // ĐẶT XE NGAY: thêm vào giỏ + nhảy sang /cart
    this.addCurrentProductToCart({ redirectToCart: true });
  }

  addToCart() {
    // THÊM VÀO GIỎ: chỉ thêm, không chuyển trang
    this.addCurrentProductToCart();
  }

  preOrder() {
    // ĐẶT TRƯỚC: tạm thời giống THÊM VÀO GIỎ
    this.addCurrentProductToCart();
  }

  goTo(p: ProductVM) {
    this.router.navigate(['/rent', p.id]).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  constructor() {
    effect(() => {
      // mỗi lần id đổi thì reset slider
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
}
