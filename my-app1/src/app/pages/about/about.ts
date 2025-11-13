import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ABOUT_US_DATA, AboutUsDataModel } from '../../../assets/data/about.data';

@Component({
  standalone: true,
  selector: 'app-about-us',
  templateUrl: './about.html',
  styleUrls: ['./about.css'],
  imports: [CommonModule]      
})
export class About {
  data: AboutUsDataModel = ABOUT_US_DATA;
}
