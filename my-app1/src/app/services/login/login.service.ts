import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, catchError, throwError } from 'rxjs';

interface User {
    id: number;
    email: string;
    password: string;
    fullname: string;
    role: 'admin' | 'customer';
}

@Injectable({ providedIn: 'root' })
export class LoginService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private url = 'assets/data/users.json';
    private currentUser: User | null = null;

    login(email: string, password: string) {
        return this.http.get<{ users: User[] }>(this.url).pipe(
            map(res => {
                const found = res.users.find(u => u.email === email && u.password === password);
                if (found) {
                    this.currentUser = found;
                    localStorage.setItem('user', JSON.stringify(found));
                    return found;
                } else throw new Error('Sai email hoặc mật khẩu');
            }),
            catchError(err => throwError(() => err))
        );
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
    }

    getUser(): User | null {
        if (!this.currentUser) {
            const saved = localStorage.getItem('user');
            if (saved) this.currentUser = JSON.parse(saved);
        }
        return this.currentUser;
    }

    isLoggedIn() { return !!this.getUser(); }
    isAdmin() { return this.getUser()?.role === 'admin'; }
}
