import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList
} from '@angular/core';
import {
  CommonModule,
  NgIf,
  NgFor,
  NgClass,
  NgOptimizedImage
} from '@angular/common';

import { HotProductService, Product } from '../../services/hot-products.services';
import { ProductLoadingService } from '../../services/product-loading.services';
import {
  ProductReviewService,
  ProductReview
} from '../../services/product-review.services';

import { PromoBanner } from '../../components/promo-banner/promo-banner';
import {
  BannerCarousel,
  BannerItem
} from '../../components/banner-carousel/banner-carousel';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Popup } from '../popup/popup';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgFor,
    NgClass,
    NgOptimizedImage,
    PromoBanner,
    BannerCarousel,
    RouterLink,
    Popup
  ],
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.css']
})
export class Homepage implements OnInit, OnDestroy {
  showWelcomePopup = false;

  /* --- TOP RENT CAROUSEL refs --- */
  @ViewChild('carousel', { static: false })
  carousel!: ElementRef<HTMLDivElement>;

  @ViewChildren('topRentCard')
  topRentCards!: QueryList<ElementRef<HTMLAnchorElement>>;

  /** index xe đang được phóng to ở giữa */
  activeTopIndex = 0;

  banners: BannerItem[] = [
    {
      id: 'b1',
      src: './assets/images/banner-1.jpg',
      alt: 'Gia nhập cộng đồng EcoMove'
    },
    {
      id: 'b2',
      src: './assets/images/banner-2.jpg',
      alt: 'Đặt xe ngay tại EcoMove'
    },
    {
      id: 'b3',
      src: './assets/images/banner-3.jpg',
      alt: 'Nhận ưu đãi độc quyền từ EcoMove'
    }
  ];

  topRentList: Product[] = [];
  motorbikeList: Product[] = [];
  ecoBikeList: Product[] = [];
  compactBikeList: Product[] = [];

  sectionText = {
    motorbike: {
      title: 'Xe máy điện',
      subtitle: 'Động cơ mạnh mẽ, vượt dốc dễ dàng. Thích hợp cho chuyến đi dài.'
    },
    ebike: {
      title: 'Xe đạp điện',
      subtitle: 'Nhẹ nhàng, tiết kiệm, phù hợp di chuyển nội đô.'
    },
    compact: {
      title: 'Xe đạp điện gấp gọn',
      subtitle: 'Gọn gàng, dễ mang lên thang máy, phù hợp căn hộ.'
    }
  };

  promo = { active: false, code: '', amount: 0, endDate: '' };

  benefits = [
    {
      icon: 'bi bi-check-circle',
      title: 'Tiết kiệm & minh bạch',
      desc: 'Giá niêm yết, không phụ phí ẩn.'
    },
    {
      icon: 'bi bi-truck',
      title: 'Nhận xe nhanh',
      desc: 'Giao nhận 10–30 phút (khu vực trung tâm).'
    },
    {
      icon: 'bi bi-battery-charging',
      title: 'Pin bền – đi xa',
      desc: 'Tầm chạy 70–200 km mỗi lần sạc.'
    },
    {
      icon: 'bi bi-shield-shaded',
      title: 'An toàn & bảo dưỡng',
      desc: 'Xe kiểm tra định kỳ, có bảo hiểm trách nhiệm.'
    },
    {
      icon: 'bi bi-globe-americas',
      title: 'Đặt & quản lý online',
      desc: 'Tất cả thao tác trên một nền tảng.'
    },
    {
      icon: 'bi bi-headset',
      title: 'Hỗ trợ 24/7',
      desc: 'Có lỗi là có mặt, hỗ trợ tức thì.'
    }
  ];

