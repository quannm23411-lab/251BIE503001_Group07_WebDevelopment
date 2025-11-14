import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs'; // Dùng để tải nhiều file

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-order-detail.html',
  styleUrl: './admin-order-detail.css'
})
export class AdminOrderDetail implements OnInit {
  order: any; // Dữ liệu gốc từ orders.json
  customer: any; // Dữ liệu khách hàng
  rentedItems: any[] = []; // Mảng xe đã được xử lý (kết hợp)
  
  isLoading: boolean = true;
  
  // Dữ liệu cho <select>
  orderStatuses = ['Đã hoàn thành', 'Đang thuê', 'Đã xác nhận', 'Đã hủy'];
  paymentStatuses = ['Đã thanh toán', 'Chờ thanh toán'];
  depositStatuses = ['Đã thanh toán', 'Không yêu cầu', 'Chờ xử lý'];
  vehicleStatuses = ['Chờ giao', 'Đang thuê', 'Đã trả', 'Sự cố'];
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
        const orderId = params.get('id');

        if (orderId) {
            // Tải cả 3 file data cùng lúc
            const orders$ = this.http.get<any[]>('assets/data/orders.json');
            const customers$ = this.http.get<any[]>('assets/data/customers.json');
            const products$ = this.http.get<any[]>('assets/data/products.json'); // Giả sử bạn có file này
            
            forkJoin([orders$, customers$, products$]).subscribe({
                next: ([ordersData, customersData, productsData]) => {
                    
                    // 1. Tìm đơn hàng
                    const foundOrder = ordersData.find(o => o.maDonThue === orderId);
                    if (!foundOrder) {
                        console.error('Không tìm thấy đơn hàng:', orderId);
                        this.isLoading = false;
                        this.cdr.detectChanges();
                        return;
                    }
                    this.order = foundOrder;

                    // 2. Tìm khách hàng
                    this.customer = customersData.find(c => c.maKhachHang === this.order.maKhachHang);
                    if (!this.customer) {
                        this.customer = { hoTen: 'Khách vãng lai' }; // Dự phòng
                    }

                    // 3. Xử lý danh sách xe
                    const productMap = new Map(productsData.map(p => [p.id, p]));
                    this.rentedItems = this.order.chiTietDonThue.map((item: any) => {
                        const product = productMap.get(item.idXe) || {};
                        return {
                            ...item, // Dữ liệu từ order (soNgayThue, donGia...)
                            vehicleName: product.vehicleName || 'Không rõ tên xe',
                            image: product.image || 'assets/images/default.png'
                        };
                    });

                    this.isLoading = false; 
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Lỗi khi tải dữ liệu', err);
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

  // ... (Tất cả các hàm popup y hệt như admin-customer-detail) ...

  goBack() {
    this.location.back();
  }

  saveChanges() {
    this.showConfirmPopup = true;
  }

  onCancelSave() {
    this.showConfirmPopup = false;
  }

  onConfirmSave() {
    this.showConfirmPopup = false;
    this.isLoading = true;
    this.cdr.detectChanges();

    console.log('Đang lưu thay đổi cho:', this.order);
    
    setTimeout(() => {
      this.isLoading = false;
      this.showSuccessPopup = true;
      this.cdr.detectChanges(); 
    }, 1000);
  }

  onCloseSuccessAndStay() {
    this.showSuccessPopup = false;
  }

  onCloseSuccessAndGoBack() {
    this.showSuccessPopup = false;
    this.goBack();
  }
}