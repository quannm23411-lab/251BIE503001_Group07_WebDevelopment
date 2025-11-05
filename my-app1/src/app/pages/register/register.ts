import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register implements OnInit {
  signupForm!: FormGroup;
  isPasswordHintVisible = false;
  isModalVisible = false;
  passwordFieldType: 'password' | 'text' = 'password';
  confirmPasswordFieldType: 'password' | 'text' = 'password';

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
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
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
      const newUser = this.signupForm.value;

      // 🔹 Lưu tạm vào localStorage (giả lập tạo tài khoản)
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      existingUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));

      this.isModalVisible = true;
      this.signupForm.reset();

      // ✅ Tự động đóng modal và chuyển về trang đăng nhập
      setTimeout(() => {
        this.router.navigate(['/login']);
        this.isModalVisible = false;
      }, 3000);
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

  closeModal(): void {
    this.isModalVisible = false;
    this.router.navigate(['/login']);
  }
}
