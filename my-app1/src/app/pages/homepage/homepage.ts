import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgIf, NgFor, NgClass, NgOptimizedImage } from '@angular/common';

import { HotProductService, Product } from '../../services/hot-products.services';
import { ProductLoadingService } from '../../services/product-loading.services';

import { PromoBanner } from '../../components/promo-banner/promo-banner';
import { BannerCarousel, BannerItem } from '../../components/banner-carousel/banner-carousel';
import { RouterLink } from '@angular/router';
import { Popup } from '../popup/popup';


@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, NgClass, NgOptimizedImage, PromoBanner, BannerCarousel, RouterLink, Popup],
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.css']
})
export class Homepage implements OnInit, OnDestroy {

  showWelcomePopup = false;

  banners: BannerItem[] = [
    { id: 'b1', src: 'assets/images/banner-1.jpg', alt: 'Khuyến mãi tháng này' },
    { id: 'b2', src: 'assets/images/banner-2.jpg', alt: 'Thuê xe nhanh trong 30 phút' },
    { id: 'b3', src: 'assets/images/banner-3.jpg', alt: 'Đi xa tiết kiệm' }
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

  testimonials = [
    { avatar: 'assets/images/avatar/k-xuan.jpg', name: 'K. Xuân', city: 'TP.HCM', text: 'Đặt 8h, 8h15 có xe tại khách sạn. Pin đi cả ngày vẫn còn.', rating: 5 },
    { avatar: 'assets/images/avatar/a-linh.jpg', name: 'A. Linh', city: 'Đà Nẵng', text: 'Thủ tục nhanh, xe mới, hỗ trợ tận tình.', rating: 5 }
  ];

  faqs = [
    { q: 'Cần giấy tờ gì khi thuê?', a: 'CCCD/Passport + cọc định danh hoặc thẻ tín dụng.' },
    { q: 'Lỡ hết pin giữa đường?', a: 'Liên hệ hotline, đội hỗ trợ mang pin/đổi xe.' },
    { q: 'Phí giao xe như thế nào?', a: 'Miễn phí bán kính 3km từ trạm; ngoài phạm vi tính theo km.' },
    { q: 'Huỷ/đổi lịch ra sao?', a: 'Miễn phí trước 2 giờ; sau 2 giờ phụ thu 10–30%.' },
    { q: 'Xử lý vi phạm giao thông?', a: 'Khách hàng chịu trách nhiệm theo quy định pháp luật.' }
  ];

  constructor(
    private hot: HotProductService,
    private cdr: ChangeDetectorRef,
    private img: ProductLoadingService
  ) { }

  ngOnInit(): void {

    // ⬅️ tự động mở popup sau 2 giây
    setTimeout(() => {
      this.showWelcomePopup = true;
    }, 2000);

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
        this.promo = { active: true, code: p.code, amount: Number(p.discountAmount ?? 0), endDate: p.endDate };
      }
      this.cdr.detectChanges();
    });

    this.hot.getTopRent(4).subscribe(list => {
      this.topRentList = list;
      this.cdr.detectChanges();
    });

    this.hot.getHotByCategory('motorbike', 4).subscribe(v => { this.motorbikeList = v; this.cdr.detectChanges(); });
    this.hot.getHotByCategory('ebike', 4).subscribe(v => { this.ecoBikeList = v; this.cdr.detectChanges(); });
    this.hot.getHotByCategory('compact', 8).subscribe(v => { this.compactBikeList = v; this.cdr.detectChanges(); });
  }

  ngOnDestroy(): void { }

  /** ===== Ảnh (qua ProductLoadingService) ===== */
  getImg(p: Product, kind: 'card' | 'detail' | 'thumb' = 'card') {
    return this.img.getImageUrl(p, kind);
  }
  getSize(kind: 'card' | 'detail' | 'thumb' = 'card') {
    return this.img.getImageSize(kind);
  }

  /** ===== Format giá ===== */
  formatVND(price: number): string {
    return (price ?? 0).toLocaleString('vi-VN') + 'đ';
  }
}