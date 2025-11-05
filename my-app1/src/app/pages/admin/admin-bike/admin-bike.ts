import { Component, OnInit } from '@angular/core';
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

  brandFilter = '';
  statusFilter = '';
  priceFilter = '';
  searchTerm = '';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.http.get<any[]>('assets/data/products.json').subscribe({
      next: data => {
        const mapped = this.mapData(data);
        this.bikes = mapped;
        this.filtered = mapped;
        this.brands = [...new Set(mapped.map(b => b.brand))];
      },
      error: err => console.error('Không tải được dữ liệu sản phẩm', err)
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
      location: 'Đà Nẵng',
      image: 'assets/' + item.image
    }));
  }

  applyFilter() {
    this.filtered = this.bikes.filter(b =>
      (!this.brandFilter || b.brand === this.brandFilter) &&
      (!this.statusFilter || b.status === this.statusFilter) &&
      (!this.searchTerm || b.name.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );

    if (this.priceFilter) {
      if (this.priceFilter === '<100000') this.filtered = this.filtered.filter(b => b.price < 100000);
      else if (this.priceFilter === '100000-150000') this.filtered = this.filtered.filter(b => b.price >= 100000 && b.price <= 150000);
      else this.filtered = this.filtered.filter(b => b.price > 150000);
    }
  }

  goToDetail(bike: Bike) {
    this.router.navigate(['/admin/bike-detail', bike.id]);
  }
}
