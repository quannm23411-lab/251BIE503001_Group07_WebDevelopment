import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';  // Import FormsModule
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [FormsModule, NgIf],  
  templateUrl: './popup.html',
  styleUrls: ['./popup.css']
})
export class Popup {
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();  

  email: string = '';  
  isSuccess: boolean = false;  

  close() {
    this.closed.emit();  
  }

  submitEmail(emailModel: any) {
    if (emailModel.invalid) {
      emailModel.control.markAsTouched();  
      return;
    }

    console.log('Email đăng ký:', this.email);

    this.isSuccess = true;

    setTimeout(() => {
      this.close();  
    }, 2000); 
  }
}
