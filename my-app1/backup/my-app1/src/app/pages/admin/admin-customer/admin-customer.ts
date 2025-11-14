import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ProcessedCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  joinDate: string;
  status: string;
  statusClass: string;
  rawCustomerData: any;
}

@Component({
  selector: 'app-admin-customer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-customer.html',
  styleUrl: './admin-customer.css'
})
export class AdminCustomer implements OnInit {
  allCustomers: ProcessedCustomer[] = [];
  filtered: ProcessedCustomer[] = [];
  statuses: string[] = []; 
  
  searchTerm = '';
  statusFilter = '';
  isLoading: boolean = true;

  // 🔽 THÊM MỚI: Biến theo dõi trạng thái sắp xếp
  sortColumn: keyof ProcessedCustomer | '' = ''; // Column key (id, name, phone...)
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.http.get<any[]>('assets/data/customers.json').subscribe({
      next: data => {
        this.allCustomers = this.mapData(data);
        this.statuses = [...new Set(this.allCustomers.map(c => c.status))]; 
        
        // 🔽 THAY ĐỔI: Gọi applyFilter() thay vì 2 dòng riêng
        this.applyFilter(); 
        
        this.isLoading = false;      
        this.cdr.detectChanges(); 
      },
      error: err => {
        console.error('Không tải được dữ liệu khách hàng', err);
        this.isLoading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  mapData(data: any[]): ProcessedCustomer[] {
    // ... (Giữ nguyên hàm mapData)
    return data.map(item => {
      const hangTV = item.hangThanhVien || 'Không rõ'; 
      return {
        id: item.maKhachHang,
        name: item.hoTen,
        phone: item.soDienThoai,
        email: item.email,
        joinDate: item.ngayDangKy, 
        status: hangTV,
        statusClass: this.getStatusClass(hangTV),
        rawCustomerData: item
      };
    });
  }

  getStatusClass(hang: string): string {
    // ... (Giữ nguyên hàm getStatusClass)
    switch (hang) {
      case 'Vàng': return 'vang';
      case 'Bạc': return 'bac';
      case 'Đồng': return 'dong';
      default: return 'khac';
    }
  }

  /**
   * Áp dụng bộ lọc
   */
  applyFilter() {
    this.filtered = this.allCustomers.filter(c => {
        const search = this.searchTerm.toLowerCase().trim();
        const matchesSearch = !this.searchTerm || 
                              c.name.toLowerCase().includes(search) || 
                              c.phone.includes(search) ||
                              c.email.toLowerCase().includes(search) ||
                              c.id.toLowerCase().includes(search);
        const matchesStatus = !this.statusFilter || c.status === this.statusFilter;
        return matchesSearch && matchesStatus;
      }
    );

    // 🔽 THÊM MỚI: Gọi hàm sắp xếp sau khi lọc
    this.applySort();
  }

  /**
   * Đặt lại bộ lọc
   */
  resetFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    
    // 🔽 THÊM MỚI: Reset cả sắp xếp
    this.sortColumn = '';
    
    this.applyFilter(); 
  }

  goToDetail(customer: ProcessedCustomer) {
    // ... (Giữ nguyên hàm goToDetail)
    this.router.navigate(['/admin/customer-detail', customer.id]);
  }

  // 🔽 THÊM MỚI: Hàm thực hiện sắp xếp
applySort() {
    if (this.sortColumn) {
      this.filtered.sort((a, b) => {
        const valA = a[this.sortColumn as keyof ProcessedCustomer];
        const valB = b[this.sortColumn as keyof ProcessedCustomer];
        
        let comparison = 0;

        // Kiểm tra nếu là string, dùng localeCompare cho Tiếng Việt
        if (typeof valA === 'string' && typeof valB === 'string') {
          // 'vi' = Vietnamese, 'sensitivity: "base"' giúp coi "a" và "á" gần giống nhau
          // khi so sánh, nhưng vẫn ưu tiên dấu đúng.
          comparison = valA.localeCompare(valB, 'vi', { sensitivity: 'base' });
        } 
        // Nếu là kiểu dữ liệu khác (ví dụ: số), so sánh như cũ
        else {
          if (valA > valB) {
            comparison = 1;
          } else if (valA < valB) {
            comparison = -1;
          }
        }
        
        // Đảo chiều nếu sắp xếp giảm dần
        return (this.sortDirection === 'desc') ? (comparison * -1) : comparison;
      });
    }
  }

  // 🔽 THÊM MỚI: Hàm được gọi khi click vào tiêu đề
  onSort(columnKey: keyof ProcessedCustomer) {
    // Nếu click cột cũ -> đổi chiều
    if (this.sortColumn === columnKey) {
      this.sortDirection = (this.sortDirection === 'asc') ? 'desc' : 'asc';
    } 
    // Nếu click cột mới -> sắp xếp tăng dần
    else {
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }
    
    // Sắp xếp lại danh sách đã lọc
    this.applySort();
  }
  goToAddPage() {
    this.router.navigate(['/admin/customer-add']);
  }
}