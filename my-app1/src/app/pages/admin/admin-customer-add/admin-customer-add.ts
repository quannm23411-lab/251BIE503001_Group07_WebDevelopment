import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core'; // 👈 THÊM ViewChild
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms'; // 👈 THÊM NgForm

@Component({
  selector: 'app-admin-customer-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-customer-add.html',
  styleUrl: './admin-customer-add.css'
})
export class AdminCustomerAdd implements OnInit {
  // 🔽 THÊM DÒNG NÀY: Tham chiếu đến <form #customerForm="ngForm">
  @ViewChild('customerForm') customerForm!: NgForm;

  newCustomer: any; 
  isLoading: boolean = false; 
  memberTiers = ['Đồng', 'Bạc', 'Vàng']; 
  showConfirmPopup: boolean = false;
  showSuccessPopup: boolean = false;

  constructor(
    private location: Location,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeNewCustomer();
  }

  ngOnInit() {
  }

  initializeNewCustomer() {
    const newId = `KH${Math.floor(1000 + Math.random() * 9000)}`; 
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
      ngayDangKy: new Date().toISOString(), 
      hangThanhVien: 'Đồng' 
    };
  }

  goBack() {
    this.location.back();
  }

  /**
   * 🔽 THAY ĐỔI HÀM NÀY 🔽
   */
  saveChanges() {
    // 1. Đánh dấu tất cả là "touched"
    this.customerForm.form.markAllAsTouched();

    // 2. Kiểm tra validation
    if (this.customerForm.invalid) {
      console.warn('Form không hợp lệ. Vui lòng kiểm tra lại.');
      return; // Dừng lại nếu form lỗi
    }

    // 3. Nếu hợp lệ, tiếp tục
    console.log('Khách hàng mới:', this.newCustomer);
    this.showConfirmPopup = true;
  }

  onCancelSave() {
    this.showConfirmPopup = false;
  }

  onConfirmSave() {
    this.showConfirmPopup = false;
    this.isLoading = true;
    this.cdr.detectChanges();
    console.log('Đang lưu khách hàng mới...', this.newCustomer);
    
    setTimeout(() => {
      this.isLoading = false;
      this.showSuccessPopup = true;
      this.cdr.detectChanges(); 
    }, 1000);
  }

  onCloseSuccessAndReset() {
    this.showSuccessPopup = false;
    this.initializeNewCustomer(); 
    this.customerForm.resetForm(this.newCustomer); // Reset trạng thái validation
  }

  onCloseSuccessAndGoBack() {
    this.showSuccessPopup = false;
    this.router.navigate(['/admin/customer']); 
  }
}