import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
// 🔽 THÊM CÁC IMPORT NÀY
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-bike-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // ◀️ THAY ĐỔI: Dùng ReactiveFormsModule
  templateUrl: './admin-bike-add.html',
  styleUrl: './admin-bike-add.css' 
})
export class AdminBikeAdd implements OnInit {
  bikeForm!: FormGroup; // ◀️ THAY ĐỔI: Dùng FormGroup thay vì 'any'
  isLoading: boolean = true;
  
  showConfirmPopup: boolean = false;
  showSuccessPopup: boolean = false;
  
  // Dữ liệu cho các <select> (giữ nguyên)
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
    private http: HttpClient,
    private fb: FormBuilder // ◀️ THÊM MỚI: Inject FormBuilder
  ) {
    // Khởi tạo form ở đây để tránh lỗi template
    this.bikeForm = this.fb.group({});
  }

  ngOnInit() {
    this.loadAndInitializeForm();
  }

  /**
   * 🔽 THÊM MỚI: Tách logic load và init
   */
  loadAndInitializeForm() {
    this.isLoading = true;
    this.http.get<any[]>('assets/data/products.json').subscribe({
      next: (allBikes) => {
        const newId = this.generateNewBikeId(allBikes);
        this.initializeNewBike(newId);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải products.json', err);
        this.initializeNewBike(`V${Math.floor(1000 + Math.random() * 9000)}`); // ID tạm
        this.isLoading = false;
      }
    });
  }

  /**
   * (Giữ nguyên) Hàm tạo ID xe mới
   */
  generateNewBikeId(allBikes: any[]): string {
    const numericIds = allBikes
      .map(b => b.id)
      .map(id => parseInt(id.replace('V', ''), 10))
      .filter((num: number) => !isNaN(num));

    if (numericIds.length === 0) {
      return 'V001';
    }
    const maxId = Math.max(...numericIds);
    const newNumericId = maxId + 1;
    return `V${newNumericId.toString().padStart(3, '0')}`;
  }

  /**
   * 🔽 THAY ĐỔI: Khởi tạo bằng FormBuilder và thêm Validators
   */
  initializeNewBike(newId: string) {
    this.bikeForm = this.fb.group({
      // Cột 1: Thông tin
      id: [{ value: newId, disabled: true }, Validators.required],
      vehicleName: ['', Validators.required],
      brandId: ['B001', Validators.required],
      model: ['', Validators.required],
      licensePlate: ['', Validators.required],
      vehicleType: ['Scooter', Validators.required],
      
      // Cột 1: Hình ảnh & Mô tả
      image: ['assets/images/products/', [
        Validators.required,
        Validators.pattern(/^(assets\/images\/products\/)?[^\s]+\.(png|jpg|jpeg|webp)$/i)
      ]],
      description: [''],
      
      // Cột 2: Trạng thái
      availabilityStatus: [true, Validators.required],
      location: ['TP.HCM', Validators.required],
      
      // Cột 2: Giá
      pricePerDay: [0, [Validators.required, Validators.min(10000)]], // Tối thiểu 10.000
      pricePerHour: [0, [Validators.required, Validators.min(0)]],
      discount: [0, [Validators.required, Validators.min(0), Validators.max(100)]], // 0-100%
      
      // Cột 2: Thông số
      batteryCapacity: [' kWh'],
      rangePerCharge: [0, [Validators.min(1)]], // Tối thiểu 1
      
      // Cột 2: Tags
      tags: [''],
    });
  }

  /**
   * 🔽 THÊM MỚI: Helper để truy cập controls trong HTML
   */
  get f() {
    return this.bikeForm.controls;
  }

  goBack() {
    this.location.back();
  }

  /**
   * 🔽 THAY ĐỔI: Hàm "Lưu" giờ sẽ kiểm tra validation
   */
  saveChanges() {
    // 1. Đánh dấu tất cả là "touched" để hiện lỗi
    this.bikeForm.markAllAsTouched();
    
    // 2. Kiểm tra form
    if (this.bikeForm.invalid) {
      console.warn('Form không hợp lệ. Vui lòng kiểm tra lại.');
      // (Tùy chọn: Tự động cuộn đến trường lỗi đầu tiên)
      return;
    }

    // 3. Nếu hợp lệ, tiếp tục mở popup
    this.showConfirmPopup = true;
  }

  onCancelSave() {
    this.showConfirmPopup = false;
  }

  /**
   * 🔽 THAY ĐỔI: Lấy dữ liệu từ form khi xác nhận
   */
  onConfirmSave() {
    this.showConfirmPopup = false;
    this.isLoading = true;
    this.cdr.detectChanges();

    // Lấy giá trị từ form, bao gồm cả trường bị disabled (ID)
    const rawValue = this.bikeForm.getRawValue();
    
    // Xử lý tags
    const tagsArray = rawValue.tags.split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag); // Lọc bỏ tag rỗng
      
    const bikeDataToSave = {
      ...rawValue,
      tags: tagsArray
    };
    
    console.log('Dữ liệu chuẩn bị lưu:', bikeDataToSave);
    
    // Giả lập lưu
    setTimeout(() => {
      this.isLoading = false;
      this.showSuccessPopup = true;
      this.cdr.detectChanges(); 
    }, 1000);
  }

  /**
   * 🔽 THAY ĐỔI: Gọi lại hàm loadAndInitializeForm để reset
   */
  onCloseSuccessAndReset() {
    this.showSuccessPopup = false;
    this.loadAndInitializeForm(); // Tải lại để lấy ID mới
  }

  onCloseSuccessAndGoBack() {
    this.showSuccessPopup = false;
    this.router.navigate(['/admin/bike']); 
  }
}