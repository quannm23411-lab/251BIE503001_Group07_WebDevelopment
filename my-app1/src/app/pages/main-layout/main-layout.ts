import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // <-- IMPORT
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet, // <-- THÊM
    Header,       // <-- THÊM
    Footer        // <-- THÊM
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
export class MainLayout { // Tên class của bạn có thể khác

}