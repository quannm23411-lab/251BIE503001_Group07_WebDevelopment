import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core'; 
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms'; 
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-order-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-order-add.html',
  styleUrl: './admin-order-add.css'
})
export class AdminOrderAdd implements OnInit {
  @ViewChild('orderForm') orderForm!: NgForm;

  // Dữ liệu thô từ server
  customers: any[] = [];
  products: any[] = [];
  customerSearchDisplay: string = ''; 
  customerSearchResults: any[] = [];    
  private selectedCustomer: any = null; 
  
  newOrder: any; 

  // Trạng thái
  isLoading: boolean = true;
  isVehicleListEmpty: boolean = false; 
  
  // Dữ liệu cho các <select>
  orderStatuses = ['Đã xác nhận', 'Đang thuê', 'Đã hoàn thành', 'Đã hủy'];
  paymentStatuses = ['Chờ thanh toán', 'Đã thanh toán'];
  depositStatuses = ['Chờ xử lý', 'Đã thanh toán', 'Không yêu cầu'];
  vehicleStatuses = ['Đã đặt', 'Chờ giao', 'Đang thuê'];
  
  showConfirmPopup: boolean = false;
  showSuccessPopup: boolean = false;

  private productMap = new Map<string, any>();

  constructor(
    private http: HttpClient,
    private location: Location,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeNewOrder();
  }

