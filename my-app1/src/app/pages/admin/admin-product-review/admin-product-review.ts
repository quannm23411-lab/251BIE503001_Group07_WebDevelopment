import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 
import { forkJoin } from 'rxjs'; 
import { RouterLink } from '@angular/router';

// Định nghĩa interface (cho rõ ràng)
interface Review {
  reviewId: string;
  vehicleId: string;
  vehicleName?: string; 
  customerId: string;
  customerName: string;
  rating: number;
  reviewDate: string;
  title: string;
  content: string;
  images: string[];
  status: 'approved' | 'pending' | 'rejected';
}

interface Product {
  id: string;
  vehicleName: string;
}

@Component({
  selector: 'app-admin-product-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './admin-product-review.html',
  styleUrls: ['./admin-product-review.css']
})
export class AdminProductReview implements OnInit {
  isLoading: boolean = true;
  
  allReviews: Review[] = [];       
  filteredReviews: Review[] = [];  

  // ... (biến cho modal giữ nguyên) ...
  selectedReview: Review | null = null;
  showConfirmDeletePopup: boolean = false;
  reviewToDelete: Review | null = null;

  // ... (biến cho filter giữ nguyên) ...
  productMap = new Map<string, string>(); 
  vehicleOptions: Product[] = []; 
  filterVehicleId: string = 'all';
  filterStatus: string = 'all';
  filterSearchTerm: string = '';

  // =============================================
  // 🔽 THÊM MỚI: Biến trạng thái Sắp xếp
  // =============================================
  sortColumn: keyof Review | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    
    const reviews$ = this.http.get<any[]>('assets/data/product-reviews.json');
    const products$ = this.http.get<Product[]>('assets/data/products.json');

