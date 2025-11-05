import { Component } from '@angular/core';
// 1. IMPORT HAI DÒNG NÀY TỪ @angular/router
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,       // <-- 2. THÊM VÀO ĐÂY
    RouterLinkActive  // <-- 2. VÀ THÊM VÀO ĐÂY
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  // ...
}