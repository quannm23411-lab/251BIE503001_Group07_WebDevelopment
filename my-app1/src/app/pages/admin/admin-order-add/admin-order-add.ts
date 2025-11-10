import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-order-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-order-add.html',
  styleUrl: './admin-order-add.css' // Dùng file CSS riêng
})
export class AdminOrderAdd implements OnInit {
  
  // Dữ liệu thô từ server
  customers: any[] = [];
  products: any[] = [];
  customerSearchDisplay: string = ''; // Text hiển thị trên ô input
  customerSearchResults: any[] = [];    // Mảng kết quả
  private selectedCustomer: any = null; // Lưu trữ khách hàng đã chọn
  // Model chính cho form
  newOrder: any; 

  // Trạng thái
  isLoading: boolean = true;
  
  // Dữ liệu cho các <select> (copy từ detail)
  orderStatuses = ['Đã xác nhận', 'Đang thuê', 'Đã hoàn thành', 'Đã hủy'];
  paymentStatuses = ['Chờ thanh toán', 'Đã thanh toán'];
  depositStatuses = ['Chờ xử lý', 'Đã thanh toán', 'Không yêu cầu'];
  vehicleStatuses = ['Đã đặt', 'Chờ giao', 'Đang thuê'];
  
  // Biến kiểm soát popup
  showConfirmPopup: boolean = false;
  showSuccessPopup: boolean = false;

  private productMap = new Map<string, any>();

  constructor(
    private http: HttpClient,
    private location: Location,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Khởi tạo model newOrder ngay lập tức
    this.initializeNewOrder();
  }

  ngOnInit() {
    this.isLoading = true;
    
    // Tải danh sách khách hàng và sản phẩm
    const customers$ = this.http.get<any[]>('assets/data/customers.json');
    const products$ = this.http.get<any[]>('assets/data/products.json');

    forkJoin([customers$, products$]).subscribe({
      next: ([customersData, productsData]) => {
        this.customers = customersData;
        this.products = productsData.filter(p => p.availabilityStatus === true); // Chỉ lấy xe khả dụng
        
        // Tạo map để tra cứu giá xe nhanh
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

  /**
   * Khởi tạo đối tượng đơn hàng mới với giá trị mặc định
   */
  initializeNewOrder() {
    this.newOrder = {
      maDonThue: this.generateOrderId(),
      maKhachHang: '', // Sẽ được chọn
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
        tinhTrangThanhToan: 'Chờ thanh toán'
      },
      chiTietDonThue: [] // Mảng rỗng chờ thêm xe
    };
  }

  generateOrderId(): string {
    // Tạo ID ngẫu nhiên, vd: RENT12345
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return `RENT${randomSuffix}`;
  }

  /**
   * Thêm một dòng xe mới vào chiTietDonThue
   */
  addVehicleItem() {
    this.newOrder.chiTietDonThue.push({
      idXe: '',
      soLuong: 1,
      donGia: 0,     // Sẽ được cập nhật khi chọn xe
      soNgayThue: 1,
      tongGiaTri: 0, // Sẽ được tính
      thoiGianNhanXe: '',
      thoiGianTraXe: '',
      diaDiemNhanXe: '',
      diaDiemTraXe: '',
      tinhTrangXe: 'Đã đặt'
    });
  }

  /**
   * Xóa một dòng xe
   */
  removeVehicleItem(index: number) {
    this.newOrder.chiTietDonThue.splice(index, 1);
    this.updateCalculations(); // Tính lại tổng tiền
  }

  /**
   * Khi admin chọn một xe từ dropdown
   */
  onVehicleSelected(item: any) {
    const product = this.productMap.get(item.idXe);
    if (product) {
      item.donGia = product.pricePerDay; // Tự động điền đơn giá
    }
    this.updateItemTotal(item); // Tính lại tiền
  }

  /**
   * Tính lại tổng của 1 dòng xe
   */
  updateItemTotal(item: any) {
    item.tongGiaTri = (item.donGia || 0) * (item.soNgayThue || 0) * (item.soLuong || 0);
    this.updateCalculations(); // Cập nhật tổng tiền
  }

  /**
   * 🔽 THÊM MỚI: Xử lý khi chọn khách hàng
   * Kiểm tra xem admin có chọn "Thêm khách hàng mới" không
   */
  onCustomerSearch(event: any) {
    const searchTerm = event.target.value.toLowerCase().trim();
    this.customerSearchDisplay = event.target.value; // Cập nhật text hiển thị

    if (!searchTerm) {
      this.customerSearchResults = [];
      // Nếu xóa hết text, coi như bỏ chọn
      this.selectedCustomer = null;
      this.newOrder.maKhachHang = '';
      return;
    }

    // Lọc trên mảng customers đã tải
    this.customerSearchResults = this.customers.filter(c => 
      c.hoTen.toLowerCase().includes(searchTerm) || 
      c.soDienThoai.includes(searchTerm)
    ).slice(0, 5); // Chỉ hiển thị 5 kết quả đầu
  }

  /**
   * 🔽 THÊM MỚI: Xử lý khi click chọn 1 khách hàng từ danh sách
   */
  selectCustomer(customer: any) {
    // 1. Lưu thông tin
    this.selectedCustomer = customer;
    this.newOrder.maKhachHang = customer.maKhachHang;
    
    // 2. Cập nhật ô input để hiển thị
    this.customerSearchDisplay = `${customer.hoTen} (${customer.soDienThoai})`;
    
    // 3. Ẩn danh sách kết quả
    this.customerSearchResults = [];
  }

  /**
   * 🔽 THÊM MỚI: Xử lý khi click ra ngoài ô input
   * Dùng để ẩn danh sách kết quả
   */
  onCustomerSearchBlur() {
    // Dùng setTimeout để sự kiện 'mousedown' (của selectCustomer)
    // kịp chạy trước khi danh sách bị ẩn đi
    setTimeout(() => {
      this.customerSearchResults = [];
    }, 200);
  }

  /**
   * 🔽 THÊM MỚI: Hàm riêng cho nút Thêm mới (dễ quản lý)
   */
  goToAddCustomer() {
    this.router.navigate(['/admin/customer-add']);
  }
  /**
   * Tính lại toàn bộ thanh toán (tổng gốc, sau giảm)
   */
  updateCalculations() {
    // 1. Tính tổng giá trị gốc
    let totalGoc = 0;
    for (const item of this.newOrder.chiTietDonThue) {
      totalGoc += item.tongGiaTri;
    }
    this.newOrder.thanhToan.tongGiaTriGoc = totalGoc;

    // 2. Tính tổng sau giảm
    this.newOrder.thanhToan.chiPhiSauGiam = totalGoc - (this.newOrder.thanhToan.tienGiam || 0);
  }

  // --- Các hàm điều hướng và popup ---

  goBack() {
    this.location.back();
  }

  saveChanges() {
    // TODO: Thêm bước kiểm tra (validate) form tại đây
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

    // --- Giả lập gọi API ---
    console.log('ĐANG GỬI ĐƠN HÀNG MỚI...', this.newOrder);
    
    setTimeout(() => {
      this.isLoading = false;
      this.showSuccessPopup = true;
      this.cdr.detectChanges(); 
    }, 1000);
  }

  // Đóng popup và reset form để thêm đơn mới
  onCloseSuccessAndReset() {
    this.showSuccessPopup = false;
    this.initializeNewOrder(); // Reset lại form
  }

  // Đóng popup và quay về danh sách
  onCloseSuccessAndGoBack() {
    this.showSuccessPopup = false;
    this.router.navigate(['/admin/order']); // Điều hướng về danh sách
  }
}


