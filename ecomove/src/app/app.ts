import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminBikeDetail } from './admin-bike-detail/admin-bike-detail';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AdminBikeDetail],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ecomove');
}
