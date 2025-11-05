import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Cần import 2 module này cho standalone component
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.html', // (Giữ nguyên .html nếu CLI của bạn tạo ra vậy)
  styleUrls: ['./login.css']    // (Giữ nguyên .css nếu CLI của bạn tạo ra vậy)
})
export class Login implements OnInit { // Tên class có thể là Login

  loginForm!: FormGroup;
  isModalVisible = false;
  passwordFieldType: 'password' | 'text' = 'password';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false] // Giá trị mặc định cho checkbox 'Lưu phiên đăng nhập'
    });
  }

  // Tạo "getter" để truy cập control dễ dàng trong HTML
  get email() { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }

  // Hàm xử lý submit form
  onSubmit(): void {
    // Đánh dấu tất cả là "touched" để hiển thị lỗi
    this.loginForm.markAllAsTouched();

    if (this.loginForm.valid) {
      console.log('Login attempt:', this.loginForm.value);
      
      this.loginForm.reset();
      this.isModalVisible = true; // Mở modal thành công

      // Tự động đóng modal và chuyển trang sau 2 giây
      setTimeout(() => {
        this.closeModalAndNavigate();
      }, 2000);

    } else {
      console.log('Form không hợp lệ');
    }
  }

  // Hàm "Hiện"/"Ẩn" mật khẩu
  togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  // Logic cho Modal
  closeModalAndNavigate(): void {
    this.isModalVisible = false;
    // Giả sử trang chủ của bạn có route là '/' hoặc '/home'
    this.router.navigate(['/']); 
  }

  // Xử lý các nút khác (để sau này bạn nâng cấp)
  handleGoogleLogin(): void {
    console.log('Google login clicked');
    alert('Chức năng Đăng nhập bằng Google');
  }

  handleForgotPassword(): void {
    console.log('Forgot password clicked');
    alert('Chức năng Quên mật khẩu');
  }
}