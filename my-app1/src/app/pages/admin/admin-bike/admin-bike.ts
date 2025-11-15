import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Bike {
  id: string;
  name: string;
  brand: string;
  price: number;
  battery: string;
  range: string;
  status: string;
  statusClass: string;
  location: string;
  image: string;
  rawProductData: any; // ⬅️ THÊM DÒNG NÀY
}

@Component({
  selector: 'app-admin-bike',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-bike.html',
  styleUrl: './admin-bike.css'
})
export class AdminBike implements OnInit {
  bikes: Bike[] = [];
  filtered: Bike[] = [];
  brands: string[] = [];
  locations: string[] = [];
  brandFilter = '';
  statusFilter = '';
  priceFilter = '';
  searchTerm = '';
  locationFilter = '';
  isLoading: boolean = true;

  
  // 🔽 THÊM MỚI: Biến theo dõi trạng thái sắp xếp
  sortColumn: keyof Bike | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.isLoading = true;
    this.http.get<any[]>('assets/data/products.json').subscribe({
      next: data => {
        const mapped = this.mapData(data);
        this.bikes = mapped;
        this.applyFilter(); 
        this.brands = [...new Set(mapped.map(b => b.brand))];
        this.locations = [...new Set(mapped.map(b => b.location))];
        this.isLoading = false;      
        this.cdr.detectChanges(); 
      },
      error: err => {
        console.error('Không tải được dữ liệu sản phẩm', err);
        this.isLoading = false; 
        this.cdr.detectChanges(); 
      }
    });
  }

  mapData(data: any[]): Bike[] {
    // ... (Giữ nguyên hàm mapData)
    const brandMap: Record<string, string> = {
      B001: 'VinFast',
      B002: 'Pega',
      B003: 'Dat Bike',
      B004: 'Yadea',
      B005: 'DK Bike'
    };

    return data.map(item => ({
      id: item.id,
      name: item.vehicleName,
      brand: brandMap[item.brandId] || 'Khác',
      price: item.pricePerDay,
      battery: item.batteryCapacity,
      range: item.rangePerCharge + ' KM',
      status: item.status,
      statusClass: item.availabilityStatus ? 'ready' : 'rented',
      location: item.location,
      image: '' + item.image,
      rawProductData: item // ⬅️ THÊM DÒNG NÀY
    }));
  }

  applyFilter() {
    this.filtered = this.bikes.filter(b => {
        const search = this.searchTerm.toLowerCase();
        const matchesSearch = !this.searchTerm || 
                              b.name.toLowerCase().includes(search) || 
                              b.id.toLowerCase().includes(search);

        return matchesSearch &&
          (!this.brandFilter || b.brand === this.brandFilter) &&
          (!this.statusFilter || b.status === this.statusFilter) &&
          (!this.locationFilter || b.location === this.locationFilter);
      }
    );
    if (this.priceFilter) {
      if (this.priceFilter === '<100000') this.filtered = this.filtered.filter(b => b.price < 100000);
      else if (this.priceFilter === '100000-150000') this.filtered = this.filtered.filter(b => b.price >= 100000 && b.price <= 150000);
      else this.filtered = this.filtered.filter(b => b.price > 150000);
    }
    
    // 🔽 THÊM MỚI: Sắp xếp sau khi lọc
    this.applySort();
  }

  resetFilters() {
    this.brandFilter = '';
    this.statusFilter = '';
    this.priceFilter = '';
    this.searchTerm = '';
    this.locationFilter = '';
    
    // 🔽 THÊM MỚI: Reset cả sắp xếp
    this.sortColumn = '';
    
    this.applyFilter(); 
  }

  goToDetail(bike: Bike) {
    this.router.navigate(['/admin/bike-detail', bike.id]);
  }
  
  // 🔽 THÊM MỚI: Hàm được gọi khi click vào tiêu đề
  onSort(columnKey: keyof Bike) {
    if (this.sortColumn === columnKey) {
      this.sortDirection = (this.sortDirection === 'asc') ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }
  goToAddPage() {
    this.router.navigate(['/admin/bike-add']);
  }
  // 🔽 THÊM MỚI: Hàm thực hiện sắp xếp
  applySort() {
    if (this.sortColumn) {
      this.filtered.sort((a, b) => {
        const valA = a[this.sortColumn as keyof Bike];
        const valB = b[this.sortColumn as keyof Bike];
        
        let comparison = 0;

        // Xử lý riêng cho 'price' (vì là number)
        if (this.sortColumn === 'price' && typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } 
        // Xử lý cho tất cả các chuỗi khác (dùng Tiếng Việt)
        else if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB, 'vi', { sensitivity: 'base' });
        }
        
        return (this.sortDirection === 'desc') ? (comparison * -1) : comparison;
      });
    }
  }
  // =============================================
  // 🔽 THAY THẾ HÀM CŨ BẰNG HÀM MỚI NÀY
  // =============================================
  exportToCSV() {
    // 1. Lấy dữ liệu (chúng ta sẽ xuất danh sách đã lọc)
    const dataToExport = this.filtered;

    if (dataToExport.length === 0) {
      alert('Không có dữ liệu để xuất.');
      return;
    }

    // 2. Định nghĩa tiêu đề cột (đã trải phẳng)
    const headers = [
      'id', 'vehicleName', 'brandId', 'model', 'licensePlate', 
      'batteryCapacity', 'rangePerCharge', 'vehicleType', 
      'pricePerHour', 'pricePerDay', 'availabilityStatus', 
      'rating', 'discount', 'location', 'tags', 'image', 'description', 
      'details_title', 'details_paragraphs', 'details_features'
    ];
    
    // 3. Chuẩn bị nội dung CSV
    let csvContent = headers.join(',') + '\n'; // Dòng tiêu đề

    // Hàm xử lý giá trị
    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) {
        return ''; // Trả về chuỗi rỗng
      }
      let str = String(val);
      // Bọc trong dấu ngoặc kép nếu chứa dấu phẩy, " hoặc xuống dòng
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        str = `"${str.replace(/"/g, '""')}"`; // Gấp đôi dấu "
      }
      return str;
    };

    // 4. Thêm các dòng dữ liệu
    dataToExport.forEach(bike => {
      const item = bike.rawProductData; // Lấy dữ liệu JSON gốc
      const details = item.details || {}; // Lấy object details

      // Xử lý các mảng (array) -> đổi thành chuỗi phân cách bằng " | "
      const tags = (item.tags || []).join(' | ');
      const paragraphs = (details.paragraphs || []).join(' | ');
      const features = (details.features || []).join(' | ');

      const row = [
        escapeCSV(item.id),
        escapeCSV(item.vehicleName),
        escapeCSV(item.brandId),
        escapeCSV(item.model),
        escapeCSV(item.licensePlate),
        escapeCSV(item.batteryCapacity),
        escapeCSV(item.rangePerCharge),
        escapeCSV(item.vehicleType),
        escapeCSV(item.pricePerHour),
        escapeCSV(item.pricePerDay),
        escapeCSV(item.availabilityStatus),
        escapeCSV(item.rating),
        escapeCSV(item.discount),
        escapeCSV(item.location),
        escapeCSV(tags), // Mảng đã xử lý
        escapeCSV(item.image),
        escapeCSV(item.description),
        escapeCSV(details.title), // Từ object lồng
        escapeCSV(paragraphs), // Mảng đã xử lý
        escapeCSV(features)  // Mảng đã xử lý
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
    link.setAttribute('download', `danh-sach-xe-${date}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}