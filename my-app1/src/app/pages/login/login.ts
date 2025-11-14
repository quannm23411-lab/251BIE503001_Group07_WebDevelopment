import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
// =============================================
// Import Router, RouterLink, ActivatedRoute
// =============================================
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import { Auth, AuthUser } from '../../services/auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
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

  // NEW: giữ returnUrl & selectedIds (từ Cart → Login)
  returnUrl = '/';
  private selectedIdsFromCart: string[] = [];

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private loginService = inject(LoginService);
  private auth = inject(Auth);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false]
    });

    // Lấy selectedIds từ state khi điều hướng từ Cart
    const nav = this.router.getCurrentNavigation();
    const state = (nav?.extras.state as any) ?? history.state;
    this.selectedIdsFromCart = state?.selectedIds ?? [];

    // Đọc ?returnUrl=/checkout trong query string
    this.route.queryParamMap.subscribe(params => {
      this.returnUrl = params.get('returnUrl') || '/';
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
      next: () => {
        this.isLoading.set(false);
        // LoginService đã set authUser + eco_profile rồi
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
    const user = this.auth.getCurrentUser();

    // Nếu có returnUrl (ví dụ /checkout) → ưu tiên quay về đó
    if (this.returnUrl && this.returnUrl !== '/') {
      this.router.navigateByUrl(this.returnUrl, {
        state: this.selectedIdsFromCart.length
          ? { selectedIds: this.selectedIdsFromCart }
          : undefined
      });
      return;
    }

    // Không có returnUrl → giữ logic cũ (admin / customer)
    if (user?.role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
