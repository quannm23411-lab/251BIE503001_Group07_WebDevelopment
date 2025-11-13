import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

type Tier = 'EcoGold' | 'EcoSilver' | 'EcoBasic';

interface AccountProfile {
  fullname: string;
  avatar: string;
  tier?: Tier;
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
    avatar: 'assets/images/default-avatar.png',
    tier: 'EcoBasic'
  };

  constructor(private router: Router) {
    if (typeof localStorage === 'undefined') return;

    const raw = localStorage.getItem('eco_profile');
    if (!raw) return;

    try {
      const data = JSON.parse(raw) as any;
      this.user.fullname = data.fullname || this.user.fullname;
      this.user.avatar = data.avatar || this.user.avatar;
      this.user.tier = data.tier || this.user.tier;
    } catch {
      // nếu lỗi thì giữ mặc định
    }
  }

  orders = [
    {
      id: '2738HF760654F',
      name: 'Xe máy điện Feliz 2025',
      img: '../../assets/images/products/vinfast-felizs.jpg',
      start: '01/11/2025',
      end: '03/11/2025',
      status: 'Đang thuê',
      hasReviewed: false
    },
    {
      id: '2738HF7F66484F',
      name: 'DK Bike X5',
      img: '../../assets/images/products/dkbike-x5.jpg',
      start: '21/10/2025',
      end: '28/10/2025',
      status: 'Hoàn thành',
      hasReviewed: false
    },
    {
      id: '2738HF7F66484P',
      name: 'Yadea Ulike',
      img: 'assets/images/products/yadea-ulike.jpg',
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
