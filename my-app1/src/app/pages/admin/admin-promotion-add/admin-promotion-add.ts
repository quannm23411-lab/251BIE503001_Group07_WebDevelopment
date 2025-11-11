import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
// 🔽 Thêm các import cho Reactive Forms
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-promotion-add',
  standalone: true,
  // 🔽 Thêm 'ReactiveFormsModule' vào imports
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-promotion-add.html',
  styleUrl: './admin-promotion-add.css'
})
export class AdminPromotionAdd implements OnInit {
  promotionForm: FormGroup;
  isSubmitting = false;

  // 🔽 THÊM MỚI: Biến kiểm soát popup
  showConfirmPopup: boolean = false;
  showSuccessPopup: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient, // Giả lập việc POST data
    private cdr: ChangeDetectorRef // 👈 THÊM DÒNG NÀY
  ) {
    // Khởi tạo form với FormBuilder
    this.promotionForm = this.fb.group({
      // 1. Thông tin cơ bản
      maGiamGia: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]], // Chỉ nhận chữ và số
      tenKhuyenMai: ['', Validators.required],
      trangThai: ['active', Validators.required], // Mặc định là 'active'

      // 2. Loại và Giá trị
      loaiGiamGia: ['percent', Validators.required],
      giaTri: [10, [Validators.required, Validators.min(1)]],

      // 3. Điều kiện áp dụng
      donHangToiThieu: [0, [Validators.required, Validators.min(0)]],
      soLuongToiDa: [100, [Validators.required, Validators.min(1)]], // Tổng số mã

      // 4. Thời gian
      ngayBatDau: ['', Validators.required],
      ngayKetThuc: ['', Validators.required]
    }, {
      // 5. Validator cho cả nhóm (ví dụ: ngày kết thúc > ngày bắt đầu)
      validators: [this.dateRangeValidator]
    });
  }

  ngOnInit() {
    // (Có thể dùng để tải dữ liệu nếu là trang Edit)
  }

  /**
   * Validator tùy chỉnh: Kiểm tra ngày kết thúc phải sau ngày bắt đầu
   */
  dateRangeValidator(form: FormGroup) {
    const startDate = form.get('ngayBatDau')?.value;
    const endDate = form.get('ngayKetThuc')?.value;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      // Gán lỗi cho control 'ngayKetThuc'
      form.get('ngayKetThuc')?.setErrors({ dateInvalid: true });
    } else {
      // Xóa lỗi nếu đã hợp lệ
      if (form.get('ngayKetThuc')?.hasError('dateInvalid')) {
        form.get('ngayKetThuc')?.setErrors(null);
      }
    }
  }

  /**
   * Helper để truy cập nhanh control trong HTML
   */
  get f() {
    return this.promotionForm.controls;
  }

  /**
   * Xử lý khi nhấn nút "Lưu"
   */
  onSubmit() {
    // Đánh dấu tất cả các trường là "touched" để hiển thị lỗi (nếu có)
    this.promotionForm.markAllAsTouched();

    // Nếu form không hợp lệ, dừng lại
    if (this.promotionForm.invalid) {
      console.warn('Form không hợp lệ:', this.promotionForm.value);
      return;
    }

    // 🔽 THAY ĐỔI: Nếu form hợp lệ, chỉ hiển thị popup xác nhận
    this.showConfirmPopup = true;
  }

  // 🔽 THÊM MỚI: Hủy từ popup
  onCancelSave() {
    this.showConfirmPopup = false;
  }

  // 🔽 THÊM MỚI: Xác nhận lưu (chứa logic cũ của hàm onSubmit)
onConfirmSave() {
    this.showConfirmPopup = false;
    this.isSubmitting = true;
    this.cdr.detectChanges(); // 👈 BẮT BUỘC: Báo Angular "Vẽ lại màn hình loading"

    const newPromoData = this.promotionForm.value;

    console.log('ĐANG GỬI DỮ LIỆU (POST):', newPromoData);
    
    setTimeout(() => {
      console.log('GIẢ LẬP LƯU THÀNH CÔNG!');
      this.isSubmitting = false;
      this.showSuccessPopup = true; 
      this.cdr.detectChanges(); // 👈 BẮT BUỘC: Báo Angular "Tắt loading, hiện popup success"
    }, 1000);
  }

  // 🔽 THÊM MỚI: Đóng popup thành công và quay về danh sách
  onCloseSuccessAndGoBack() {
    this.showSuccessPopup = false;
    this.router.navigate(['/admin/promotion']);
  }

  // 🔽 THÊM MỚI: Đóng popup thành công và reset form (thêm mới)
  onCloseSuccessAndReset() {
    this.showSuccessPopup = false;
    // Reset form về giá trị mặc định
    this.promotionForm.reset({
      trangThai: 'active',
      loaiGiamGia: 'percent',
      giaTri: 10,
      donHangToiThieu: 0,
      soLuongToiDa: 100,
      maGiamGia: '',
      tenKhuyenMai: '',
      ngayBatDau: '',
      ngayKetThuc: ''
    });
  }

  /**
   * Nút "Hủy" hoặc "Quay lại"
   */
  goBack() {
    this.router.navigate(['/admin/promotion']);
  }
}