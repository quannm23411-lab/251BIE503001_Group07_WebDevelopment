import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-guideline',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './guideline.html',
    styleUrl: './guideline.css'   // dùng file riêng
})
export class Guideline { }