  steps = [
    {
      no: 1,
      icon: 'bi bi-calendar',
      title: 'Chọn xe & lịch',
      desc: 'Nhập địa điểm, thời gian; hệ thống đề xuất phù hợp.'
    },
    {
      no: 2,
      icon: 'bi bi-credit-card',
      title: 'Xác nhận & thanh toán',
      desc: 'Online hoặc tại nơi nhận; xuất hoá đơn điện tử.'
    },
    {
      no: 3,
      icon: 'bi bi-scooter',
      title: 'Nhận xe & lên đường',
      desc: 'Tại trạm hoặc giao tận nơi.'
    }
  ];

  testimonials: {
    avatar: string;
    name: string;
    city?: string;
    text: string;
    rating: number;
  }[] = [];

  faqs = [
    {
      q: 'Cần giấy tờ gì khi thuê?',
      a: 'CCCD/Passport + cọc định danh hoặc thẻ tín dụng.'
    },
    {
      q: 'Lỡ hết pin giữa đường?',
      a: 'Liên hệ hotline, đội hỗ trợ mang pin/đổi xe.'
    },
    {
      q: 'Phí giao xe như thế nào?',
      a: 'Miễn phí bán kính 3km từ trạm; ngoài phạm vi tính theo km.'
    },
    {
      q: 'Huỷ/đổi lịch ra sao?',
      a: 'Miễn phí trước 2 giờ; sau 2 giờ phụ thu 10–30%.'
    },
    {
      q: 'Xử lý vi phạm giao thông?',
      a: 'Khách hàng chịu trách nhiệm theo quy định pháp luật.'
    }
  ];

  /** tránh load lại review nhiều lần không cần thiết */
  private reviewsLoaded = false;

  featureIcons: Record<string, string> = {
    sạc: 'bi-lightning-charge-fill',
    quãng: 'bi-geo-alt-fill',
    tốc: 'bi-speedometer2',
    hiệu: 'bi-rocket-takeoff-fill',
    thiết: 'bi-brush-fill',
    gps: 'bi-crosshair',
    tay: 'bi-bicycle',
    pin: 'bi-battery-full'
  };

  constructor(
    private hot: HotProductService,
    private cdr: ChangeDetectorRef,
    private img: ProductLoadingService,
    private reviews: ProductReviewService,
    private route: ActivatedRoute
  ) { }

  /** icon feature */
  getFeatureIcon(text: string): string {
    text = text.toLowerCase();

    for (const key in this.featureIcons) {
      if (text.includes(key)) {
        return this.featureIcons[key];
      }
    }

    return 'bi-check-circle-fill';
  }

