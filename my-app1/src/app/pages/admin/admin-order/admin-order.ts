import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // ✅ thêm dòng này

interface Order {
  id: string;
  customer: string;
  phone: string;
  vehicle: string;
  date: string;
  total: number;
  brand: string;
  status: string;
  statusClass: string;
}

@Component({
  selector: 'app-admin-order',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ thêm FormsModule
  templateUrl: './admin-order.html',
  styleUrl: './admin-order.css'
})
export class AdminOrder implements OnInit {
  orders: Order[] = [];
  filtered: Order[] = [];
  brands: string[] = [];

  brandFilter = '';
  statusFilter = '';
  priceFilter = '';
  searchTerm = '';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get<Order[]>('assets/data/orders.json').subscribe({
      next: data => {
        this.orders = data;
        this.filtered = data;
        this.brands = [...new Set(data.map(o => o.brand))];
      },
      error: err => console.error('Không thể tải dữ liệu đơn hàng:', err)
    });
  }

  applyFilter() {
    let result = this.orders.filter(o =>
      (!this.brandFilter || o.brand === this.brandFilter) &&
      (!this.statusFilter || o.status === this.statusFilter) &&
      (!this.searchTerm || o.customer.toLowerCase().includes(this.searchTerm.toLowerCase()) || o.phone.includes(this.searchTerm))
    );

    if (this.priceFilter) {
      if (this.priceFilter === '<200000') result = result.filter(o => o.total < 200000);
      else if (this.priceFilter === '200000-400000') result = result.filter(o => o.total >= 200000 && o.total <= 400000);
      else result = result.filter(o => o.total > 400000);
    }

    this.filtered = result;
  }
}
