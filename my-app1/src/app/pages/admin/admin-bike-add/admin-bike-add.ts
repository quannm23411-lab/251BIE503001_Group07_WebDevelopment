import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-bike-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './admin-bike-add.html',
  styleUrl: './admin-bike-add.css' 
})
export class AdminBikeAdd implements OnInit {
  bikeForm!: FormGroup; 
  isLoading: boolean = true;
  
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
    private http: HttpClient,
    private fb: FormBuilder 
  ) {
    this.bikeForm = this.fb.group({});
  }

  ngOnInit() {
    this.loadAndInitializeForm();
  }

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
        this.initializeNewBike(`V${Math.floor(1000 + Math.random() * 9000)}`); 
        this.isLoading = false;
      }
    });
  }

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
   * 🔽 THAY ĐỔI: Thêm 'rating' và 'details' (FormGroup lồng)
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

      // =============================================
      // 🔽 THÊM MỚI: Nested FormGroup cho 'details'
      // =============================================
      details: this.fb.group({
        title: ['', Validators.required],
        paragraphs: [''], // Dùng textarea, phân tách bằng \n
        features: ['']    // Dùng textarea, phân tách bằng \n
      }),
      
      // Cột 2: Trạng thái
      availabilityStatus: [true, Validators.required],
      location: ['TP.HCM', Validators.required],
      
      // Cột 2: Giá
      pricePerDay: [0, [Validators.required, Validators.min(10000)]], 
      pricePerHour: [0, [Validators.required, Validators.min(0)]],
      discount: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      
      // =============================================
      // 🔽 THÊM MỚI: Trường 'rating'
      // =============================================
      rating: [0, [Validators.required, Validators.min(0), Validators.max(5)]],

      // Cột 2: Thông số
      batteryCapacity: [' kWh'],
      rangePerCharge: [0, [Validators.min(1)]], 
      
      // Cột 2: Tags
      tags: [''],
    });
  }

  get f() {
    return this.bikeForm.controls;
  }

  goBack() {
    this.location.back();
  }

  saveChanges() {
    this.bikeForm.markAllAsTouched();
    
    if (this.bikeForm.invalid) {
      console.warn('Form không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }
    this.showConfirmPopup = true;
  }

  onCancelSave() {
    this.showConfirmPopup = false;
  }

  /**
   * 🔽 THAY ĐỔI: Xử lý 'details' khi lưu
   */
  onConfirmSave() {
    this.showConfirmPopup = false;
    this.isLoading = true;
    this.cdr.detectChanges();

    const rawValue = this.bikeForm.getRawValue();
    
    // Xử lý tags
    const tagsArray = rawValue.tags.split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag); 
      
    // =============================================
    // 🔽 THÊM MỚI: Xử lý 'details' từ string -> array
    // =============================================
    const paragraphsArray = rawValue.details.paragraphs.split('\n')
      .map((p: string) => p.trim())
      .filter((p: string) => p);

    const featuresArray = rawValue.details.features.split('\n')
      .map((f: string) => f.trim())
      .filter((f: string) => f);
      
    const bikeDataToSave = {
      ...rawValue,
      tags: tagsArray,
      // =============================================
      // 🔽 THAY ĐỔI: Ghi đè 'details' bằng object đã xử lý
      // =============================================
      details: {
        title: rawValue.details.title,
        paragraphs: paragraphsArray,
        features: featuresArray
      }
    };
    
    console.log('Dữ liệu chuẩn bị lưu:', bikeDataToSave);
    
    setTimeout(() => {
      this.isLoading = false;
      this.showSuccessPopup = true;
      this.cdr.detectChanges(); 
    }, 1000);
  }

  onCloseSuccessAndReset() {
    this.showSuccessPopup = false;
    this.loadAndInitializeForm(); 
  }

  onCloseSuccessAndGoBack() {
    this.showSuccessPopup = false;
    this.router.navigate(['/admin/bike']); 
  }
}