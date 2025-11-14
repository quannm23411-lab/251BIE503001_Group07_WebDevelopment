import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, catchError, throwError } from 'rxjs';
import { Auth, AuthUser } from '../auth/auth'; // đường dẫn tùy cấu trúc của mày

interface User extends AuthUser { password: string; }

@Injectable({ providedIn: 'root' })
export class LoginService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private auth = inject(Auth);

    private url = 'assets/data/users.json';

    login(email: string, password: string) {
        return this.http.get<{ users: User[] }>(this.url).pipe(
            map(res => {
                const found = res.users.find(u => u.email === email && u.password === password);
                if (!found) throw new Error('Sai email hoặc mật khẩu');
                const { password: _omit, ...safe } = found;
                this.auth.login(safe);             // <— ghi về đúng key 'authUser'
                return safe as AuthUser;
            }),
            catchError(err => throwError(() => err))
        );
    }

    logout() {
        this.auth.logout();
        this.router.navigate(['/login']);
    }

    // Các helper này nên trỏ về Auth cho thống nhất
    getUser() { return this.auth.getCurrentUser(); }
    isLoggedIn() { return this.auth.isLoggedIn(); }
    isAdmin() { return this.auth.isAdmin(); }
}
