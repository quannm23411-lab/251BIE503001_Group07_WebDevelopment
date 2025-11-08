import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // ✅ thêm dòng này

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
}

@Component({
  selector: 'app-admin-bike',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ thêm FormsModule vào đây
  templateUrl: './admin-bike.html',
  styleUrl: './admin-bike.css'
})
export class AdminBike implements OnInit {
  bikes: Bike[] = [];
  filtered: Bike[] = [];
  brands: string[] = [];
  locations: string[] = []; // <-- THÊM MỚI (Yêu cầu 1)
  brandFilter = '';
  statusFilter = '';
  priceFilter = '';
  searchTerm = '';
  locationFilter = ''; // <-- THÊM MỚI (Yêu cầu 1)
  isLoading: boolean = true; // <-- THÊM BIẾN NÀY
  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.isLoading = true; // Bắt đầu tải
    this.http.get<any[]>('assets/data/products.json').subscribe({
      next: data => {
        const mapped = this.mapData(data);
        this.bikes = mapped;
       // this.filtered = mapped;
        this.applyFilter(); // Gọi hàm lọc ngay sau khi có data
        this.brands = [...new Set(mapped.map(b => b.brand))];
        this.locations = [...new Set(mapped.map(b => b.location))]; // <-- THÊM MỚI (Yêu cầu 1)
        this.isLoading = false; // <-- TẢI XONG, TẮT LOADING      
        this.cdr.detectChanges(); // <-- BÁO CHO ANGULAR CẬP NHẬT GIAO DIỆN
      },
      error: err => {
        console.error('Không tải được dữ liệu sản phẩm', err);
        this.isLoading = false; // <-- CÓ LỖI CŨNG TẮT LOADING
        this.cdr.detectChanges(); // <-- THÊM CẢ VÀO ĐÂY
      }
    });
  }

  mapData(data: any[]): Bike[] {
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
      status: item.availabilityStatus ? 'Sẵn sàng' : 'Đang cho thuê',
      statusClass: item.availabilityStatus ? 'ready' : 'rented',
      location: item.location,
      image: '' + item.image
    }));
  }

  applyFilter() {
    // Bắt đầu lại từ danh sách GỐC
    this.filtered = this.bikes.filter(b => {
        const search = this.searchTerm.toLowerCase();
        
        // CẬP NHẬT: Tìm theo Tên HOẶC Mã xe
        const matchesSearch = !this.searchTerm || 
                              b.name.toLowerCase().includes(search) || 
                              b.id.toLowerCase().includes(search);

        return matchesSearch &&
          (!this.brandFilter || b.brand === this.brandFilter) &&
          (!this.statusFilter || b.status === this.statusFilter) &&
          (!this.locationFilter || b.location === this.locationFilter); // <-- THÊM MỚI (Yêu cầu 1)
      }
    );
    if (this.priceFilter) {
      if (this.priceFilter === '<100000') this.filtered = this.filtered.filter(b => b.price < 100000);
      else if (this.priceFilter === '100000-150000') this.filtered = this.filtered.filter(b => b.price >= 100000 && b.price <= 150000);
      else this.filtered = this.filtered.filter(b => b.price > 150000);
    }
  }

resetFilters() {
    this.brandFilter = '';
    this.statusFilter = '';
    this.priceFilter = '';
    this.searchTerm = '';
    this.locationFilter = '';
    
    // Chạy lại hàm lọc để hiển thị đầy đủ danh sách
    this.applyFilter(); 
  }

  goToDetail(bike: Bike) {
    this.router.navigate(['/admin/bike-detail', bike.id]);
  }
}
