import { Component, OnInit, signal } from '@angular/core'; // <-- Đã thêm signal
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // <-- Đã thêm RouterLink
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

/**
 * Custom Validator: Kiểm tra "password" và "confirmPassword" có khớp nhau không
 */
export function passwordMatcher(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (!password || !confirmPassword) return null;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink // <-- Đã thêm vào đây
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register implements OnInit {
  signupForm!: FormGroup;
  isPasswordHintVisible = false;
  isModalVisible = false;
  passwordFieldType: 'password' | 'text' = 'password';
  confirmPasswordFieldType: 'password' | 'text' = 'password';

  // =============================================
  // THÊM MỚI: Tín hiệu cho loading và modal tính năng
  // =============================================
  isLoading = signal(false);
  isFeatureModalVisible = signal(false);
  featureModalTitle = signal('');
  featureModalBody = signal('');
  // =============================================

  constructor(private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group(
      {
        fullname: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#])[A-Za-z\d@$!%*?&#]{8,}$/)
          ]
        ],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: passwordMatcher }
    );
  }

  // Getters cho form control
  get fullname() { return this.signupForm.get('fullname')!; }
  get email() { return this.signupForm.get('email')!; }
  get password() { return this.signupForm.get('password')!; }
  get confirmPassword() { return this.signupForm.get('confirmPassword')!; }

  /**
   * Xử lý submit form
   */
  onSubmit(): void {
    this.signupForm.markAllAsTouched();

    if (this.signupForm.valid) {
      this.isLoading.set(true); // <-- BẬT LOADING

      // 🔹 Giả lập gọi API mất 1 giây
      setTimeout(() => {
        const newUser = this.signupForm.value;
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        existingUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(existingUsers));

        this.isLoading.set(false); // <-- TẮT LOADING
        this.isModalVisible = true; // <-- HIỆN MODAL THÀNH CÔNG
        this.signupForm.reset();
      }, 1000); // 1 giây chờ

      // Đã xóa bỏ setTimeout tự động chuyển trang
    } else {
      console.log('Form không hợp lệ');
    }
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    } else {
      this.confirmPasswordFieldType =
        this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
    }
  }

  onFullnameBlur(): void {
    const nameControl = this.fullname;
    if (nameControl.value) {
      const formattedName = nameControl.value
        .trim()
        .toLowerCase()
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      this.signupForm.patchValue({ fullname: formattedName });
    }
  }

  /**
   * Đóng modal thành công và chuyển trang
   */
  closeModal(): void {
    this.isModalVisible = false;
    this.router.navigate(['/login']);
  }
  
  // =============================================
  // THÊM MỚI: Các hàm xử lý modal tính năng
  // =============================================
  handleGoogleLogin() { 
    this.featureModalTitle.set('Tính năng đang phát triển');
    this.featureModalBody.set('Chức năng Đăng ký bằng Google hiện chưa có sẵn. Vui lòng quay lại sau.');
    this.isFeatureModalVisible.set(true);
  }

  closeFeatureModal() {
    this.isFeatureModalVisible.set(false);
  }
}