import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // ⬅️ THÊM DÒNG NÀY
@Component({
  selector: 'app-policy',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './policy.html',
  styleUrl: './policy.css'
})
export class Policy {

}