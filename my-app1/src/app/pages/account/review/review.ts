import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface AccountProfile {
  fullname: string;
  avatar?: string;
}

@Component({
  selector: 'account-review',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './review.html',
  styleUrls: ['./review.css']
})
export class AccountReview {
  private route = inject(ActivatedRoute);

  user: AccountProfile = { fullname: 'Khách EcoMove' };

  id = this.route.snapshot.paramMap.get('id') || '2738HF766654D';
  review = {
    bike: 'Xe đạp gấp gọn ABC',
    start: '21/10/2025',
    end: '28/10/2025',
    status: 'Hoàn thành',
    img: '/assets/images/bikes/s3.jpg',
    text: 'CSKH tư vấn nhiệt tình. Xe mới, giống ảnh mẫu, mình sử dụng dễ dàng dù trước đây chưa từng đi loại xe này. Sẽ quay lại thuê khi có nhu cầu!',
    stars: 5,
    time: '01-10-2025 15:41'
  };

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('eco_profile');
      if (raw) {
        try {
          const data = JSON.parse(raw) as AccountProfile;
          this.user.fullname = data.fullname || this.user.fullname;
          this.user.avatar = (data as any).avatar;
        } catch {
          // bỏ qua
        }
      }
    }
  }
}
