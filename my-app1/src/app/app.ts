import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Contact } from '../app/pages/contact/contact';

// import { Header } from './components/header/header';
// import { Footer } from './components/footer/footer';
@Component({
  selector: 'app-root',
  standalone: true, // Thêm dòng này nếu chưa có
  imports: [
    RouterOutlet,
    Contact
    // Header,
    // Footer // Chỉ cần duy nhất dòng này
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

}