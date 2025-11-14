import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

// ... (brandMap giữ nguyên) ...
const brandMap: Record<string, string> = {
  B001: 'VinFast',
  B002: 'Yadea',
  B003: 'Dat Bike',
  B004: 'Gogoro',
  B005: 'DK Bike'
};

@Component({
  selector: 'app-admin-bike-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-bike-detail.html',
  styleUrl: './admin-bike-detail.css'
})
export class AdminBikeDetail implements OnInit {
  bike: any;
  isLoading: boolean = true;
  
  // 🔽 THÊM MỚI: Biến kiểm soát popup
  showConfirmPopup: boolean = false;
  showSuccessPopup: boolean = false;
  
  // ... (brands, locations, vehicleTypes giữ nguyên) ...
  brands = [
    { id: 'B001', name: 'VinFast' },
    { id: 'B002', name: 'Yadea' },
    { id: 'B003', name: 'Dat Bike' },
    { id: 'B004', name: 'Gogoro' },
    { id: 'B005', name: 'DK Bike' }
  ];
  locations = ['TP.HCM', 'Hà Nội', 'Đà Nẵng'];
  vehicleTypes = ['Scooter', 'Motorbike'];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // ... (Hàm ngOnInit giữ nguyên) ...
    this.isLoading = true;
    this.route.paramMap.subscribe(params => {
        const bikeId = params.get('id');
        if (bikeId) {
            this.http.get<any[]>('assets/data/products.json').subscribe({
                next: (data) => {
                    const foundBike = data.find(b => b.id === bikeId);
                    if (foundBike) {
                        this.bike = foundBike;
                    } else {
                        console.error('Không tìm thấy xe với ID:', bikeId);
                    }
                    this.isLoading = false; 
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Lỗi khi tải products.json', err);
                    this.isLoading = false;
                    this.cdr.detectChanges();
                }
            });
        } else {
            console.error('Không tìm thấy ID trong URL');
            this.isLoading = false;
            this.cdr.detectChanges();
        }
    });
  }

  goBack() {
    this.location.back();
  }

  /**
   * 🔽 THAY ĐỔI: Hàm saveChanges() giờ chỉ mở popup xác nhận
   */
  saveChanges() {
    this.showConfirmPopup = true;
  }

  /**
   * 🔽 THÊM MỚI: Hàm hủy từ popup
   */
  onCancelSave() {
    this.showConfirmPopup = false;
  }

  /**
   * 🔽 THÊM MỚI: Hàm xác nhận lưu (logic cũ của saveChanges)
   */
  onConfirmSave() {
    this.showConfirmPopup = false; // Đóng popup xác nhận
    this.isLoading = true; // Hiển thị loading
    this.cdr.detectChanges();

    console.log('Đang lưu thay đổi cho:', this.bike);
    
    // Giả lập lưu thành công
    setTimeout(() => {
      this.isLoading = false;
      this.showSuccessPopup = true; // Mở popup thành công
      this.cdr.detectChanges(); 
    }, 1000);
  }

  /**
   * 🔽 THÊM MỚI: Hàm này chỉ đóng popup và ở lại trang
   */
  onCloseSuccessAndStay() {
    this.showSuccessPopup = false;
  }

  /**
   * 🔽 THAY ĐỔI: Hàm này đổi tên (từ onCloseSuccessPopup) 
   * và sẽ được gọi bởi nút "Quay về"
   */
  onCloseSuccessAndGoBack() {
    this.showSuccessPopup = false;
    this.goBack(); // Quay lại trang admin-bike
  }
}