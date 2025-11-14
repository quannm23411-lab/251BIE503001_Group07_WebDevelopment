// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, RouterLink } from '@angular/router';
// import { HttpClient } from '@angular/common/http';

// interface AccountProfile {
//   fullname: string;
//   avatar?: string;
// }

// interface ChiTietDonThue {
//   idXe: string;
//   thoiGianNhanXe: string;
//   thoiGianTraXe: string;
// }

// interface OrderJson {
//   maDonThue: string;
//   maKhachHang: string;
//   thoiGianDatHang: string;
//   tinhTrangDon: string;
//   chiTietDonThue: ChiTietDonThue[];
// }

// interface ProductReview {
//   reviewId: string;
//   vehicleId: string;
//   customerId: string;
//   customerName: string;
//   rating: number;
//   reviewDate: string;
//   status: string;
//   title: string;
//   content: string;
//   images?: string[];
// }

// interface ReviewViewModel {
//   img: string;
//   bike: string;
//   start: string;
//   end: string;
//   status: string;
//   text: string;
//   time: string;
// }

// @Component({
//   selector: 'account-review',
//   standalone: true,
//   imports: [CommonModule, RouterLink],
//   templateUrl: './review.html',
//   styleUrls: ['./review.css']
// })
// export class AccountReview implements OnInit {

//   private route = inject(ActivatedRoute);
//   private http = inject(HttpClient);

//   user: AccountProfile = {
//     fullname: 'Khách EcoMOVE',
//     avatar: '/assets/images/avatars/default.png'
//   };

//   id = ''; // mã đơn thuê
//   review: ReviewViewModel = {
//     img: '',
//     bike: '',
//     start: '',
//     end: '',
//     status: '',
//     text: '',
//     time: ''
//   };

//   ngOnInit(): void {
//     this.loadUserFromLocalStorage();
//     this.loadReviewData();
//   }

//   private loadUserFromLocalStorage(): void {
//     if (typeof localStorage === 'undefined') {
//       return;
//     }

//     const raw = localStorage.getItem('eco_profile');
//     if (!raw) {
//       return;
//     }

//     try {
//       const data = JSON.parse(raw) as AccountProfile & { tier?: string };
//       if (data.fullname) {
//         this.user.fullname = data.fullname;
//       }
//       if (data.avatar) {
//         this.user.avatar = data.avatar;
//       }
//     } catch {
//       // bỏ qua
//     }
//   }

//   private loadReviewData(): void {
//     if (typeof localStorage === 'undefined') {
//       return;
//     }

//     const raw = localStorage.getItem('eco_profile');
//     let customerCode: string | undefined;

//     if (raw) {
//       try {
//         const data = JSON.parse(raw) as any;
//         customerCode = data.customerCode;
//       } catch {
//         customerCode = undefined;
//       }
//     }

//     this.route.paramMap.subscribe(params => {
//       const orderId = params.get('id');
//       if (!orderId) {
//         return;
//       }
//       this.id = orderId;

//       if (!customerCode) {
//         return;
//       }

//       const ordersUrl = 'assets/data/orders.json';
//       const reviewsUrl = 'assets/data/product-reviews.json';

//       this.http.get<OrderJson[]>(ordersUrl).subscribe({
//         next: ordersJson => {
//           const order = ordersJson.find(
//             o => o.maDonThue === orderId && o.maKhachHang === customerCode
//           );

//           if (!order || !order.chiTietDonThue || !order.chiTietDonThue.length) {
//             return;
//           }

//           const item = order.chiTietDonThue[0];
//           const vehicleId = item.idXe;

//           this.http.get<ProductReview[]>(reviewsUrl).subscribe({
//             next: reviews => {
//               const r = reviews.find(
//                 rev =>
//                   rev.customerId === customerCode &&
//                   rev.vehicleId === vehicleId
//               );

//               this.review = {
//                 img: this.mapVehicleImage(vehicleId),
//                 bike: this.mapVehicleName(vehicleId),
//                 start: this.formatDate(item.thoiGianNhanXe),
//                 end: this.formatDate(item.thoiGianTraXe),
//                 status: this.mapStatus(order.tinhTrangDon),
//                 text: r?.content || 'Chưa có nội dung đánh giá cho lần thuê này.',
//                 time: r?.reviewDate || ''
//               };
//             },
//             error: () => {
//               this.review = {
//                 img: this.mapVehicleImage(vehicleId),
//                 bike: this.mapVehicleName(vehicleId),
//                 start: this.formatDate(item.thoiGianNhanXe),
//                 end: this.formatDate(item.thoiGianTraXe),
//                 status: this.mapStatus(order.tinhTrangDon),
//                 text: 'Không tải được dữ liệu đánh giá.',
//                 time: ''
//               };
//             }
//           });
//         },
//         error: () => {
//           // lỗi tải orders thì để trống
//         }
//       });
//     });
//   }

//   private formatDate(iso: string | null | undefined): string {
//     if (!iso) {
//       return '';
//     }
//     const d = new Date(iso);
//     if (isNaN(d.getTime())) {
//       return '';
//     }
//     const dd = ('0' + d.getDate()).slice(-2);
//     const mm = ('0' + (d.getMonth() + 1)).slice(-2);
//     const yyyy = d.getFullYear();
//     return `${dd}/${mm}/${yyyy}`;
//   }

//   private mapStatus(tinhTrang: string): string {
//     if (tinhTrang === 'Đã hoàn thành') {
//       return 'Hoàn thành';
//     }
//     return tinhTrang;
//   }

