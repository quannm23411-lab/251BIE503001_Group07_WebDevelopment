import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'account-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile-edit.html',
  styleUrls: ['./profile.css']
})
export class AccountProfileEdit implements OnInit {

  form!: FormGroup;
  tier = 'EcoBasic';

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);

  private pwdVisible = false;

  ngOnInit(): void {
    this.buildForm();
    this.loadProfile();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      fullname: [''],
      email: ['', [Validators.email]],
      password: [''],
      avatar: ['']
    });
  }

  private loadProfile(): void {
    const raw = localStorage.getItem('eco_profile');
    let email = '';

    if (raw) {
      try {
        const profile = JSON.parse(raw);

        email = profile.email || '';
        this.tier = profile.tier || 'EcoBasic';

        this.form.patchValue({
          fullname: profile.fullname || '',
          email: profile.email || '',
          avatar:
            profile.avatar || '/assets/images/avatars/default.png'
        });
      } catch {
        // bỏ qua
      }
    }

    if (!email) {
      return;
    }

    this.http
      .get<{ users: any[] }>('assets/data/users.json')
      .subscribe({
        next: (res) => {
          const match = res.users.find(
            (u) =>
              u.email &&
              u.email.toLowerCase() === email.toLowerCase()
          );
          if (match && match.password) {
            this.form.patchValue({ password: match.password });
          }
        }
      });
  }

  showPwd(): boolean {
    return this.pwdVisible;
  }

  togglePwd(): void {
    this.pwdVisible = !this.pwdVisible;
  }

  onPickAvatar(input: HTMLInputElement): void {
  if (!input.files || input.files.length === 0) {
    return;
  }

  const file = input.files[0];

  const reader = new FileReader();

  reader.onload = () => {
    const url = reader.result as string;

    // cập nhật ngay vào form để template bound hiển thị liền
    this.form.patchValue({ avatar: url });
    this.form.markAsDirty();
  };

  // bắt đầu đọc file trước khi reset value
  reader.readAsDataURL(file);

  // reset để nếu chọn lại cùng một file vẫn bắn change
  input.value = '';
}


  save(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;

    const raw = localStorage.getItem('eco_profile');
    let profile: any = {};
    if (raw) {
      try {
        profile = JSON.parse(raw);
      } catch {
        profile = {};
      }
    }

    profile.fullname =
      value.fullname || profile.fullname || 'Khách EcoMove';
    profile.email = value.email || profile.email || '';
    profile.avatar =
      value.avatar ||
      profile.avatar ||
      '/assets/images/avatars/default.png';
    profile.tier = this.tier || profile.tier || 'EcoBasic';
    profile.password = value.password || profile.password || '';

    localStorage.setItem('eco_profile', JSON.stringify(profile));

    this.router.navigate(['/account/profile']);
  }

  cancel(): void {
    this.router.navigate(['/account/profile']);
  }
}
