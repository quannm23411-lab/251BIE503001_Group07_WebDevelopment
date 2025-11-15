import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

/**
 * CẬP NHẬT: Interface này giờ đại diện cho 1 XE trong 1 ĐƠN
 */
interface ProcessedRental {
  // --- Dữ liệu cấp Đơn hàng (sao chép cho mọi xe) ---
  maDonThue: string;
  khachHangTen: string;
  khachHangSdt: string;
  thoiGianDatHang: string; // ISO
  tongChiPhi: number; // chiPhiSauGiam
  tinhTrangDon: string;
  tinhTrangDonClass: string;
  paymentStatus: string; // tinhTrangThanhToan
  paymentStatusClass: string;
  khuVuc: string; 
  tienDatCoc: number;
  trangThaiCoc: string;
  cocStatusClass: string; 
  tongGiaTriGoc: number;
  maGiamGia: string | null;
  tienGiam: number;
  maThanhToan: string | null; 
  
  // --- Dữ liệu cấp Xe (duy nhất cho mỗi hàng) ---
  isFirstInOrder: boolean; // Dùng để ẩn/hiện ở các view khác
  idXe: string;
  tenXe: string; // <-- THÊM MỚI
  thoiGianNhanXe: string; // ISO
  thoiGianTraXe: string; // ISO
  diaDiemNhanXe: string;
  tinhTrangXe: string; // e.g., "Đã đặt", "Đã trả"
  vehicleStatusClass: string; 
  
  rawRentalData: any; 
}


@Component({
  selector: 'app-admin-order',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './admin-order.html',
  styleUrl: './admin-order.css'
})
export class AdminOrder implements OnInit {
  rentals: ProcessedRental[] = [];
  filteredRentals: ProcessedRental[] = [];
  isLoading: boolean = true;

  // Biến quản lý View
  currentView: 'default' | 'handover' | 'payment' = 'default';

  // Thuộc tính cho bộ lọc
  searchTerm = '';
  statusFilter = '';
  locationFilter = ''; 
  startDateFilter = '';
  endDateFilter = '';   
  
  statuses = ['Đã hoàn thành', 'Đang thuê', 'Đã xác nhận', 'Đã huỷ'];
  locations = ['TP. Hồ Chí Minh', 'TP. Hà Nội', 'TP. Đà Nẵng', 'Khác'];

  // Biến theo dõi trạng thái sắp xếp
  sortColumn: keyof ProcessedRental | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isLoading = true;
    // === CẬP NHẬT: Tải thêm products.json ===
    const rentals$ = this.http.get<any[]>('assets/data/orders.json');
    const customers$ = this.http.get<any[]>('assets/data/customers.json');
    const products$ = this.http.get<any[]>('assets/data/products.json');