    forkJoin([reviews$, products$]).subscribe({
      next: ([reviewsData, productsData]) => {
        
        // 1. Xử lý products
        productsData.forEach(product => {
          this.productMap.set(product.id, product.vehicleName);
        });
        this.vehicleOptions = productsData; 

        // 2. Xử lý reviews
        this.allReviews = reviewsData.map(review => {
          const status = review.status || 'pending'; 
          return {
            ...review,
            vehicleName: this.productMap.get(review.vehicleId) || 'Không rõ',
            status: status 
          };
        });
        
        // =============================================
        // 🔽 THAY ĐỔI: Gọi applyFilters thay vì gán trực tiếp
        // =============================================
        this.applyFilters(); // ◀️ Sẽ tự động lọc và sắp xếp
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải dữ liệu:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- Logic Filter---

  applyFilters() {
    let tempReviews = [...this.allReviews];

    // 1. Lọc theo Trạng thái
    if (this.filterStatus !== 'all') {
      tempReviews = tempReviews.filter(r => r.status === this.filterStatus);
    }

    // 2. Lọc theo Xe
    if (this.filterVehicleId !== 'all') {
      tempReviews = tempReviews.filter(r => r.vehicleId === this.filterVehicleId);
    }

    // 3. Lọc theo Từ khóa tìm kiếm
    const searchTerm = this.filterSearchTerm.toLowerCase();
    if (searchTerm) {
      tempReviews = tempReviews.filter(r => 
        r.customerName.toLowerCase().includes(searchTerm) ||
        r.title.toLowerCase().includes(searchTerm) ||
        r.content.toLowerCase().includes(searchTerm)
      );
    }

    this.filteredReviews = tempReviews;

    // =============================================
    // 🔽 THÊM MỚI: Gọi Sắp xếp sau khi Lọc
    // =============================================
    this.applySort();
  }

  // ---Logic Actions (Hành động)---
  // ... (các hàm changeReviewStatus, askToDelete, onCancelDelete, onConfirmDelete giữ nguyên) ...
  changeReviewStatus(review: Review, newStatus: 'approved' | 'rejected') {
    const reviewInAll = this.allReviews.find(r => r.reviewId === review.reviewId);
    if (reviewInAll) {
      reviewInAll.status = newStatus;
    }
    this.applyFilters(); 
    console.log(`Đã cập nhật trạng thái review ${review.reviewId} thành ${newStatus}`);
  }
  askToDelete(review: Review) {
    this.reviewToDelete = review;
    this.showConfirmDeletePopup = true;
  }
  onCancelDelete() {
    this.reviewToDelete = null;
    this.showConfirmDeletePopup = false;
  }
  onConfirmDelete() {
    if (!this.reviewToDelete) return;
    this.allReviews = this.allReviews.filter(r => r.reviewId !== this.reviewToDelete!.reviewId);
    this.applyFilters();
    console.log(`Đã xóa review ${this.reviewToDelete.reviewId}`);
    this.onCancelDelete(); 
  }

  // ---Logic Modal Chi tiết---
  // ... (các hàm viewReviewDetail, closeModal, getStars giữ nguyên) ...
  viewReviewDetail(review: Review) {
    this.selectedReview = review;
  }
  closeModal() {
    this.selectedReview = null;
  }
  getStars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < rating);
  }

  // =============================================
  // 🔽 THÊM MỚI: Hàm Sắp xếp
  // =============================================
  
  /**
   * (Copy từ admin-bike)
   * Được gọi khi click vào tiêu đề cột
   */
  onSort(columnKey: keyof Review) {
    if (this.sortColumn === columnKey) {
      this.sortDirection = (this.sortDirection === 'asc') ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  /**
   * (Copy từ admin-bike, có điều chỉnh)
   * Hàm thực hiện logic sắp xếp
   */
  applySort() {
    if (this.sortColumn) {
      this.filteredReviews.sort((a, b) => {
        // Lấy giá trị A và B
        const valA = a[this.sortColumn as keyof Review];
        const valB = b[this.sortColumn as keyof Review];
        
        let comparison = 0;

        // Xử lý riêng cho 'rating' (vì là number)
        if (this.sortColumn === 'rating' && typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } 
        // Xử lý riêng cho 'reviewDate' (so sánh Date)
        else if (this.sortColumn === 'reviewDate' && typeof valA === 'string' && typeof valB === 'string') {
          comparison = new Date(valA).getTime() - new Date(valB).getTime();
        }
        // Xử lý cho tất cả các chuỗi khác (dùng Tiếng Việt)
        else if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB, 'vi', { sensitivity: 'base' });
        }
        
        return (this.sortDirection === 'desc') ? (comparison * -1) : comparison;
      });
    }
  }

  exportToCSV() {
    // 1. Lấy dữ liệu (xuất danh sách đã lọc)
    const dataToExport = this.filteredReviews;

    if (dataToExport.length === 0) {
      alert('Không có dữ liệu để xuất.');
      return;
    }

    // 2. Định nghĩa tiêu đề cột (giống file JSON + tên xe)
    const headers = [
      'reviewId', 'vehicleId', 'vehicleName', 'customerId', 'customerName', 
      'rating', 'reviewDate', 'status', 'title', 'content', 'images'
    ];
    
    // 3. Chuẩn bị nội dung CSV
    let csvContent = headers.join(',') + '\n'; // Dòng tiêu đề

    // Hàm xử lý giá trị
    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) {
        return '';
      }
      let str = String(val);
      
      // Xử lý ngày tháng (chỉ lấy ngày)
      if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
         str = new Date(str).toLocaleDateString('vi-VN');
      }
      
      // Xử lý mảng (cho 'images')
      if (Array.isArray(val)) {
        str = val.join(' | '); // Phân cách nhiều ảnh bằng " | "
      }
      
      // Xử lý dấu phẩy, "
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        str = `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // 4. Thêm các dòng dữ liệu
    dataToExport.forEach(review => {
      // Dữ liệu đã được "trải phẳng" sẵn trong 'review'
      const row = [
        escapeCSV(review.reviewId),
        escapeCSV(review.vehicleId),
        escapeCSV(review.vehicleName), // Tên xe đã map
        escapeCSV(review.customerId),
        escapeCSV(review.customerName),
        escapeCSV(review.rating),
        escapeCSV(review.reviewDate),
        escapeCSV(review.status),
        escapeCSV(review.title),
        escapeCSV(review.content),
        escapeCSV(review.images) // Mảng images
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
    link.setAttribute('download', `danh-sach-danh-gia-${date}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}