import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // ◀️ Import RouterLink
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // ◀️ Import Form

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, // ◀️ Thêm vào imports
    ReactiveFormsModule // ◀️ Thêm vào imports
  ],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.css'
})
export class ContactPage implements OnInit {
  
  contactForm!: FormGroup;
  formStatus = signal<'idle' | 'success' | 'error'>('idle');
  formMessage = signal('');

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.contactForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      subject: [''],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  // Getters để dễ dàng truy cập control trong HTML
  get f() {
    return this.contactForm.controls;
  }

  onSubmit() {
    this.contactForm.markAllAsTouched();
    if (this.contactForm.invalid) {
      this.formStatus.set('error');
      this.formMessage.set('Vui lòng kiểm tra lại các trường thông tin.');
      return;
    }

    // Giả lập gửi API thành công
    console.log('Gửi form:', this.contactForm.value);
    this.formStatus.set('success');
    this.formMessage.set('Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn.');
    this.contactForm.reset();

    // Tự động xóa thông báo sau 5 giây
    setTimeout(() => {
      this.formStatus.set('idle');
      this.formMessage.set('');
    }, 5000);
  }
}