    forkJoin([rentals$, customers$, products$]).subscribe({
      next: ([rentalsData, customersData, productsData]) => {
        const customerMap = new Map(customersData.map(c => [c.maKhachHang, c]));
        const productMap = new Map(productsData.map(p => [p.id, p])); // <-- TẠO MAP XE
        
        // === CẬP NHẬT: mapData giờ sẽ "bung" dữ liệu ===
        const mapped = this.mapData(rentalsData, customerMap, productMap);
        
        this.rentals = mapped;
        
        // Cập nhật mảng statuses từ dữ liệu thực tế
        const uniqueStatuses = [...new Set(mapped.map(r => r.tinhTrangDon))];
        this.statuses = uniqueStatuses.sort();

        this.applyFilter();
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Không tải được dữ liệu', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Hàm đổi view
  setView(view: 'default' | 'handover' | 'payment') {
    this.currentView = view;
    this.sortColumn = '';
  }
  
  getKhuVuc(diaDiem: string): string {
    const diaDiemLower = diaDiem.toLowerCase();
    if (diaDiemLower.includes('hà nội') || diaDiemLower.includes('hanoi')) {
      return 'TP. Hà Nội';
    }
    if (diaDiemLower.includes('hcm') || diaDiemLower.includes('hồ chí minh')) {
      return 'TP. Hồ Chí Minh';
    }
    if (diaDiemLower.includes('đà nẵng') || diaDiemLower.includes('danang')) {
      return 'TP. Đà Nẵng';
    }
    return 'Khác';
  }

  // === CẬP NHẬT LỚN: "Bung" đơn hàng thành các hàng xe ===
  mapData(rentals: any[], customerMap: Map<string, any>, productMap: Map<string, any>): ProcessedRental[] {
    const processedList: ProcessedRental[] = [];

    rentals.forEach(rental => {
      const customer = customerMap.get(rental.maKhachHang) || {};
      const status = rental.tinhTrangDon;
      const payment = rental.thanhToan || {};
      const paymentStatus = payment.tinhTrangThanhToan || 'Chờ thanh toán';
      const cocStatus = rental.trangThaiCoc || 'Không yêu cầu';

      // Lấy khu vực từ item đầu tiên (để lọc)
      const firstItemKhuVuc = rental.chiTietDonThue[0] || {};
      const khuVuc = this.getKhuVuc(firstItemKhuVuc.diaDiemNhanXe || 'N/A');

      // Lặp qua từng XE trong đơn
      rental.chiTietDonThue.forEach((item: any, index: number) => {
        const product = productMap.get(item.idXe) || {};
        const vehicleStatus = item.tinhTrangXe || 'N/A';

        processedList.push({
          // Dữ liệu Đơn hàng (sao chép)
          maDonThue: rental.maDonThue,
          khachHangTen: customer.hoTen || 'Khách vãng lai',
          khachHangSdt: customer.soDienThoai || 'N/A',
          thoiGianDatHang: rental.thoiGianDatHang,
          tongChiPhi: payment.chiPhiSauGiam || 0,
          tinhTrangDon: status,
          tinhTrangDonClass: this.getStatusClass(status),
          paymentStatus: paymentStatus,
          paymentStatusClass: this.getPaymentStatusClass(paymentStatus),
          khuVuc: khuVuc,
          tienDatCoc: rental.tienDatCoc || 0,
          trangThaiCoc: cocStatus,
          cocStatusClass: this.getPaymentStatusClass(cocStatus), 
          tongGiaTriGoc: payment.tongGiaTriGoc || 0,
          maGiamGia: payment.maGiamGia || null,
          tienGiam: payment.tienGiam || 0,
          maThanhToan: payment.maThanhToan || null,
          rawRentalData: rental,

          // Dữ liệu Xe (duy nhất)
          isFirstInOrder: index === 0, // <-- Cực kỳ quan trọng
          idXe: item.idXe,
          tenXe: product.vehicleName || 'Không rõ tên', // <-- THÊM MỚI
          thoiGianNhanXe: item.thoiGianNhanXe || 'N/A',
          thoiGianTraXe: item.thoiGianTraXe || 'N/A',
          diaDiemNhanXe: item.diaDiemNhanXe || 'N/A',
          tinhTrangXe: vehicleStatus, 
          vehicleStatusClass: this.getStatusClass(vehicleStatus), 
        });
      });
    });

    return processedList;
  }

  // Cập nhật: Thêm case cho "TT Xe"
  getStatusClass(status: string): string {
    switch (status) {
      case 'Đã hoàn thành': return 'completed';
      case 'Đang thuê': return 'rented';
      case 'Đã xác nhận': return 'confirmed';
      case 'Đã huỷ': return 'cancelled';
      // Các trạng thái khác
      case 'Chờ giao': return 'confirmed'; 
      case 'Đã trả': return 'completed';
      case 'Sự cố': return 'cancelled';
      default: return '';
    }
  }

  // Cập nhật: Thêm case cho "TT Cọc"
  getPaymentStatusClass(status: string): any {
    switch (status) {
      case 'Đã thanh toán': return 'paid';
      case 'Chờ thanh toán': return 'pending';
      case 'Không yêu cầu': return 'no-required';
      default: 'pending';
    }
  }


  /**
   * Hàm lọc (Không đổi)
   * Vẫn hoạt động tốt vì chúng ta lọc trên dữ liệu đã "bung"
   */
  applyFilter() {
    this.filteredRentals = this.rentals.filter(r => {
      const search = this.searchTerm.toLowerCase().trim();
      const matchesSearch = !search ||
        r.maDonThue.toLowerCase().includes(search) ||
        r.khachHangTen.toLowerCase().includes(search) ||
        r.khachHangSdt.includes(search) ||
        r.tenXe.toLowerCase().includes(search); // <-- Thêm tìm kiếm theo tên xe
      const matchesStatus = !this.statusFilter || r.tinhTrangDon === this.statusFilter;
      const matchesLocation = !this.locationFilter || r.khuVuc === this.locationFilter;
      let matchesDate = true;
      const orderDate = new Date(r.thoiGianDatHang);
      if (this.startDateFilter) {
        matchesDate = matchesDate && orderDate >= new Date(this.startDateFilter);
      }
      if (this.endDateFilter) {
        const endDate = new Date(this.endDateFilter);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && orderDate <= endDate;
      }

      return matchesSearch && matchesStatus && matchesLocation && matchesDate;
    });

    this.applySort();
  }

  /**
   * Reset lọc (Không đổi)
   */
  resetFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.locationFilter = '';
    this.startDateFilter = '';
    this.endDateFilter = '';
    this.sortColumn = '';
    this.applyFilter();
  }

  goToDetail(rental: ProcessedRental) {
    this.router.navigate(['/admin/order-detail', rental.maDonThue]);
  }
  goToAddPage() {
    this.router.navigate(['/admin/order-add']);
  }
  
  onSort(columnKey: keyof ProcessedRental) {
    if (this.sortColumn === columnKey) {
      this.sortDirection = (this.sortDirection === 'asc') ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  // Cập nhật: Thêm các cột số mới vào logic sắp xếp
  applySort() {
    if (this.sortColumn) {
      this.filteredRentals.sort((a, b) => {
        const valA = a[this.sortColumn as keyof ProcessedRental];
        const valB = b[this.sortColumn as keyof ProcessedRental];
        
        let comparison = 0;

        // Xử lý riêng cho các cột SỐ
        const numericColumns = ['tongChiPhi', 'tienDatCoc', 'tongGiaTriGoc', 'tienGiam'];
        if (numericColumns.includes(this.sortColumn) && typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } 
        // Xử lý cho tất cả các chuỗi
        else if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB, 'vi', { sensitivity: 'base' });
        }
        
        return (this.sortDirection === 'desc') ? (comparison * -1) : comparison;
      });
    }
  }

  exportToCSV() {
    // ... (Giữ nguyên hàm exportToCSV) ...
    // ... (Logic này vẫn đúng vì nó lặp qua rawRentalData) ...
    const rentalsToExport = this.filteredRentals;
    if (rentalsToExport.length === 0) {
      alert('Không có dữ liệu để xuất.');
      return;
    }
    // Lọc ra các đơn hàng duy nhất để xuất
    const uniqueOrders = new Map<string, ProcessedRental>();
    rentalsToExport.forEach(r => {
      uniqueOrders.set(r.maDonThue, r);
    });

    const headers = [
      'maDonThue', 'maKhachHang', 'thoiGianDatHang', 'tienDatCoc', 'trangThaiCoc', 'tinhTrangDon',
      'thanhToan_tongGiaTriGoc', 'thanhToan_maGiamGia', 'thanhToan_tienGiam', 
      'thanhToan_chiPhiSauGiam', 'thanhToan_tinhTrangThanhToan',
      'chiTiet_idXe', 'chiTiet_soLuong', 'chiTiet_donGia', 'chiTiet_soNgayThue',
      'chiTiet_tongGiaTri', 'chiTiet_thoiGianNhanXe', 'chiTiet_thoiGianTraXe',
      'chiTiet_diaDiemNhanXe', 'chiTiet_diaDiemTraXe', 'chiTiet_thoiGianTraXeThucTe',
      'chiTiet_tinhTrangXe'
    ];
    let csvContent = headers.join(',') + '\n';
    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) { return ''; }
      let str = String(val);
      if (str.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)) {
         str = new Date(str).toLocaleString('vi-VN');
      }
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        str = `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    uniqueOrders.forEach(rental => {
      const order = rental.rawRentalData;
      const payment = order.thanhToan || {};
      if (order.chiTietDonThue && order.chiTietDonThue.length > 0) {
        order.chiTietDonThue.forEach((item: any) => {
          const row = [
            escapeCSV(order.maDonThue), escapeCSV(order.maKhachHang), escapeCSV(order.thoiGianDatHang),
            escapeCSV(order.tienDatCoc), escapeCSV(order.trangThaiCoc), escapeCSV(order.tinhTrangDon),
            escapeCSV(payment.tongGiaTriGoc), escapeCSV(payment.maGiamGia), escapeCSV(payment.tienGiam),
            escapeCSV(payment.chiPhiSauGiam), escapeCSV(payment.tinhTrangThanhToan),
            escapeCSV(item.idXe), escapeCSV(item.soLuong), escapeCSV(item.donGia),
            escapeCSV(item.soNgayThue), escapeCSV(item.tongGiaTri), escapeCSV(item.thoiGianNhanXe),
            escapeCSV(item.thoiGianTraXe), escapeCSV(item.diaDiemNhanXe), escapeCSV(item.diaDiemTraXe),
            escapeCSV(item.thoiGianTraXeThucTe), escapeCSV(item.tinhTrangXe)
          ];
          csvContent += row.join(',') + '\n';
        });
      } else {
        const row = [
          escapeCSV(order.maDonThue), escapeCSV(order.maKhachHang), escapeCSV(order.thoiGianDatHang),
          escapeCSV(order.tienDatCoc), escapeCSV(order.trangThaiCoc), escapeCSV(order.tinhTrangDon),
          escapeCSV(payment.tongGiaTriGoc), escapeCSV(payment.maGiamGia), escapeCSV(payment.tienGiam),
          escapeCSV(payment.chiPhiSauGiam), escapeCSV(payment.tinhTrangThanhToan),
          '', '', '', '', '', '', '', '', '', '', '' 
        ];
        csvContent += row.join(',') + '\n';
      }
    });
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `danh-sach-don-thue-${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}