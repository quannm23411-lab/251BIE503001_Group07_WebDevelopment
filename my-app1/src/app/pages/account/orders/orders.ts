import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

interface AccountProfile {
  avatar: string;
  fullname: string;
  email?: string;
  tier?: 'EcoGold' | 'EcoSilver' | 'EcoBasic';
}

@Component({
  selector: 'account-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css']
})
export class AccountOrders {
  user: AccountProfile = {
    fullname: 'Khách EcoMove',
    avatar: 'assets/images/default-avatar.png'
  };

  constructor(private router: Router) {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('eco_profile');
      if (raw) {
        try {
          const data = JSON.parse(raw) as AccountProfile;
          this.user.fullname = data.fullname || this.user.fullname;
          this.user.avatar = data.avatar || this.user.avatar;
        } catch {
          // dùng mặc định
        }
      }
    }
  }

  orders = [
    {
      id: '2738HF760654F',
      name: 'Xe máy điện Feliz 2025',
      img: 'assets/images/orders/feliz.png',
      start: '01/11/2025',
      end: '03/11/2025',
      status: 'Đang thuê',
      hasReviewed: false
    },
    {
      id: '2738HF7F66484F',
      name: 'Xe đạp điện ABC',
      img: 'assets/images/orders/ebike.png',
      start: '21/10/2025',
      end: '28/10/2025',
      status: 'Hoàn thành',
      hasReviewed: false
    },
    {
      id: '2738HF7F66484P',
      name: 'Xe đạp gấp gọn ABC',
      img: 'assets/images/orders/folding.png',
      start: '21/10/2025',
      end: '28/10/2025',
      status: 'Hoàn thành',
      hasReviewed: true
    }
  ];

  rentAgain(order: any): void {
    this.router.navigate(['/thanh-toan', order.id]);
  }
}
