import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import { Auth, AuthUser } from '../../services/auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  isModalVisible = false;
  passwordFieldType: 'password' | 'text' = 'password';
  error = signal<string | null>(null);

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private loginService = inject(LoginService);
  private auth = inject(Auth); // <- dùng Auth mới

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false]
    });
  }

  get email() { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }

  onSubmit(): void {
    this.loginForm.markAllAsTouched();
    if (!this.loginForm.valid) {
      this.error.set('Vui lòng nhập đầy đủ thông tin hợp lệ.');
      return;
    }

    const { email, password } = this.loginForm.value;

    this.loginService.login(email, password).subscribe({
      next: (user) => {
        // Lưu đủ thông tin cho phân quyền admin
        const authUser: AuthUser = {
          id: user.id,
          email: user.email,
          fullname: user.fullname,
          role: user.role
        };
        this.auth.login(authUser);

        this.isModalVisible = true;
        setTimeout(() => {
          this.isModalVisible = false;
          if (user.role === 'admin') this.router.navigate(['/admin']);
          else this.router.navigate(['/']);
        }, 1500);
      },
      error: (err) => this.error.set(err.message || 'Đăng nhập thất bại')
    });
  }

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  handleGoogleLogin() { alert('Đăng nhập Google đang phát triển'); }
  handleForgotPassword() { alert('Chức năng Quên mật khẩu đang phát triển'); }
  closeModalAndNavigate() {
    this.isModalVisible = false;
    this.router.navigate(['/']);
  }
}
