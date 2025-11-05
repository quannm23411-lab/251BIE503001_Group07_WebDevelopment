import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-bike-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-bike-detail.html',
  styleUrl: './admin-bike-detail.css'
})
export class AdminBikeDetail implements OnInit {
  vehicleName = '';
  mainImage = 'assets/images/products/default.jpg';
  thumbs: string[] = [];

  name = '';
  description = '';
  licensePlate = '';
  brand = '';
  typeList = ['Xe phổ thông', 'Xe cao cấp', 'Xe tay ga', 'Xe thể thao'];
  statusList = ['Sẵn sàng', 'Đang cho thuê', 'Bảo trì'];
  activeType = '';
  activeStatus = '';

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit() {
    // Giả định có product-detail.json trong assets/data/
    this.http.get<any>('assets/data/product-detail.json').subscribe({
      next: data => this.renderProduct(data),
      error: err => console.error('Không thể tải dữ liệu sản phẩm:', err)
    });
  }

  renderProduct(data: any) {
    this.vehicleName = `${data.vehicleName} / ${data.id}`;
    this.mainImage = 'assets/' + data.images[0];
    this.thumbs = data.images.map((img: string) => 'assets/' + img);

    this.name = data.vehicleName;
    this.description = data.description;
    this.licensePlate = data.licensePlate;
    this.brand = data.brand;
    this.activeType = data.type;
    this.activeStatus = data.status;
  }

  changeImage(img: string) {
    this.mainImage = img;
  }

  goBack() {
    history.back();
  }
}