  ngOnInit() {
    this.isLoading = true;
    
    const customers$ = this.http.get<any[]>('assets/data/customers.json');
    const products$ = this.http.get<any[]>('assets/data/products.json');

    forkJoin([customers$, products$]).subscribe({
      next: ([customersData, productsData]) => {
        this.customers = customersData;
        this.products = productsData.filter(p => p.availabilityStatus === true);
        this.productMap = new Map(this.products.map(p => [p.id, p]));
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải dữ liệu cho form', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  initializeNewOrder() {
    this.newOrder = {
      maDonThue: this.generateOrderId(),
      maKhachHang: '', 
      thoiGianDatHang: new Date().toISOString(),
      tienDatCoc: 0,
      trangThaiCoc: 'Chờ xử lý',
      tinhTrangDon: 'Đã xác nhận',
      thanhToan: {
        tongGiaTriGoc: 0,
        maGiamGia: null,
        tienGiam: 0,
        chiPhiSauGiam: 0,
        donViTienTe: 'VND',
        maThanhToan: null, // <-- THÊM MỚI
        tinhTrangThanhToan: 'Chờ thanh toán'
      },
      chiTietDonThue: [] 
    };
    
    this.isVehicleListEmpty = false;
  }

  generateOrderId(): string {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return `RENT${randomSuffix}`;
  }

  addVehicleItem() {
    this.newOrder.chiTietDonThue.push({
      idXe: '',
      soLuong: 1,
      donGia: 0,
      soNgayThue: 0, // Mặc định là 0
      tongGiaTri: 0,
      thoiGianNhanXe: '',
      thoiGianTraXe: '',
      diaDiemNhanXe: '',
      diaDiemTraXe: '',
      tinhTrangXe: 'Đã đặt'
    });
    this.isVehicleListEmpty = false;
  }

  removeVehicleItem(index: number) {
    this.newOrder.chiTietDonThue.splice(index, 1);
    this.updateCalculations();
  }

  onVehicleSelected(item: any) {
    const product = this.productMap.get(item.idXe);
    if (product) {
      item.donGia = product.pricePerDay; 
    }
    this.updateItemTotal(item); 
  }

  updateItemTotal(item: any) {
    item.tongGiaTri = (item.donGia || 0) * (item.soNgayThue || 0) * (item.soLuong || 0);
    this.updateCalculations(); 
  }

  /**
   * Hàm tính toán số ngày thuê
   */
  onDateChange(item: any) {
    if (item.thoiGianNhanXe && item.thoiGianTraXe) {
      const startDate = new Date(item.thoiGianNhanXe);
      const endDate = new Date(item.thoiGianTraXe);

      if (endDate <= startDate) {
        item.soNgayThue = 0; 
      } else {
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24); 
        item.soNgayThue = Math.ceil(diffDays); 
      }
    } else {
      item.soNgayThue = 0; 
    }
    
    this.updateItemTotal(item);
  }

  onCustomerSearch(event: any) {
    const searchTerm = event.target.value.toLowerCase().trim();
    this.customerSearchDisplay = event.target.value; 

    if (!searchTerm) {
      this.customerSearchResults = [];
      this.selectedCustomer = null;
      this.newOrder.maKhachHang = '';
      return;
    }

    this.customerSearchResults = this.customers.filter(c => 
      c.hoTen.toLowerCase().includes(searchTerm) || 
      c.soDienThoai.includes(searchTerm)
    ).slice(0, 5); 
  }
  
  selectCustomer(customer: any) {
    this.selectedCustomer = customer;
    this.newOrder.maKhachHang = customer.maKhachHang;
    this.customerSearchDisplay = `${customer.hoTen} (${customer.soDienThoai})`;
    this.customerSearchResults = [];
    
    this.orderForm.controls['maKhachHang']?.setValue(customer.maKhachHang);
    this.orderForm.controls['maKhachHang']?.markAsDirty();

    this.cdr.detectChanges(); 
  }
  
  onCustomerSearchBlur() {
    setTimeout(() => {
      this.customerSearchResults = [];
    }, 200);
  }
  
  goToAddCustomer() {
    this.router.navigate(['/admin/customer-add']);
  }
  
  updateCalculations() {
    let totalGoc = 0;
    for (const item of this.newOrder.chiTietDonThue) {
      totalGoc += item.tongGiaTri;
    }
    this.newOrder.thanhToan.tongGiaTriGoc = totalGoc;
    this.newOrder.thanhToan.chiPhiSauGiam = totalGoc - (this.newOrder.thanhToan.tienGiam || 0);
  }

  // --- Các hàm điều hướng và popup ---

  goBack() {
    this.location.back();
  }

  /**
   * 🔽 CẬP NHẬT: Logic gán lỗi
   */
  saveChanges() {
    this.orderForm.form.markAllAsTouched();
    this.isVehicleListEmpty = this.newOrder.chiTietDonThue.length === 0;

    let isDateInvalid = false;
    const chiTietControlsGroup = (this.orderForm.controls['chiTietDonThue'] as any);

    if (chiTietControlsGroup && chiTietControlsGroup.controls) {
      const chiTietControls = chiTietControlsGroup.controls;
      
      for (let i = 0; i < this.newOrder.chiTietDonThue.length; i++) {
        const item = this.newOrder.chiTietDonThue[i];
        const itemControls = chiTietControls[i].controls;

        if (item.thoiGianNhanXe && item.thoiGianTraXe) {
          // Kiểm tra 1: Ngày trả > Ngày nhận
          if (new Date(item.thoiGianNhanXe) >= new Date(item.thoiGianTraXe)) {
            isDateInvalid = true;
            itemControls['thoiGianTraXe']?.setErrors({ dateRangeInvalid: true });
          } 
          // Kiểm tra 2: Số ngày thuê (đã tính) phải > 0
          else if (item.soNgayThue <= 0) { 
            isDateInvalid = true;
            // Gán lỗi cho ô "Số ngày thuê"
            itemControls['soNgayThue']?.setErrors({ minDays: true }); 
          }
          // Nếu không có lỗi
          else {
            if (itemControls['thoiGianTraXe']?.errors?.['dateRangeInvalid']) {
              itemControls['thoiGianTraXe']?.setErrors(null);
            }
            if (itemControls['soNgayThue']?.errors?.['minDays']) {
              itemControls['soNgayThue']?.setErrors(null);
            }
          }
        }
      }
    }

    if (this.orderForm.invalid || this.isVehicleListEmpty || isDateInvalid) {
      console.warn('Form không hợp lệ. Vui lòng kiểm tra lại.');
      return; 
    }

    console.log('Dữ liệu đơn hàng mới:', this.newOrder);
    this.showConfirmPopup = true;
  }

  onCancelSave() {
    this.showConfirmPopup = false;
  }

  onConfirmSave() {
    this.showConfirmPopup = false;
    this.isLoading = true;
    this.cdr.detectChanges();

    console.log('ĐANG GỬI ĐƠN HÀNG MỚI...', this.newOrder);
    
    setTimeout(() => {
      this.isLoading = false;
      this.showSuccessPopup = true;
      this.cdr.detectChanges(); 
    }, 1000);
  }

  onCloseSuccessAndReset() {
    this.showSuccessPopup = false;
    this.initializeNewOrder(); 
    this.customerSearchDisplay = ''; 
    this.orderForm.resetForm(); 
    this.orderForm.form.patchValue(this.newOrder);
  }

  onCloseSuccessAndGoBack() {
    this.showSuccessPopup = false;
    this.router.navigate(['/admin/order']); 
  }
}