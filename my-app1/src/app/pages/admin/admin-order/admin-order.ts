import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

/**
 * Interface đã được xử lý (kết hợp) để hiển thị trên Bảng
 */
interface ProcessedRental {
  maDonThue: string;
  khachHangTen: string;
  khachHangSdt: string;
  thoiGianDatHang: string; // ISO date string
  tongChiPhi: number;
  tinhTrangDon: string;
  tinhTrangDonClass: string; // CSS class
  paymentStatus: string;
  paymentStatusClass: string;
  khuVuc: string; 
  rawRentalData: any; // Lưu dữ liệu gốc
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

  // Thuộc tính cho bộ lọc
  searchTerm = '';
  statusFilter = '';
  locationFilter = ''; 
  startDateFilter = '';
  endDateFilter = '';   
  
  statuses = ['Đã hoàn thành', 'Đang thuê', 'Đã xác nhận', 'Đã hủy'];
  locations = ['TP. Hồ Chí Minh', 'TP. Hà Nội', 'TP. Đà Nẵng', 'Khác'];

  // 🔽 THÊM MỚI: Biến theo dõi trạng thái sắp xếp
  sortColumn: keyof ProcessedRental | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isLoading = true;
    const rentals$ = this.http.get<any[]>('assets/data/orders.json');
    const customers$ = this.http.get<any[]>('assets/data/customers.json');

    forkJoin([rentals$, customers$]).subscribe({
      next: ([rentalsData, customersData]) => {
        const customerMap = new Map(customersData.map(c => [c.maKhachHang, c]));
        const mapped = this.mapData(rentalsData, customerMap);
        
        this.rentals = mapped;
        this.applyFilter();
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Không tải được dữ liệu đơn thuê', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  // ... (Giữ nguyên các hàm: getKhuVuc, mapData, getStatusClass, getPaymentStatusClass) ...
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

  mapData(rentals: any[], customerMap: Map<string, any>): ProcessedRental[] {
    return rentals.map(rental => {
      const customer = customerMap.get(rental.maKhachHang) || {};
      const status = rental.tinhTrangDon;
      const paymentStatus = rental.thanhToan.tinhTrangThanhToan || 'Chờ thanh toán';
      const diaDiem = rental.chiTietDonThue[0]?.diaDiemNhanXe || 'N/A';

      return {
        maDonThue: rental.maDonThue,
        khachHangTen: customer.hoTen || 'Khách vãng lai',
        khachHangSdt: customer.soDienThoai || 'N/A',
        thoiGianDatHang: rental.thoiGianDatHang,
        tongChiPhi: rental.thanhToan.chiPhiSauGiam,
        tinhTrangDon: status,
        tinhTrangDonClass: this.getStatusClass(status),
        paymentStatus: paymentStatus,
        paymentStatusClass: this.getPaymentStatusClass(paymentStatus),
        khuVuc: this.getKhuVuc(diaDiem),
        rawRentalData: rental
      };
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Đã hoàn thành': return 'completed';
      case 'Đang thuê': return 'rented';
      case 'Đã xác nhận': return 'confirmed';
      case 'Đã hủy': return 'cancelled';
      default: return '';
    }
  }

  getPaymentStatusClass(status: string): any {
    switch (status) {
      case 'Đã thanh toán': return 'paid';
      case 'Chờ thanh toán': return 'pending';
      default: 'pending';
    }
  }


  /**
   * Hàm lọc (Cập nhật)
   */
  applyFilter() {
    this.filteredRentals = this.rentals.filter(r => {
      // ... (Phần code lọc giữ nguyên) ...
      const search = this.searchTerm.toLowerCase().trim();
      const matchesSearch = !search ||
        r.maDonThue.toLowerCase().includes(search) ||
        r.khachHangTen.toLowerCase().includes(search) ||
        r.khachHangSdt.includes(search);
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
      // ... (Hết phần code lọc) ...

      return matchesSearch && matchesStatus && matchesLocation && matchesDate;
    });

    // 🔽 THÊM MỚI: Sắp xếp sau khi lọc
    this.applySort();
  }

  /**
   * Reset lọc (Cập nhật)
   */
  resetFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.locationFilter = '';
    this.startDateFilter = '';
    this.endDateFilter = '';
    
    // 🔽 THÊM MỚI: Reset cả sắp xếp
    this.sortColumn = '';
    
    this.applyFilter();
  }

  goToDetail(rental: ProcessedRental) {
    this.router.navigate(['/admin/order-detail', rental.maDonThue]);
  }
  goToAddPage() {
    this.router.navigate(['/admin/order-add']);
  }
  // 🔽 THÊM MỚI: Hàm được gọi khi click vào tiêu đề
  onSort(columnKey: keyof ProcessedRental) {
    if (this.sortColumn === columnKey) {
      this.sortDirection = (this.sortDirection === 'asc') ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  // 🔽 THÊM MỚI: Hàm thực hiện sắp xếp
  applySort() {
    if (this.sortColumn) {
      this.filteredRentals.sort((a, b) => {
        const valA = a[this.sortColumn as keyof ProcessedRental];
        const valB = b[this.sortColumn as keyof ProcessedRental];
        
        let comparison = 0;

        // Xử lý riêng cho 'tongChiPhi' (vì là number)
        if (this.sortColumn === 'tongChiPhi' && typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } 
        // Xử lý cho tất cả các chuỗi khác (dùng Tiếng Việt)
        // (Bao gồm cả ISO date string, so sánh chuỗi cũng đúng)
        else if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB, 'vi', { sensitivity: 'base' });
        }
        
        return (this.sortDirection === 'desc') ? (comparison * -1) : comparison;
      });
    }
  }
exportToCSV() {
    // 1. Lấy dữ liệu (lấy từ dữ liệu gốc đã lọc)
    const rentalsToExport = this.filteredRentals;

    if (rentalsToExport.length === 0) {
      alert('Không có dữ liệu để xuất.');
      return;
    }

    // 2. Định nghĩa tiêu đề cột (đã trải phẳng)
    const headers = [
      // Thông tin đơn hàng
      'maDonThue', 'maKhachHang', 'thoiGianDatHang', 'tienDatCoc', 'trangThaiCoc', 'tinhTrangDon',
      // Thông tin thanh toán
      'thanhToan_tongGiaTriGoc', 'thanhToan_maGiamGia', 'thanhToan_tienGiam', 
      'thanhToan_chiPhiSauGiam', 'thanhToan_tinhTrangThanhToan',
      // Chi tiết xe thuê (sẽ lặp)
      'chiTiet_idXe', 'chiTiet_soLuong', 'chiTiet_donGia', 'chiTiet_soNgayThue',
      'chiTiet_tongGiaTri', 'chiTiet_thoiGianNhanXe', 'chiTiet_thoiGianTraXe',
      'chiTiet_diaDiemNhanXe', 'chiTiet_diaDiemTraXe', 'chiTiet_thoiGianTraXeThucTe',
      'chiTiet_tinhTrangXe'
    ];
    
    // 3. Chuẩn bị nội dung CSV
    let csvContent = headers.join(',') + '\n'; // Dòng tiêu đề

    // Hàm xử lý giá trị (để tránh lỗi nếu tên có dấu phẩy)
    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) {
        return ''; // Trả về chuỗi rỗng cho giá trị null/undefined
      }
      let str = String(val);
      // Xử lý giá trị ngày tháng để dễ đọc hơn
      if (str.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)) {
         str = new Date(str).toLocaleString('vi-VN');
      }
      // Bọc trong dấu ngoặc kép nếu chứa dấu phẩy hoặc dấu xuống dòng
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        str = `"${str.replace(/"/g, '""')}"`; // Gấp đôi dấu ngoặc kép bên trong
      }
      return str;
    };

