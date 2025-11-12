import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'account-review',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './review.html',
  styleUrls: ['./review.css']
})
export class AccountReview {
  private route = inject(ActivatedRoute);
  user = { fullname: 'Hồng Phúc' };

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
}
