import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-customer-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-customer-detail.html',
  styleUrl: './admin-customer-detail.css'
})
export class AdminCustomerDetail implements OnInit {
  customer: any; // Dùng 'any' để khớp với JSON
  isLoading: boolean = true;
  
  // Dữ liệu cho <select>
  memberTiers = ['Vàng', 'Bạc', 'Đồng', 'Không rõ'];

  // Biến kiểm soát popup
  showConfirmPopup: boolean = false;
  showSuccessPopup: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isLoading = true;
    
    this.route.paramMap.subscribe(params => {
        const customerId = params.get('id');

        if (customerId) {
            this.http.get<any[]>('assets/data/customers.json').subscribe({
                next: (data) => {
                    const foundCustomer = data.find(c => c.maKhachHang === customerId);
                    
                    if (foundCustomer) {
                        this.customer = foundCustomer;
                    } else {
                        console.error('Không tìm thấy khách hàng với ID:', customerId);
                    }
                    this.isLoading = false; 
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Lỗi khi tải customers.json', err);
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

    console.log('Đang lưu thay đổi cho:', this.customer);
    
    // Giả lập lưu thành công
    setTimeout(() => {
      this.isLoading = false;
      this.showSuccessPopup = true;
      this.cdr.detectChanges(); 
    }, 1000);
  }

  /**
   * Đóng popup thành công và quay lại
   */
/**
   * 🔽 THÊM MỚI: Hàm này chỉ đóng popup và ở lại trang
   */
  onCloseSuccessAndStay() {
    this.showSuccessPopup = false;
  }

  /**
   * 🔽 THAY ĐỔI: Đổi tên hàm (từ onCloseSuccessPopup) 
   * và sẽ được gọi bởi nút "Quay về"
   */
  onCloseSuccessAndGoBack() {
    this.showSuccessPopup = false;
    this.goBack(); // Quay lại trang admin-customer
  }
}