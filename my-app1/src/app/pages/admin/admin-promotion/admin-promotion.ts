import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Cần thiết cho filter

// Interface gốc từ JSON
interface Promotion {
  id: string;
  maGiamGia: string;
  tenKhuyenMai: string;
  loaiGiamGia: 'percent' | 'fixed';
  giaTri: number;
  donHangToiThieu: number;
  soLuongToiDa: number;
  soLuongDaDung: number;
  ngayBatDau: string; // ISO Date
  ngayKetThuc: string; // ISO Date
  trangThai: 'active' | 'inactive';
}

// Interface đã xử lý để hiển thị
interface ProcessedPromotion extends Promotion {
  trangThaiHienThi: string;
  trangThaiClass: string;
  giaTriHienThi: string;
  rawPromotionData: Promotion; // ⬅️ THÊM DÒNG NÀY
}

@Component({
  selector: 'app-admin-promotion',
  standalone: true,
  imports: [CommonModule, FormsModule], // Thêm FormsModule
  templateUrl: './admin-promotion.html',
  styleUrl: './admin-promotion.css'
})
export class AdminPromotion implements OnInit {
  allPromotions: ProcessedPromotion[] = [];
  filteredPromotions: ProcessedPromotion[] = [];
  isLoading: boolean = true;

  // Thuộc tính cho bộ lọc
  searchTerm = '';
  statusFilter = ''; // 'active', 'inactive', 'expired'
  typeFilter = ''; // 'percent', 'fixed'

  // Thuộc tính cho sắp xếp
  sortColumn: keyof ProcessedPromotion | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.http.get<Promotion[]>('assets/data/promotions.json').subscribe({
      next: (data) => {
        this.allPromotions = data.map(promo => this.mapData(promo));
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Không tải được dữ liệu khuyến mãi', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Xử lý dữ liệu thô thành dữ liệu hiển thị
   */
  mapData(promo: Promotion): ProcessedPromotion {
    const statusInfo = this.getDisplayStatus(promo);

    return {
      ...promo,
      trangThaiHienThi: statusInfo.status,
      trangThaiClass: statusInfo.class,
      giaTriHienThi: promo.loaiGiamGia === 'percent'
        ? `${promo.giaTri}%`
        : `${promo.giaTri.toLocaleString('vi-VN')}đ`,
      rawPromotionData: promo // ⬅️ THÊM DÒNG NÀY
    };
  }

  /**
   * Helper: Lấy trạng thái & class CSS
   */
  getDisplayStatus(promo: Promotion): { status: string, class: string } {
    const now = new Date();
    const endDate = new Date(promo.ngayKetThuc);

    if (promo.trangThai === 'inactive') {
      return { status: 'Đã ẩn', class: 'inactive' };
    }
    if (endDate < now) {
      return { status: 'Hết hạn', class: 'expired' };
    }
    // (Bỏ qua ngày bắt đầu cho đơn giản, nếu active thì là active)
    return { status: 'Đang hoạt động', class: 'active' };
  }

  /**
   * Áp dụng tất cả bộ lọc
   */
  applyFilter() {
    const search = this.searchTerm.toLowerCase().trim();

    this.filteredPromotions = this.allPromotions.filter(p => {
      // 1. Lọc theo Search
      const matchesSearch = !search ||
        p.maGiamGia.toLowerCase().includes(search) ||
        p.tenKhuyenMai.toLowerCase().includes(search);

      // 2. Lọc theo Trạng thái hiển thị (từ mapData)
      const matchesStatus = !this.statusFilter ||
        p.trangThaiClass === this.statusFilter;

      // 3. Lọc theo Loại giảm giá
      const matchesType = !this.typeFilter ||
        p.loaiGiamGia === this.typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    this.applySort();
  }

  /**
   * Đặt lại bộ lọc
   */
  resetFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.typeFilter = '';
    this.sortColumn = '';
    this.applyFilter();
  }

  /**
   * Xử lý click Sắp xếp
   */
  onSort(columnKey: keyof ProcessedPromotion) {
    if (this.sortColumn === columnKey) {
      this.sortDirection = (this.sortDirection === 'asc') ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  /**
   * Logic Sắp xếp
   */
  applySort() {
    if (this.sortColumn) {
      this.filteredPromotions.sort((a, b) => {
        // Lấy giá trị (có thể là lồng nhau)
        const valA = a[this.sortColumn as keyof ProcessedPromotion];
        const valB = b[this.sortColumn as keyof ProcessedPromotion];

        let comparison = 0;

        // Xử lý số (giaTri, donHangToiThieu, soLuongDaDung)
        if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        }
        // Xử lý chuỗi (date string hoặc text)
        else if (typeof valA === 'string' && typeof valB === 'string') {
          // Xử lý ngày tháng (riêng biệt)
          if (this.sortColumn === 'ngayBatDau' || this.sortColumn === 'ngayKetThuc') {
            comparison = new Date(valA).getTime() - new Date(valB).getTime();
          } else {
            comparison = valA.localeCompare(valB, 'vi', { sensitivity: 'base' });
          }
        }

        return (this.sortDirection === 'desc') ? (comparison * -1) : comparison;
      });
    }
  }

  // --- Điều hướng ---
  goToDetail(promo: ProcessedPromotion) {
    // Chuyển đến trang chi tiết (nếu có)
    //this.router.navigate(['/admin/promotion-detail', promo.id]);
  }

  goToAddPage() {
    // Chuyển đến trang thêm mới
    this.router.navigate(['/admin/promotion-add']);
  }
  exportToCSV() {
    // 1. Lấy dữ liệu (xuất danh sách đã lọc)
    const dataToExport = this.filteredPromotions;

    if (dataToExport.length === 0) {
      alert('Không có dữ liệu để xuất.');
      return;
    }

    // 2. Định nghĩa tiêu đề cột (giống file JSON)
    const headers = [
      'id', 'maGiamGia', 'tenKhuyenMai', 'loaiGiamGia', 'giaTri',
      'donHangToiThieu', 'soLuongToiDa', 'soLuongDaDung', 
      'ngayBatDau', 'ngayKetThuc', 'trangThai'
    ];
    
    // 3. Chuẩn bị nội dung CSV
    let csvContent = headers.join(',') + '\n'; // Dòng tiêu đề

    // Hàm xử lý giá trị
    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) {
        return '';
      }
      let str = String(val);
      // Xử lý ngày tháng
      if (str.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)) {
         str = new Date(str).toLocaleString('vi-VN');
      }
      // Xử lý dấu phẩy, "
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        str = `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // 4. Thêm các dòng dữ liệu
    dataToExport.forEach(promo => {
      const item = promo.rawPromotionData; // Lấy dữ liệu JSON gốc

      const row = [
        escapeCSV(item.id),
        escapeCSV(item.maGiamGia),
        escapeCSV(item.tenKhuyenMai),
        escapeCSV(item.loaiGiamGia),
        escapeCSV(item.giaTri),
        escapeCSV(item.donHangToiThieu),
        escapeCSV(item.soLuongToiDa),
        escapeCSV(item.soLuongDaDung),
        escapeCSV(item.ngayBatDau),
        escapeCSV(item.ngayKetThuc),
        escapeCSV(item.trangThai)
      ];
      csvContent += row.join(',') + '\n';
    });

    // 5. Tạo và tải file (vẫn giữ BOM cho tiếng Việt)
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // BOM cho UTF-8
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);

    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `danh-sach-khuyen-mai-${date}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}