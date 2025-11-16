import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Profile, ProfileService } from '../../../services/profile.services'; 

// --- Validator tùy chỉnh để kiểm tra mật khẩu mới khớp nhau ---
export function matchPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (!newPassword && !confirmPassword) {
    return null;
  }
  return newPassword === confirmPassword ? null : { mismatch: true };
}

@Component({
  selector: 'account-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile-edit.html',
  styleUrls: ['./profile.css']
})
export class AccountProfileEdit implements OnInit {

  // --- FORM CHÍNH (THÔNG TIN) ---
  infoForm!: FormGroup;
  isLoading = signal(true);

  // --- FORM PHỤ (MẬT KHẨU) ---
  passwordForm!: FormGroup;
  private currentPassword = '';
  showOldPwd = signal(false);
  showNewPwd = signal(false);
  
  // --- TÍN HIỆU POP-UP ---
  showConfirmationPopup = signal(false); // Pop-up lưu thông tin
  showSuccessToast = signal('');
  showErrorToast = signal(''); 

  // ===============================================
  // ⭐ THÊM MỚI: Signal cho pop-up xác nhận MẬT KHẨU
  // ===============================================
  showPasswordConfirmPopup = signal(false);
  // ===============================================


  private fb = inject(FormBuilder);
  private router = inject(Router);
  private profileService = inject(ProfileService); 

  ngOnInit(): void {
    this.buildInfoForm(); 
    this.buildPasswordForm();
    this.loadProfile(); 
  }

  // (buildInfoForm và buildPasswordForm giữ nguyên)
  private buildInfoForm(): void {
    this.infoForm = this.fb.group({
      customerCode: [''],
      fullname: ['', [Validators.required]], 
      email: ['', [Validators.required, Validators.email]], 
      avatar: [''],
      tier: [''], 
      phone: [''],
      dob: [''],
      address: this.fb.group({
        soNhaDuong: [''],
        phuongXa: [''],
        quanHuyen: [''],
        tinhThanh: ['']
      }),
      driverLicense: this.fb.group({
        soBangLai: [''],
        hangBangLai: [''],
        ngayHetHan: ['']
      })
    });
  }
  private buildPasswordForm(): void {
    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8), // <-- Sửa: Giống register.ts
        // Thêm: Giống register.ts
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#])[A-Za-z\d@$!%*?&#]{8,}$/) 
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: matchPasswordValidator 
    });
  }
  
  // (loadProfile giữ nguyên)
  private loadProfile(): void {
    this.isLoading.set(true);
    this.profileService.loadProfile().subscribe(data => {
      this.infoForm.patchValue(data); 
      this.currentPassword = data.password || ''; 
      this.isLoading.set(false);
    });
  }

  // --- CÁC HÀM XỬ LÝ LƯU ---

  // 1. GỌI KHI LƯU THÔNG TIN CÁ NHÂN
  onSubmitInfo(): void {
    if (!this.infoForm.valid) {
      this.infoForm.markAllAsTouched();
      return;
    }
    this.showConfirmationPopup.set(true);
  }

  // ===============================================
  // ⭐ SỬA 2: GỌI KHI ĐỔI MẬT KHẨU
  // ===============================================
  onSubmitPassword(): void {
    this.showErrorToast.set('');
    if (!this.passwordForm.valid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const passValue = this.passwordForm.value;

    // Kiểm tra mật khẩu cũ
    if (passValue.oldPassword !== this.currentPassword) {
      this.passwordForm.get('oldPassword')?.setErrors({ incorrect: true });
      this.showErrorToast.set('Mật khẩu cũ không chính xác!');
      this.triggerToastShake();
      return;
    }
    
    // ⭐ THAY ĐỔI: Hiển thị pop-up xác nhận thay vì lưu ngay
    this.showPasswordConfirmPopup.set(true);
  }
  // ===============================================

  // ===============================================
  // ⭐ THÊM MỚI: Các hàm xử lý pop-up MẬT KHẨU
  // ===============================================
  
  // Gọi khi bấm "Đồng ý" trên pop-up MẬT KHẨU
  confirmSavePassword(): void {
    this.showPasswordConfirmPopup.set(false);
    const passValue = this.passwordForm.value;

    this.profileService.loadProfile().subscribe(profile => {
      profile.password = passValue.newPassword; 
      this.profileService.saveProfile(profile); 
      
      this.currentPassword = passValue.newPassword;
      this.passwordForm.reset(); // Xóa rỗng các trường

      this.showSuccessToast.set('Đổi mật khẩu thành công!');
      setTimeout(() => this.showSuccessToast.set(''), 3000);
    });
  }

  // Gọi khi bấm "Hủy" trên pop-up MẬT KHẨU
  cancelSavePassword(): void {
    this.showPasswordConfirmPopup.set(false);
  }
  // ===============================================


  // --- Logic Pop-up (Cho LƯU THÔNG TIN - Giữ nguyên) ---
  confirmSaveInfo(): void {
    this.showConfirmationPopup.set(false);
    const updatedProfile = this.infoForm.getRawValue() as Profile;
    
    this.profileService.loadProfile().subscribe(profile => {
      updatedProfile.password = profile.password; 
      this.profileService.saveProfile(updatedProfile);

      this.showSuccessToast.set('Cập nhật thông tin thành công!');

      setTimeout(() => {
        this.showSuccessToast.set('');
        this.router.navigate(['/account/profile']);
      }, 3000);
    });
  }
  cancelSave(): void {
    this.showConfirmationPopup.set(false);
  }
  cancelEdit(): void {
    this.router.navigate(['/account/profile']);
  }
  // ------------------------------------------------

  // (Các hàm tiện ích khác giữ nguyên)
onPickAvatar(input: HTMLInputElement): void { /* ... */ }
  triggerToastShake(): void {
    const toast = document.querySelector('.error-toast');
    if (toast) {
      toast.classList.add('shake');
      setTimeout(() => toast.classList.remove('shake'), 500);
    }
  }
  get f_info() { return this.infoForm.controls; }
  get f_pass() { return this.passwordForm.controls; }
  
  // Tách riêng 2 hàm toggle cho 2 form
  toggleOldPwd(): void { this.showOldPwd.set(!this.showOldPwd()); }
  toggleNewPwd(): void { this.showNewPwd.set(!this.showNewPwd()); }
}