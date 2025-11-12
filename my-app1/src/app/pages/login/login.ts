import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
// =============================================
// THÊM MỚI: Import RouterLink
// =============================================
import { Router, RouterLink } from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import { Auth, AuthUser } from '../../services/auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  // =============================================
  // THÊM MỚI: Thêm RouterLink vào mảng imports
  // =============================================
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink // <-- Thêm vào đây
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  isModalVisible = false;
  passwordFieldType: 'password' | 'text' = 'password';
  error = signal<string | null>(null);
  isLoading = signal(false);

  // Signal cho modal thông báo tính năng
  isFeatureModalVisible = signal(false);
  featureModalTitle = signal('');
  featureModalBody = signal('');

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private loginService = inject(LoginService);
  private auth = inject(Auth);

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
    this.error.set(null); 
    this.loginForm.markAllAsTouched();
    
    if (!this.loginForm.valid) {
      return;
    }

    this.isLoading.set(true); 
    const { email, password } = this.loginForm.value;

    this.loginService.login(email, password).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        
        const authUser: AuthUser = {
          id: user.id,
          email: user.email,
          fullname: user.fullname,
          role: user.role
        };
        this.auth.login(authUser);

        this.isModalVisible = true;
      },
      error: (err) => {
        this.isLoading.set(false); 
        this.error.set(err.message || 'Email hoặc mật khẩu không chính xác');
      }
    });
  }

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  handleGoogleLogin() { 
    this.featureModalTitle.set('Tính năng đang phát triển');
    this.featureModalBody.set('Chức năng Đăng nhập bằng Google hiện chưa có sẵn. Vui lòng quay lại sau.');
    this.isFeatureModalVisible.set(true);
  }
  
  handleForgotPassword() { 
    this.featureModalTitle.set('Tính năng đang phát triển');
    this.featureModalBody.set('Chức năng Quên mật khẩu hiện chưa có sẵn. Vui lòng quay lại sau.');
    this.isFeatureModalVisible.set(true);
  }
  
  closeFeatureModal() {
    this.isFeatureModalVisible.set(false);
  }

  closeModalAndNavigate() {
    this.isModalVisible = false;
    // Cập nhật: dùng .currentUser() (vì bạn đã đổi tên hàm trong register.ts)
    const user = this.auth.getCurrentUser(); 
    if (user?.role === 'admin') this.router.navigate(['/admin']);
    else this.router.navigate(['/']);
  }
}