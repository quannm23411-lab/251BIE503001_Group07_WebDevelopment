import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
// Đây là một Custom Validator, dùng để kiểm tra "password" và "confirmPassword" có khớp nhau không
// Chúng ta đặt nó bên ngoài class của component
export function passwordMatcher(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  // Nếu 2 trường chưa được nhập, hoặc password vừa nhập xong mà chưa nhập confirm
  // thì không báo lỗi
  if (!password || !confirmPassword) {
    return null;
  }
  
  // Nếu có giá trị và không khớp, trả về lỗi 'passwordMismatch'
  return password === confirmPassword ? null : { passwordMismatch: true };
}


@Component({
  selector: 'app-register',
  standalone: true, // Tệp của bạn chắc chắn là standalone
  imports: [
    CommonModule,          // <-- 2. THÊM VÀO ĐÂY
    ReactiveFormsModule  // <-- VÀ CẢ DÒNG NÀY (CHO FORM)
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register implements OnInit {

  signupForm!: FormGroup;
  isPasswordHintVisible = false;
  isModalVisible = false;

  // Biến để kiểm soát kiểu của input (password hoặc text)
  passwordFieldType: 'password' | 'text' = 'password';
  confirmPasswordFieldType: 'password' | 'text' = 'password';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      // Định nghĩa các trường trong form
      // [giá trị mặc định, [danh sách validators]]
      fullname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        // Đây là regex từ file JS của bạn, dùng Validators.pattern
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      // Thêm custom validator cho cả group để so sánh 2 mật khẩu
      validators: passwordMatcher 
    });
  }

  // Tạo các "getter" tiện lợi để truy cập form control trong HTML
  get fullname() { return this.signupForm.get('fullname')!; }
  get email() { return this.signupForm.get('email')!; }
  get password() { return this.signupForm.get('password')!; }
  get confirmPassword() { return this.signupForm.get('confirmPassword')!; }

  // Hàm này được gọi khi form được submit
  onSubmit(): void {
    // Đánh dấu tất cả các trường là "touched" để hiển thị lỗi (nếu có)
    this.signupForm.markAllAsTouched();

    if (this.signupForm.valid) {
      console.log('Form data:', this.signupForm.value);
      // Xử lý đăng ký thành công
      this.isModalVisible = true;
      this.signupForm.reset();

      // Tự động đóng modal và chuyển trang sau 5s
      setTimeout(() => {
        this.closeModal();
      }, 5000);

    } else {
      console.log('Form không hợp lệ');
    }
  }

  // Hàm xử lý việc "Hiện"/"Ẩn" mật khẩu
  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    } else {
      this.confirmPasswordFieldType = this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
    }
  }

  // Xử lý định dạng tên khi người dùng rời khỏi ô input
  onFullnameBlur(): void {
    const nameControl = this.fullname;
    if (nameControl.value) {
      const formattedName = nameControl.value.trim()
        .toLowerCase()
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Dùng patchValue để cập nhật giá trị trong form
      this.signupForm.patchValue({ fullname: formattedName });
    }
  }
  
  // Logic cho Modal
  closeModal(): void {
    this.isModalVisible = false;
    // Chuyển về trang chủ
    this.router.navigate(['/']); // Giả sử trang chủ của bạn có route là '/'
  }
}