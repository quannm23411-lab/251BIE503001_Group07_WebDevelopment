import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'account-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css']
})
export class AccountOrders {
  user = { fullname: 'Hồng Phúc' };

  orders = [
    { id: '2738HF766654F', name: 'Xe máy điện Feliz 2025', start: '01/11/2025', end: '03/11/2025', status: 'Đang thuê', img: '/assets/images/bikes/s1.jpg' },
    { id: '2738HF766654E', name: 'Xe đạp điện ABC', start: '21/10/2025', end: '28/10/2025', status: 'Hoàn thành', img: '/assets/images/bikes/s2.jpg' },
    { id: '2738HF766654D', name: 'Xe đạp gấp gọn ABC', start: '21/10/2025', end: '28/10/2025', status: 'Hoàn thành', img: '/assets/images/bikes/s3.jpg' }
  ];
}