  ngOnInit(): void {
    this.hot.getConfig().subscribe(cfg => {
      if (cfg?.sections) {
        this.sectionText.motorbike.title =
          cfg.sections.motorbike.title || this.sectionText.motorbike.title;
        this.sectionText.motorbike.subtitle =
          cfg.sections.motorbike.subtitle ||
          this.sectionText.motorbike.subtitle;
        this.sectionText.ebike.title =
          cfg.sections.ebike.title || this.sectionText.ebike.title;
        this.sectionText.ebike.subtitle =
          cfg.sections.ebike.subtitle || this.sectionText.ebike.subtitle;
        this.sectionText.compact.title =
          cfg.sections.compact.title || this.sectionText.compact.title;
        this.sectionText.compact.subtitle =
          cfg.sections.compact.subtitle || this.sectionText.compact.subtitle;
      }

      const p = cfg?.promo;
      if (p?.active) {
        this.promo = {
          active: true,
          code: p.code,
          amount: Number(p.discountAmount ?? 0),
          endDate: p.endDate
        };
      }

      this.cdr.detectChanges();
    });

    // chỉ lấy những xe còn hàng cho homepage
    this.hot.getTopRent(4).subscribe(list => {
      this.topRentList = (list || []).filter(x => x.availabilityStatus !== false);
      this.activeTopIndex = 0;
      this.cdr.detectChanges();
      setTimeout(() => this.scrollToActive(), 0);
      this.loadRandomReviews();
    });

    this.hot.getHotByCategory('motorbike', 3).subscribe(v => {
      this.motorbikeList = (v || []).filter(x => x.availabilityStatus !== false);
      this.cdr.detectChanges();
      this.loadRandomReviews();
    });

    this.hot.getHotByCategory('ebike', 3).subscribe(v => {
      this.ecoBikeList = (v || []).filter(x => x.availabilityStatus !== false);
      this.cdr.detectChanges();
      this.loadRandomReviews();
    });

    this.hot.getHotByCategory('compact', 3).subscribe(v => {
      this.compactBikeList = (v || []).filter(x => x.availabilityStatus !== false);
      this.cdr.detectChanges();
      this.loadRandomReviews();
    });

    // popup welcome
    setTimeout(() => {
      this.showWelcomePopup = true;
    }, 2000);

    // scroll tới anchor trong trang
    this.route.fragment.subscribe(fragment => {
      if (!fragment) return;

      setTimeout(() => {
        const el = document.getElementById(fragment);
        if (el) {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 0);
    });
  }

  ngOnDestroy(): void { }

  /** chuyển sang item kế tiếp trong top-rent */
  nextTopRent(): void {
    if (!this.topRentList.length) return;

    this.activeTopIndex =
      (this.activeTopIndex + 1) % this.topRentList.length;

    this.cdr.detectChanges();
    setTimeout(() => this.scrollToActive(), 0);
  }

  /** quay lại item trước đó trong top-rent */
  prevTopRent(): void {
    if (!this.topRentList.length) return;

    const len = this.topRentList.length;
    this.activeTopIndex = (this.activeTopIndex - 1 + len) % len;

    this.cdr.detectChanges();
    setTimeout(() => this.scrollToActive(), 0);
  }

  /** canh cho card active nằm giữa carousel */
  private scrollToActive(): void {
    const carouselEl = this.carousel?.nativeElement;
    const cards = this.topRentCards?.toArray();
    if (!carouselEl || !cards?.length) return;

    const activeCardRef = cards[this.activeTopIndex];
    if (!activeCardRef) return;

    const activeEl = activeCardRef.nativeElement as HTMLElement;
    const carouselRect = carouselEl.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();

    const offset =
      activeRect.left -
      carouselRect.left -
      (carouselRect.width / 2 - activeRect.width / 2);

    carouselEl.scrollBy({
      left: offset,
      behavior: 'smooth'
    });
  }

  /** ảnh */
  getImg(p: Product, kind: 'card' | 'detail' | 'thumb' = 'card') {
    return this.img.getImageUrl(p, kind);
  }

  getSize(kind: 'card' | 'detail' | 'thumb' = 'card') {
    return this.img.getImageSize(kind);
  }

  /** Format giá */
  formatVND(price: number): string {
    return (price ?? 0).toLocaleString('vi-VN') + 'đ';
  }

  /** Lấy ngẫu nhiên review đã approved để show trên homepage */
  private loadRandomReviews() {
    if (this.reviewsLoaded) return;

    const idSet = new Set<string | number>();
    this.topRentList.forEach(p => p?.id && idSet.add(p.id));
    this.motorbikeList.forEach(p => p?.id && idSet.add(p.id));
    this.ecoBikeList.forEach(p => p?.id && idSet.add(p.id));
    this.compactBikeList.forEach(p => p?.id && idSet.add(p.id));

    const ids = Array.from(idSet);
    if (!ids.length) return;

    this.reviews
      .getApprovedByVehicleIds(ids)
      .subscribe((all: ProductReview[]) => {
        if (!all.length) return;

        const shuffled = all.slice().sort(() => Math.random() - 0.5);
        const picked = shuffled.slice(0, 4);

        this.testimonials = picked.map(r => ({
          avatar:
            (r.images && r.images[0]) || 'assets/images/default-avatar.png',
          name: r.customerName || 'Khách hàng EcoMOVE',
          city: 'TP.HCM',
          text: r.content || r.title || '',
          rating: r.rating || 5
        }));

        if (this.testimonials.length) {
          this.reviewsLoaded = true;
        }

        this.cdr.detectChanges();
      });
  }
}