    // 4. Thêm các dòng dữ liệu (lặp qua từng xe trong đơn)
    rentalsToExport.forEach(rental => {
      const order = rental.rawRentalData; // Lấy dữ liệu JSON gốc
      const payment = order.thanhToan || {}; // Lấy object thanhToan

      // Lặp qua từng xe trong chiTietDonThue
      if (order.chiTietDonThue && order.chiTietDonThue.length > 0) {
        order.chiTietDonThue.forEach((item: any) => {
          const row = [
            // Thông tin đơn hàng (lặp lại)
            escapeCSV(order.maDonThue),
            escapeCSV(order.maKhachHang),
            escapeCSV(order.thoiGianDatHang),
            escapeCSV(order.tienDatCoc),
            escapeCSV(order.trangThaiCoc),
            escapeCSV(order.tinhTrangDon),
            // Thông tin thanh toán (lặp lại)
            escapeCSV(payment.tongGiaTriGoc),
            escapeCSV(payment.maGiamGia),
            escapeCSV(payment.tienGiam),
            escapeCSV(payment.chiPhiSauGiam),
            escapeCSV(payment.tinhTrangThanhToan),
            // Chi tiết xe (thay đổi)
            escapeCSV(item.idXe),
            escapeCSV(item.soLuong),
            escapeCSV(item.donGia),
            escapeCSV(item.soNgayThue),
            escapeCSV(item.tongGiaTri),
            escapeCSV(item.thoiGianNhanXe),
            escapeCSV(item.thoiGianTraXe),
            escapeCSV(item.diaDiemNhanXe),
            escapeCSV(item.diaDiemTraXe),
            escapeCSV(item.thoiGianTraXeThucTe),
            escapeCSV(item.tinhTrangXe)
          ];
          csvContent += row.join(',') + '\n';
        });
      } else {
        // Xử lý nếu đơn hàng không có chi tiết xe (hiếm gặp)
        const row = [
          escapeCSV(order.maDonThue), escapeCSV(order.maKhachHang), escapeCSV(order.thoiGianDatHang),
          escapeCSV(order.tienDatCoc), escapeCSV(order.trangThaiCoc), escapeCSV(order.tinhTrangDon),
          escapeCSV(payment.tongGiaTriGoc), escapeCSV(payment.maGiamGia), escapeCSV(payment.tienGiam),
          escapeCSV(payment.chiPhiSauGiam), escapeCSV(payment.tinhTrangThanhToan),
          // Các cột chi tiết xe để trống
          '', '', '', '', '', '', '', '', '', '', '' 
        ];
        csvContent += row.join(',') + '\n';
      }
    });

    // 5. Tạo và tải file (vẫn giữ BOM cho tiếng Việt)
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // BOM cho UTF-8
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