import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'account-profile-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile-view.html',
  styleUrls: ['./profile.css']
})
export class AccountProfileView implements OnInit {

  user: any = {
    fullname: 'Khách EcoMove',
    email: '',
    avatar: '/assets/images/avatars/default.png',
    tier: 'EcoBasic'
  };

  userPassword = '';
  showPwd = false;

  private http = inject(HttpClient);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    const raw = localStorage.getItem('eco_profile');
    let email = '';

    if (raw) {
      try {
        const profile = JSON.parse(raw);

        this.user.fullname = profile.fullname || 'Khách EcoMove';
        this.user.email = profile.email || '';
        this.user.avatar =
          profile.avatar || '/assets/images/avatars/default.png';
        this.user.tier = profile.tier || 'EcoBasic';

        if (profile.password) {
          this.userPassword = profile.password;
        }

        email = this.user.email;
      } catch {
        // giữ default
      }
    }

    if (!this.userPassword && email) {
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
              this.userPassword = match.password;
            } else {
              this.userPassword = '';
            }
          },
          error: () => {
            this.userPassword = '';
          }
        });
    }
  }

  togglePwd(): void {
    this.showPwd = !this.showPwd;
  }

  edit(): void {
    this.router.navigate(['/account/profile/edit']);
  }
}
