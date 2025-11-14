import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, NgIf, NgFor, NgClass, NgOptimizedImage } from '@angular/common';

import { HotProductService, Product } from '../../services/hot-products.services';
import { ProductLoadingService } from '../../services/product-loading.services';
import { ProductReviewService, ProductReview } from '../../services/product-review.services';

import { PromoBanner } from '../../components/promo-banner/promo-banner';
import { BannerCarousel, BannerItem } from '../../components/banner-carousel/banner-carousel';
import { RouterLink } from '@angular/router';
import { Popup } from '../popup/popup';
import { Contact } from '../contact/contact';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, NgClass, NgOptimizedImage, PromoBanner, BannerCarousel, RouterLink, Popup, Contact],
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.css']
})

export class Homepage implements OnInit, OnDestroy {

  showWelcomePopup = false;

    /* --- CAROUSEL: lấy reference HTML --- */
  @ViewChild('carousel', { static: false }) carousel!: ElementRef;

  scrollLeft() {
    if (this.carousel) {
      this.carousel.nativeElement.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  }

  scrollRight() {
    if (this.carousel) {
      this.carousel.nativeElement.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  }

  banners: BannerItem[] = [
    { id: 'b1', src: './assets/images/banner-1.jpg', alt: 'Gia nhập cộng đồng EcoMove' },
    { id: 'b2', src: './assets/images/banner-2.jpg', alt: 'Đặt xe ngay tại EcoMove' },
    { id: 'b3', src: './assets/images/banner-3.jpg', alt: 'Nhận ưu đãi độc quyền từ EcoMove' }
  ];

  topRentList: Product[] = [];
  motorbikeList: Product[] = [];
  ecoBikeList: Product[] = [];
  compactBikeList: Product[] = [];

  sectionText = {
    motorbike: { title: 'Xe máy điện', subtitle: 'Động cơ mạnh mẽ, vượt dốc dễ dàng. Thích hợp cho chuyến đi dài.' },
    ebike: { title: 'Xe đạp điện', subtitle: 'Nhẹ nhàng, tiết kiệm, phù hợp di chuyển nội đô.' },
    compact: { title: 'Xe đạp điện gấp gọn', subtitle: 'Gọn gàng, dễ mang lên thang máy, phù hợp căn hộ.' }
  };

  promo = { active: false, code: '', amount: 0, endDate: '' };

  benefits = [
    { icon: 'bi bi-check-circle', title: 'Tiết kiệm & minh bạch', desc: 'Giá niêm yết, không phụ phí ẩn.' },
    { icon: 'bi bi-truck', title: 'Nhận xe nhanh', desc: 'Giao nhận 10–30 phút (khu vực trung tâm).' },
    { icon: 'bi bi-battery-charging', title: 'Pin bền – đi xa', desc: 'Tầm chạy 70–200 km mỗi lần sạc.' },
    { icon: 'bi bi-shield-shaded', title: 'An toàn & bảo dưỡng', desc: 'Xe kiểm tra định kỳ, có bảo hiểm trách nhiệm.' },
    { icon: 'bi bi-globe-americas', title: 'Đặt & quản lý online', desc: 'Tất cả thao tác trên một nền tảng.' },
    { icon: 'bi bi-headset', title: 'Hỗ trợ 24/7', desc: 'Có lỗi là có mặt, hỗ trợ tức thì.' }
  ];

  steps = [
    { no: 1, icon: 'bi bi-calendar', title: 'Chọn xe & lịch', desc: 'Nhập địa điểm, thời gian; hệ thống đề xuất phù hợp.' },
    { no: 2, icon: 'bi bi-credit-card', title: 'Xác nhận & thanh toán', desc: 'Online hoặc tại nơi nhận; xuất hoá đơn điện tử.' },
    { no: 3, icon: 'bi bi-scooter', title: 'Nhận xe & lên đường', desc: 'Tại trạm hoặc giao tận nơi.' }
  ];

  /** Testimonials hiển thị ở section "Khách hàng nói gì" */
  testimonials: {
    avatar: string;
    name: string;
    city?: string;
    text: string;
    rating: number;
  }[] = [];

  faqs = [
    { q: 'Cần giấy tờ gì khi thuê?', a: 'CCCD/Passport + cọc định danh hoặc thẻ tín dụng.' },
    { q: 'Lỡ hết pin giữa đường?', a: 'Liên hệ hotline, đội hỗ trợ mang pin/đổi xe.' },
    { q: 'Phí giao xe như thế nào?', a: 'Miễn phí bán kính 3km từ trạm; ngoài phạm vi tính theo km.' },
    { q: 'Huỷ/đổi lịch ra sao?', a: 'Miễn phí trước 2 giờ; sau 2 giờ phụ thu 10–30%.' },
    { q: 'Xử lý vi phạm giao thông?', a: 'Khách hàng chịu trách nhiệm theo quy định pháp luật.' }
  ];

  /** Flag tránh load lại review nhiều lần không cần thiết */
  private reviewsLoaded = false;

  constructor(
    private hot: HotProductService,
    private cdr: ChangeDetectorRef,
    private img: ProductLoadingService,
    private reviews: ProductReviewService
  ) { }


featureIcons: Record<string, string> = {
  "sạc": "bi-lightning-charge-fill",  
  "quãng": "bi-geo-alt-fill",          
  "tốc": "bi-speedometer2",            
  "hiệu": "bi-rocket-takeoff-fill",    
  "thiết": "bi-brush-fill",           
  "gps": "bi-crosshair",              
  "tay": "bi-bicycle",                  
  "pin": "bi-battery-full"             
};

/** Lấy icon phù hợp theo nội dung feature */
getFeatureIcon(text: string): string {
  text = text.toLowerCase();

  for (const key in this.featureIcons) {
    if (text.includes(key)) {
      return this.featureIcons[key];
    }
  }

  return "bi-check-circle-fill"; // icon fallback
}


  ngOnInit(): void {
    this.hot.getConfig().subscribe(cfg => {
      if (cfg?.sections) {
        this.sectionText.motorbike.title = cfg.sections.motorbike.title || this.sectionText.motorbike.title;
        this.sectionText.motorbike.subtitle = cfg.sections.motorbike.subtitle || this.sectionText.motorbike.subtitle;
        this.sectionText.ebike.title = cfg.sections.ebike.title || this.sectionText.ebike.title;
        this.sectionText.ebike.subtitle = cfg.sections.ebike.subtitle || this.sectionText.ebike.subtitle;
        this.sectionText.compact.title = cfg.sections.compact.title || this.sectionText.compact.title;
        this.sectionText.compact.subtitle = cfg.sections.compact.subtitle || this.sectionText.compact.subtitle;
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

    this.hot.getTopRent(4).subscribe(list => {
      this.topRentList = list;
      this.cdr.detectChanges();
      this.loadRandomReviews();
    });

    this.hot.getHotByCategory('motorbike', 4).subscribe(v => {
      this.motorbikeList = v;
      this.cdr.detectChanges();
      this.loadRandomReviews();
    });

    this.hot.getHotByCategory('ebike', 4).subscribe(v => {
      this.ecoBikeList = v;
      this.cdr.detectChanges();
      this.loadRandomReviews();
    });

    this.hot.getHotByCategory('compact', 8).subscribe(v => {
      this.compactBikeList = v;
      this.cdr.detectChanges();
      this.loadRandomReviews();
    });
    setTimeout(() => {
      this.showWelcomePopup = true;
    }, 2000);
  }
  ngOnDestroy(): void { }

  /** Ảnh (qua ProductLoadingService) */
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

  /** Lấy ngẫu nhiên một vài đánh giá từ ProductReviewService để show trên homepage */
  private loadRandomReviews() {
    if (this.reviewsLoaded) return;

    // gom tất cả id sản phẩm đang hiển thị trên homepage
    const idSet = new Set<string | number>();
    this.topRentList.forEach(p => p?.id && idSet.add(p.id));
    this.motorbikeList.forEach(p => p?.id && idSet.add(p.id));
    this.ecoBikeList.forEach(p => p?.id && idSet.add(p.id));
    this.compactBikeList.forEach(p => p?.id && idSet.add(p.id));

    const ids = Array.from(idSet).slice(0, 6); // tối đa 6 xe để gọi
    if (!ids.length) return;

    forkJoin(
      ids.map(id => this.reviews.getByVehicleId(String(id)))
    ).subscribe((lists: ProductReview[][]) => {
      const all: ProductReview[] = lists.flat().filter(Boolean).filter(r => r.status === 'approved');
      if (!all.length) return;

      // shuffle nhẹ cho "ngẫu nhiên"
      const shuffled = all.slice().sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, 4); // lấy 3 review để hiển thị

      this.testimonials = picked.map(r => ({
        avatar: (r.images && r.images[0]) || 'assets/images/default-avatar.png',
        name: r.customerName || 'Khách hàng EcoMOVE',
        city: 'TP.HCM', // JSON không có city, để fixed text cho gọn
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
