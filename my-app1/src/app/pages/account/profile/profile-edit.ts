import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

type Tier = 'EcoGold' | 'EcoSilver' | 'EcoBasic';

interface AccountProfile {
  avatar: string;
  fullname: string;
  email: string;
  password: string;
  tier?: Tier;
}

@Component({
  selector: 'profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile-edit.html',
  styleUrls: ['./profile.css']
})
export class ProfileEdit {
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  // dùng chung với login service
  private storageKey = 'eco_profile';

  // chỉ để hiển thị tier, không cho sửa ở form
  tier: Tier = 'EcoBasic';

  form = this.fb.group({
    avatar: [''],
    fullname: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  showPwd = signal(false);

  constructor() {
    const raw = this.readStorage();

    const data: AccountProfile =
      raw || {
        avatar: '/assets/images/avatars/default.png',
        fullname: 'Khách EcoMove',
        email: '',
        password: '',
        tier: 'EcoBasic'
      };

    this.tier = data.tier || 'EcoBasic';

    this.form.patchValue({
      avatar: data.avatar,
      fullname: data.fullname,
      email: data.email,
      password: data.password
    });
  }

  onPickAvatar(input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      this.form.patchValue({ avatar: reader.result as string });
    reader.readAsDataURL(file);
  }

  togglePwd() {
    this.showPwd.update(v => !v);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.getRawValue();

    const profile: AccountProfile = {
      avatar: val.avatar || '/assets/images/avatars/default.png',
      fullname: val.fullname || 'Khách EcoMove',
      email: val.email || '',
      password: val.password || '',
      tier: this.tier // giữ nguyên tier hiện tại
    };

    this.writeStorage(profile);
    this.router.navigateByUrl('/account/profile');
  }

  cancel() {
    this.router.navigateByUrl('/account/profile');
  }

  private readStorage(): AccountProfile | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const raw = localStorage.getItem(this.storageKey);
    try {
      return raw ? (JSON.parse(raw) as AccountProfile) : null;
    } catch {
      return null;
    }
  }

  private writeStorage(val: AccountProfile) {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(this.storageKey, JSON.stringify(val));
  }
}