//   private mapVehicleName(idXe: string): string {
//     const map: Record<string, string> = {
//       V001: 'Evo 200 Lite',
//       V002: 'Mẫu xe V002',
//       V003: 'Mẫu xe V003',
//       V005: 'Mẫu xe V005',
//       V006: 'Mẫu xe V006',
//       V008: 'Mẫu xe V008',
//       V009: 'Mẫu xe V009',
//       V011: 'Mẫu xe V011',
//       V013: 'Mẫu xe V013',
//       V015: 'Mẫu xe V015'
//     };
//     return map[idXe] || `Xe mã ${idXe}`;
//   }

//   private mapVehicleImage(idXe: string): string {
//     const map: Record<string, string> = {
//       V001: 'assets/images/products/v001.jpg',
//       V002: 'assets/images/products/v002.jpg',
//       V003: 'assets/images/products/v003.jpg',
//       V005: 'assets/images/products/v005.jpg',
//       V006: 'assets/images/products/v006.jpg',
//       V008: 'assets/images/products/v008.jpg',
//       V009: 'assets/images/products/v009.jpg',
//       V011: 'assets/images/products/v011.jpg',
//       V013: 'assets/images/products/v013.jpg',
//       V015: 'assets/images/products/v015.jpg'
//     };
//     return map[idXe] || 'assets/images/products/placeholder.jpg';
//   }
// }

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductReviewService, ProductReview } from '../../../services/product-review.services';

interface AccountProfile {
  fullname: string;
  avatar?: string;
}

interface ChiTietDonThue {
  idXe: string;
  thoiGianNhanXe: string;
  thoiGianTraXe: string;
}

interface OrderJson {
  maDonThue: string;
  maKhachHang: string;
  thoiGianDatHang: string;
  tinhTrangDon: string;
  chiTietDonThue: ChiTietDonThue[];
}

interface ReviewViewModel {
  img: string;
  bike: string;
  start: string;
  end: string;
  status: string;
  text: string;
  time: string;
  rating: number;
}

@Component({
  selector: 'account-review',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './review.html',
  styleUrls: ['./review.css']
})
export class AccountReview implements OnInit {

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private reviewService = inject(ProductReviewService);

  user: AccountProfile = {
    fullname: 'Khách EcoMOVE',
    avatar: '/assets/images/avatars/default.png'
  };

  id = '';
  review: ReviewViewModel = {
    img: '',
    bike: '',
    start: '',
    end: '',
    status: '',
    text: '',
    time: '',
    rating: 0
  };

  ngOnInit(): void {
    this.loadUserFromLocalStorage();
    this.loadReviewData();
  }

  private loadUserFromLocalStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const raw = localStorage.getItem('eco_profile');
    if (!raw) {
      return;
    }

    try {
      const data = JSON.parse(raw) as any;
      if (data.fullname) this.user.fullname = data.fullname;
      if (data.avatar) this.user.avatar = data.avatar;
    } catch {
    }
  }

  private loadReviewData(): void {
    if (typeof localStorage === 'undefined') return;

    const raw = localStorage.getItem('eco_profile');
    let customerCode: string | undefined;

    if (raw) {
      try {
        const data = JSON.parse(raw) as any;
        customerCode = data.customerCode;
      } catch {
        customerCode = undefined;
      }
    }

    this.route.paramMap.subscribe(params => {
      const orderId = params.get('id');
      if (!orderId || !customerCode) return;
      this.id = orderId;

      const ordersUrl = 'assets/data/orders.json';

      this.http.get<OrderJson[]>(ordersUrl).subscribe({
        next: ordersJson => {
          const order = ordersJson.find(
            o => o.maDonThue === orderId && o.maKhachHang === customerCode
          );
          if (!order || !order.chiTietDonThue.length) return;

          const item = order.chiTietDonThue[0];
          const vehicleId = item.idXe;

          this.reviewService
            .getReviewForCustomerVehicle(customerCode!, vehicleId)
            .subscribe((r: ProductReview | undefined) => {
              this.review = {
                img: this.mapVehicleImage(vehicleId),
                bike: this.mapVehicleName(vehicleId),
                start: this.formatDate(item.thoiGianNhanXe),
                end: this.formatDate(item.thoiGianTraXe),
                status: 'Hoàn thành',
                text: r?.content || 'Chưa có nội dung đánh giá cho lần thuê này.',
                time: r?.reviewDate || '',
                rating: r?.rating || 0
              };
            });
        }
      });
    });
  }

  private formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const dd = ('0' + d.getDate()).slice(-2);
    const mm = ('0' + (d.getMonth() + 1)).slice(-2);
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  private mapVehicleName(idXe: string): string {
    const map: Record<string, string> = {
      V001: 'Evo 200 Lite',
      V002: 'Mẫu xe V002',
      V003: 'Mẫu xe V003',
      V005: 'Mẫu xe V005',
      V006: 'Mẫu xe V006',
      V008: 'Mẫu xe V008',
      V009: 'Mẫu xe V009',
      V011: 'Mẫu xe V011',
      V013: 'Mẫu xe V013',
      V015: 'Mẫu xe V015'
    };
    return map[idXe] || `Xe mã ${idXe}`;
  }

  private mapVehicleImage(idXe: string): string {
    const map: Record<string, string> = {
      V001: 'assets/images/products/v001.jpg',
      V002: 'assets/images/products/v002.jpg',
      V003: 'assets/images/products/v003.jpg',
      V005: 'assets/images/products/v005.jpg',
      V006: 'assets/images/products/v006.jpg',
      V008: 'assets/images/products/v008.jpg',
      V009: 'assets/images/products/v009.jpg',
      V011: 'assets/images/products/v011.jpg',
      V013: 'assets/images/products/v013.jpg',
      V015: 'assets/images/products/v015.jpg'
    };
    return map[idXe] || 'assets/images/products/placeholder.jpg';
  }
}

