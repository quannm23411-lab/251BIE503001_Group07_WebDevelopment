import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-customer-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-customer-add.html',
  styleUrl: './admin-customer-add.css' // Dùng chung style với trang detail
})
export class AdminCustomerAdd implements OnInit {
  newCustomer: any; // Dùng 'any' để khớp với JSON
  isLoading: boolean = false; // Bắt đầu không load
  
  // Dữ liệu cho <select>
  memberTiers = ['Đồng', 'Bạc', 'Vàng']; // Mặc định

  // Biến kiểm soát popup
  showConfirmPopup: boolean = false;
  showSuccessPopup: boolean = false;

  constructor(
    private location: Location,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Khởi tạo đối tượng khách hàng mới ngay lập tức
    this.initializeNewCustomer();
  }

  ngOnInit() {
    // Không cần tải dữ liệu gì, chỉ cần hiển thị form
  }

  /**
   * Khởi tạo/Reset form
   */
  initializeNewCustomer() {
    const newId = `KH${Math.floor(1000 + Math.random() * 9000)}`; // Tạo ID ngẫu nhiên
    this.newCustomer = {
      maKhachHang: newId,
      hoTen: '',
      email: '',
      soDienThoai: '',
      ngaySinh: '',
      diaChi: {
        soNhaDuong: '',
        phuongXa: '',
        quanHuyen: '',
        tinhThanh: ''
      },
      thongTinBangLai: {
        soBangLai: '',
        hangBangLai: '',
        ngayHetHan: ''
      },
      ngayDangKy: new Date().toISOString(), // Đặt ngày đăng ký là hôm nay
      hangThanhVien: 'Đồng' // Mặc định
    };
  }

  /**
   * Quay lại trang trước
   */
  goBack() {
    this.location.back();
  }

  /**
   * Mở popup xác nhận
   */
  saveChanges() {
    // TODO: Thêm kiểm tra form (validation) ở đây
    console.log('Khách hàng mới:', this.newCustomer);
    this.showConfirmPopup = true;
  }

  /**
   * Hủy từ popup
   */
  onCancelSave() {
    this.showConfirmPopup = false;
  }

  /**
   * Xác nhận lưu
   */
  onConfirmSave() {
    this.showConfirmPopup = false;
    this.isLoading = true;
    this.cdr.detectChanges();

    console.log('Đang lưu khách hàng mới...', this.newCustomer);
    
    // Giả lập lưu thành công
    setTimeout(() => {
      this.isLoading = false;
      this.showSuccessPopup = true;
      this.cdr.detectChanges(); 
    }, 1000);
  }

  /**
   * Đóng popup thành công và ở lại (reset form)
   */
  onCloseSuccessAndReset() {
    this.showSuccessPopup = false;
    this.initializeNewCustomer(); // Reset form để thêm người mới
  }

  /**
   * Đóng popup thành công và quay về danh sách
   */
  onCloseSuccessAndGoBack() {
    this.showSuccessPopup = false;
    this.router.navigate(['/admin/customer']); // Quay về danh sách
  }
}