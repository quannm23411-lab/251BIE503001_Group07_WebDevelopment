// 1. Thêm 'OnInit' vào dòng import
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
// ... (Interface Product giữ nguyên) ...
interface Product {
  id: string;
  vehicleName: string;
  description: string;
  licensePlate: string;
  brand: string;
  type: string;
  status: string;
  images: string[];
}

@Component({
  selector: 'app-admin-bike-detail',
  // 'imports' có vẻ trống, bạn có thể cần thêm CommonModule sau này cho *ngFor, *ngIf
  imports: [CommonModule], // Thử thêm dòng này nếu *ngIf và *ngFor không chạy
  templateUrl: './admin-bike-detail.html',
  styleUrl: './admin-bike-detail.css',
})

// 2. Thêm 'implements OnInit' vào đây
export class AdminBikeDetail implements OnInit {
  
  // === CÁC BIẾN ĐỂ LƯU TRẠNG THÁI ===
  product: Product | undefined; // Biến lưu trữ toàn bộ dữ liệu sản phẩm
  mainImageUrl: string = 'assets/images/products/default.jpg';
  activeImage: string = '';

  allVehicleTypes: string[] = ["Xe phổ thông", "Xe cao cấp", "Xe tay ga", "Xe thể thao"];
  allStatuses: string[] = ["Sẵn sàng", "Đang cho thuê", "Bảo trì"];

  constructor(private http: HttpClient) { }

  // === LOGIC KHỞI TẠO ===
  // Giờ đây Angular sẽ TỰ ĐỘNG CHẠY hàm này khi component tải xong
  ngOnInit(): void {
    this.http.get<Product>('assets/data/product-detail.json').subscribe({
      next: (data) => {
        this.product = data; // Dữ liệu sẽ được gán
        
        if (data.images && data.images.length > 0) {
          this.mainImageUrl = this.formatImagePath(data.images[0]); 
          this.activeImage = data.images[0];
        }
      },
      error: (err) => {
        console.error("Không thể tải dữ liệu sản phẩm:", err);
      }
    });
  }

  // ... (Các hàm khác giữ nguyên) ...
  changeMainImage(imageName: string): void {
    // ...
  }
  formatImagePath(imageName: string): any {
    // ...
  }
}