import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Profile, ProfileService } from '../../../services/profile.services'; 
import { FormsModule } from '@angular/forms'; // <-- 1. THÊM IMPORTS

@Component({
  selector: 'account-profile-view',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // <-- 2. THÊM MODULE
  templateUrl: './profile-view.html',
  styleUrls: ['./profile.css']
})
export class AccountProfileView implements OnInit {

  user: Profile = {} as Profile;
  isLoading = signal(true);
  
  // = = = = = = = = = = = = = = = = = = = = = = = = =
  // ⭐ 3. THÊM CÁC BIẾN CHO POP-UP XÁC NHẬN
  // = = = = = = = = = = = = = = = = = = = = = = = = =
  private currentPassword = ''; // Lưu mật khẩu đúng
  public confirmPasswordInput = ''; // Bound với input
  public showPasswordConfirm = signal(false);
  public passwordConfirmError = signal('');
  // = = = = = = = = = = = = = = = = = = = = = = = = =

  private profileService = inject(ProfileService); 
  private router = inject(Router);

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.isLoading.set(true); 
    
    this.profileService.loadProfile().subscribe({
      next: (data) => {
        this.user = data;
        // = = = = = = = = = = = = = = = = = = = = = = = = =
        // ⭐ 4. LƯU LẠI MẬT KHẨU ĐÚNG
        // = = = = = = = = = = = = = = = = = = = = = = = = =
        this.currentPassword = data.password || ''; 
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Lỗi khi tải profile:', err);
        this.isLoading.set(false); 
      }
    });
  }

  // = = = = = = = = = = = = = = = = = = = = = = = = =
  // ⭐ 5. CÁC HÀM MỚI ĐỂ XỬ LÝ POP-UP
  // = = = = = = = = = = = = = = = = = = = = = = = = =
  
  /**
   * Gọi khi bấm nút "CHỈNH SỬA"
   * Mở pop-up và reset
   */
  openEditPopup(): void {
    this.passwordConfirmError.set('');
    this.confirmPasswordInput = '';
    this.showPasswordConfirm.set(true);
  }

  /**
   * Gọi khi bấm "Hủy" trên pop-up
   */
  cancelEditPopup(): void {
    this.showPasswordConfirm.set(false);
  }

  /**
   * Gọi khi bấm "Xác nhận" trên pop-up
   */
  confirmPasswordAndEdit(): void {
    if (this.confirmPasswordInput === this.currentPassword) {
      // ĐÚNG MẬT KHẨU
      this.showPasswordConfirm.set(false);
      this.router.navigate(['/account/profile/edit']);
    } else {
      // SAI MẬT KHẨU
      this.passwordConfirmError.set('Mật khẩu không chính xác.');
    }
  }
}