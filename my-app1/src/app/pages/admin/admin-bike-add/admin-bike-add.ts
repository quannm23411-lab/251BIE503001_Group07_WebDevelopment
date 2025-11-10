import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // ◀️ THÊM MỚI

@Component({
  selector: 'app-admin-bike-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-bike-add.html',
  styleUrl: './admin-bike-add.css' 
})
export class AdminBikeAdd implements OnInit {
  newBike: any; 
  isLoading: boolean = true; // ◀️ THAY ĐỔI: Bắt đầu với true
  
  showConfirmPopup: boolean = false;
  showSuccessPopup: boolean = false;
  
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
    private location: Location,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient // ◀️ THÊM MỚI: Inject HttpClient
  ) {
    // Không gọi initializeNewBike() ở đây nữa
  }

  ngOnInit() {
    this.isLoading = true;
    // Tải file products.json để tìm ra ID mới
    this.http.get<any[]>('assets/data/products.json').subscribe({
      next: (allBikes) => {
        // 1. Tạo ID mới
        const newId = this.generateNewBikeId(allBikes);
        // 2. Khởi tạo form với ID này
        this.initializeNewBike(newId);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải products.json', err);
        // Nếu lỗi, tạo 1 ID ngẫu nhiên
        this.initializeNewBike(`V${Math.floor(1000 + Math.random() * 9000)}`);
        this.isLoading = false;
      }
    });
  }

  /**
   * 🔽 THÊM MỚI: Hàm tạo ID xe mới
   */
  generateNewBikeId(allBikes: any[]): string {
    // Lấy tất cả các số từ ID (V001 -> 1, V016 -> 16)
    const numericIds = allBikes
      .map(b => b.id)
      .map(id => parseInt(id.replace('V', ''), 10))
      .filter((num: number) => !isNaN(num)); // Lọc bỏ các giá trị NaN

    if (numericIds.length === 0) {
      return 'V001'; // Nếu là xe đầu tiên trong hệ thống
    }

    // Tìm ID lớn nhất
    const maxId = Math.max(...numericIds);
    
    // Tạo ID mới (max + 1) và đệm 3 số 0 (ví dụ: 17 -> "017")
    const newNumericId = maxId + 1;
    return `V${newNumericId.toString().padStart(3, '0')}`;
  }

  /**
   * 🔽 THAY ĐỔI: Chấp nhận 'newId' làm tham số
   */
  initializeNewBike(newId: string) {
    this.newBike = {
      id: newId, // ◀️ Gán ID mới
      vehicleName: '',
      brandId: 'B001', 
      model: '',
      licensePlate: '',
      batteryCapacity: ' kWh',
      rangePerCharge: 0,
      vehicleType: 'Scooter', 
      pricePerHour: 0,
      pricePerDay: 0,
      availabilityStatus: true, 
      discount: 0,
      location: 'TP.HCM', 
      tags: '', 
      image: 'assets/images/products/', 
      description: ''
    };
  }

  // ... (giữ nguyên các hàm goBack, saveChanges, onCancelSave, onConfirmSave, ...)
  // ... (onCloseSuccessAndReset, onCloseSuccessAndGoBack)
  
  goBack() {
    this.location.back();
  }

  saveChanges() {
    console.log('Xe mới:', this.newBike);
    const bikeDataToSave = {
      ...this.newBike,
      tags: this.newBike.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
    };
    console.log('Dữ liệu chuẩn bị lưu:', bikeDataToSave);
    this.showConfirmPopup = true;
  }

  onCancelSave() {
    this.showConfirmPopup = false;
  }

  onConfirmSave() {
    this.showConfirmPopup = false;
    this.isLoading = true;
    this.cdr.detectChanges();
    console.log('Đang lưu xe mới...');
    setTimeout(() => {
      this.isLoading = false;
      this.showSuccessPopup = true;
      this.cdr.detectChanges(); 
    }, 1000);
  }

  onCloseSuccessAndReset() {
    this.showSuccessPopup = false;
    // ◀️ THAY ĐỔI: Phải tải lại data để lấy ID mới nhất
    // (Trong hệ thống thật, bạn sẽ gọi lại API)
    // Tạm thời, chúng ta tạo ID ngẫu nhiên để demo
    const randomId = `V${Math.floor(1000 + Math.random() * 9000)}`;
    this.initializeNewBike(randomId); 
  }

  onCloseSuccessAndGoBack() {
    this.showSuccessPopup = false;
    this.router.navigate(['/admin/bike']); 
  }
}