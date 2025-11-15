import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs';

// --- (Các interface Product, OrderJson, ... giữ nguyên) ---
interface Product { id: string; vehicleName: string; image: string; }
interface OrderJson {
  maDonThue: string;
  maKhachHang: string;
  chiTietDonThue: { idXe: string; [key: string]: any }[];
  [key: string]: any;
}
interface ProductReview {
  reviewId: string;
  vehicleId: string;
  customerId: string;
  orderId: string; // <-- Quan trọng
  customerName: string;
  rating: number;
  reviewDate: string;
  status: string;
  title: string;
  content: string;
  images: string[];
}
interface ReviewForm {
  rating: number;
  title: string;
  content: string;
  images: string[]; 
  imageFiles: File[];
}
interface ReviewableItem {
  idXe: string;
  vehicleName: string;
  image: string;
  form: ReviewForm;
}
interface ExistingReviewItem {
  vehicleName: string;
  image: string;
  review: ProductReview;
}
type Tier = 'EcoGold' | 'EcoSilver' | 'EcoBasic';
interface AccountProfile {
  fullname: string;
  avatar: string;
  tier?: Tier;
}

@Component({
  selector: 'app-account-review', 
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], 
  templateUrl: './account-review.html',
  styleUrls: ['./account-review.css']
})
export class AccountReview implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  public user: AccountProfile = {
    fullname: 'Khách EcoMOVE',
    avatar: '/assets/images/avatars/default.png',
    tier: 'EcoBasic'
  };
  private customerCode: string | undefined;

  public isLoading = signal(true);
  public isSubmitting = signal(false);
  public isSuccess = signal(false);
  
  public orderId = signal<string | null>(null);
  public itemsToReview: WritableSignal<ReviewableItem[]> = signal([]);
  public reviewedItems: WritableSignal<ExistingReviewItem[]> = signal([]);


  ngOnInit(): void {
    this.loadUserFromLocalStorage();
    this.loadData();
  }

  private loadUserFromLocalStorage(): void {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem('eco_profile');
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as any;
      if (data.fullname) this.user.fullname = data.fullname;
      if (data.avatar) this.user.avatar = data.avatar;
      if (data.tier) this.user.tier = data.tier;
      if (data.customerCode) this.customerCode = data.customerCode; 
    } catch { /* ignore */ }
  }


  // ==========================================================
  // ⭐ SỬA LẠI HÀM LOAD DATA NÀY
  // ==========================================================
  private loadData(): void {
    const id = this.route.snapshot.paramMap.get('orderId'); // Lấy orderId (ví dụ: RENT001)
    if (!id || !this.customerCode) {
      this.isLoading.set(false);
      return; 
    }
    
    this.orderId.set(id);
    this.isLoading.set(true);

    const orders$ = this.http.get<OrderJson[]>('assets/data/orders.json');
    const products$ = this.http.get<Product[]>('assets/data/products.json');
    const reviews$ = this.http.get<ProductReview[]>('assets/data/product-reviews.json');

    forkJoin({
      orders: orders$,
      products: products$,
      reviews: reviews$
    }).pipe(
      map(({ orders, products, reviews }) => {
        // 1. Tìm đơn hàng
        const order = orders.find(o => o.maDonThue === id && o.maKhachHang === this.customerCode);
        if (!order) return { toReview: [], reviewed: [] };

        // 2. Tạo Map sản phẩm
        const productsMap = new Map(products.map(p => [p.id, p]));

        // 3. Tạo Map các review CHỈ CỦA ĐƠN HÀNG NÀY
        // Lọc review theo customerId VÀ orderId
        const userReviewsForThisOrder = reviews.filter(
          r => r.customerId === this.customerCode && r.orderId === id
        );
        
        const userReviewsMap = new Map<string, ProductReview>(
          userReviewsForThisOrder.map(r => [r.vehicleId, r])
        );

        // 4. Lấy danh sách xe duy nhất trong đơn hàng
        const uniqueVehicleIds = [...new Set(order.chiTietDonThue.map(d => d.idXe))];
        
        const itemsToReview: ReviewableItem[] = [];
        const reviewedItems: ExistingReviewItem[] = [];

        // 5. Phân loại xe
        for (const vehicleId of uniqueVehicleIds) {
          const product = productsMap.get(vehicleId);
          // Kiểm tra xem xe này đã có trong Map review CỦA ĐƠN HÀNG NÀY chưa
          const existingReview = userReviewsMap.get(vehicleId);

          if (existingReview) {
            // Đã có review -> Thêm vào mảng 'reviewedItems'
            reviewedItems.push({
              vehicleName: product?.vehicleName || 'Không rõ tên',
              image: product?.image || 'assets/images/products/placeholder.jpg',
              review: existingReview
            });
          } else {
            // Chưa có review -> Thêm vào mảng 'itemsToReview'
            itemsToReview.push({
              idXe: vehicleId,
              vehicleName: product?.vehicleName || 'Không rõ tên',
              image: product?.image || 'assets/images/products/placeholder.jpg',
              form: {
                rating: 5,
                title: '',
                content: '',
                images: [],
                imageFiles: []
              }
            });
          }
        }
        
        return { toReview: itemsToReview, reviewed: reviewedItems };
      }),
      catchError(() => of({ toReview: [], reviewed: [] }))
    ).subscribe(result => {
      this.itemsToReview.set(result.toReview);
      this.reviewedItems.set(result.reviewed);
      this.isLoading.set(false);
    });
  }
  // ==========================================================

  // --- (Các hàm còn lại: setRating, onFileSelect, removeImage, onSubmit, backToOrders... giữ nguyên) ---
  setRating(item: ReviewableItem, rating: number): void {
    item.form.rating = rating;
  }

  onFileSelect(event: Event, item: ReviewableItem): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files).slice(0, 3 - item.form.images.length);
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        item.form.imageFiles.push(file); 
        const reader = new FileReader();
        reader.onload = (e: any) => {
          item.form.images.push(e.target.result); 
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(item: ReviewableItem, index: number): void {
    item.form.images.splice(index, 1);
    item.form.imageFiles.splice(index, 1);
  }

  onSubmit(): void {
    this.isSubmitting.set(true);

    // ⭐ SỬA NHỎ: Khi gửi đi, phải đính kèm orderId
    const reviewsData = this.itemsToReview().map(item => ({
      orderId: this.orderId(), // <-- Thêm dòng này
      vehicleId: item.idXe,
      customerId: this.customerCode,
      rating: item.form.rating,
      title: item.form.title,
      content: item.form.content,
    }));

    console.log('Đang gửi đi:', reviewsData);

    setTimeout(() => {
      this.isSubmitting.set(false);
      this.isSuccess.set(true);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 1500);
  }

  backToOrders(): void {
    this.router.navigate(['/account/orders']);
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
  mapReviewStatus(status: string): string {
    if (status === 'pending') return 'Đang chờ duyệt';
    if (status === 'approved') return 'Đã duyệt';
    if (status === 'rejected') return 'Đã từ chối';
    return 'Không rõ';
  }
}