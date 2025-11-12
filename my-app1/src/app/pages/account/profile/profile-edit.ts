import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface AccountProfile {
  avatar: string;
  fullname: string;
  email: string;
  password: string;
  tier?: 'EcoGold' | 'EcoSilver' | 'EcoBasic';
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

  private storageKey = 'eco_profile_mock';
  private initData: AccountProfile = {
    avatar: '/assets/images/avatars/default.png',
    fullname: 'Hồng Phúc',
    email: 'phucvh.work@gmail.com',
    password: '12345678',
    tier: 'EcoGold'
  };

  form = this.fb.group({
    avatar: [''],
    fullname: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  showPwd = signal(false);

  constructor() {
    const raw = this.readStorage();
    const data = raw || this.initData;
    this.form.patchValue(data);
  }

  onPickAvatar(input: HTMLInputElement){
    const file = input.files?.[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = () => this.form.patchValue({ avatar: reader.result as string });
    reader.readAsDataURL(file);
  }

  togglePwd(){ this.showPwd.update(v => !v); }

  save(){
    if(this.form.invalid){ this.form.markAllAsTouched(); return; }
    this.writeStorage(this.form.getRawValue());
    this.router.navigateByUrl('/account/profile');
  }

  cancel(){ this.router.navigateByUrl('/account/profile'); }

  private readStorage(): AccountProfile | null {
    if(!isPlatformBrowser(this.platformId)) return null;
    const raw = localStorage.getItem(this.storageKey);
    try { return raw ? JSON.parse(raw) as AccountProfile : null; } catch { return null; }
  }
  private writeStorage(val: any){
    if(!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(this.storageKey, JSON.stringify(val));
  }
}
