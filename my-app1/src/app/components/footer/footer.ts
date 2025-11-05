import { Component } from '@angular/core';
// 1. IMPORT DÒNG NÀY
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    RouterLink // <-- 2. THÊM VÀO ĐÂY (Footer thường chỉ cần RouterLink)
  ],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class Footer {
  // ...
}