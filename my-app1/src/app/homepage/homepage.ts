import { Component, OnInit, OnDestroy } from '@angular/core';
// 1. Import thêm HttpClientModule ở đây
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { forkJoin, interval, Subscription } from 'rxjs';
// Định nghĩa kiểu dữ liệu (giúp code an toàn hơn)
interface Product {
  id: string;
  vehicleName: string;
  pricePerDay: number;
  image: string;
  discount: number;
  availabilityStatus: boolean;
  vehicleType: string;
  tags?: string[];
  rating?: number;
}

interface PromoCode {
  code: string;
  discountAmount: string;
  endDate: string;
  active: boolean;
}

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [ CommonModule],
  templateUrl: './homepage.html', // <-- SỬA LẠI ĐƯỜNG DẪN NÀY
  styleUrls: ['./homepage.css']   // <-- VÀ ĐƯỜNG DẪN NÀY
})
export class Homepage implements OnInit, OnDestroy {
  // Các mảng để lưu dữ liệu cho *ngFor
  topRentList: Product[] = [];
  motorbikeList: Product[] = [];
  ecoBikeList: Product[] = [];
  compactBikeList: Product[] = [];

  // Dữ liệu cho banner
  promoCode = 'ECOPHUNU'; // Giá trị mặc định
  promoAmount = '10';   // Giá trị mặc định
  
  // Dữ liệu cho countdown
  days = '00';
  hours = '00';
  minutes = '00';
  seconds = '00';
  private countdownSubscription?: Subscription;

  // Tiêm HttpClient vào
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadAllData();
    this.setupPromo();
  }

  ngOnDestroy(): void {
    // Rất quan trọng: Hủy subscription khi component bị phá hủy
    this.countdownSubscription?.unsubscribe();
  }

  // Lấy và xử lý dữ liệu sản phẩm
  loadAllData(): void {
    this.http.get<Product[]>('assets/data/products.json').subscribe({
      next: (products) => {
        // 1. Thuê nhiều tháng này (sắp xếp theo rating)
        this.topRentList = [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 5);

        // 2. Xe máy điện
        this.motorbikeList = products.filter(p => p.vehicleType === 'Motorbike').slice(0, 6);
        
        // 3. Xe đạp điện
        this.ecoBikeList = products.filter(p => p.tags?.includes('eco') || p.tags?.includes('student')).slice(0, 6);

        // 4. Xe gấp gọn
        this.compactBikeList = products.filter(p => p.tags?.includes('compact') || p.tags?.includes('foldable')).slice(0, 6);
      },
      error: (err) => {
        console.error('❌ Lỗi load JSON sản phẩm:', err);
        // Bạn có thể set một biến để hiển thị lỗi trên UI
      }
    });
  }

  // Lấy và xử lý banner
  setupPromo(): void {
    this.http.get<PromoCode[]>('assets/data/discount_codes.json').subscribe({
      next: (codes) => {
        const now = new Date();
        const livePromo = codes
          .filter(c => c.active && new Date(c.endDate) > now)
          .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

        if (livePromo.length > 0) {
          const c = livePromo[0];
          this.promoCode = c.code;
          this.promoAmount = c.discountAmount;
          this.startCountdown(c.endDate);
        }
      },
      error: (err) => {
        console.warn('⏳ Không tìm thấy discount_codes.json, dùng giá trị mặc định.');
      }
    });
  }

  // Bắt đầu đếm ngược
  startCountdown(endDate: string): void {
    const end = new Date(endDate).getTime();

    this.countdownSubscription = interval(1000).subscribe(() => {
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        this.days = this.hours = this.minutes = this.seconds = '00';
        this.countdownSubscription?.unsubscribe();
        return;
      }

      this.days = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
      this.hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
      this.minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
      this.seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
    });
  }

  // Hàm định dạng tiền tệ (thay thế cho hàm 'vnd' trong file .js cũ)
  // Chúng ta sẽ gọi hàm này trong HTML
  formatVND(price: number): string {
    return (price ?? 0).toLocaleString('vi-VN') + 'đ';
  }
}
