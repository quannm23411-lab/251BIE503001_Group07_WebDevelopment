// import { Injectable, inject, makeStateKey, TransferState } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, of } from 'rxjs';
// import { catchError, map, shareReplay } from 'rxjs/operators';

// export interface ProductReview {
//     reviewId: string;
//     vehicleId: string;
//     customerId: string;
//     customerName: string;
//     rating: number;     // 1–5
//     reviewDate: string; // ISO hoặc yyyy-MM-dd
//     title: string;
//     content: string;
//     images?: string[];
//     status: string;

// }

// @Injectable({ providedIn: 'root' })
// export class ProductReviewService {
//     private http = inject(HttpClient);
//     private ts = inject(TransferState);

//     private static readonly STATE_KEY =
//         makeStateKey<ProductReview[]>('PRODUCT_REVIEWS_V1');

//     private readonly all$: Observable<ProductReview[]> = this.loadAll();

//     /** Lấy toàn bộ review của 1 xe */
//     getByVehicleId(vehicleId: string): Observable<ProductReview[]> {
//         const id = (vehicleId ?? '').trim();
//         if (!id) return of([]);
//         return this.all$.pipe(map(list => list.filter(r => r.vehicleId === id)));
//     }

//     /** Thống kê: điểm trung bình + số lượt đánh giá */
//     getStats(vehicleId: string): Observable<{ avg: number; count: number }> {
//         return this.getByVehicleId(vehicleId).pipe(
//             map(list => {
//                 const count = list.length || 0;
//                 if (!count) {
//                     return { avg: 0, count: 0 };
//                 }
//                 const sum = list.reduce((s, r) => s + (r.rating || 0), 0);
//                 const avg = +(sum / count).toFixed(1);
//                 return { avg, count };
//             })
//         );
//     }

//     /** ====== Private ====== */

//     private loadAll(): Observable<ProductReview[]> {
//         // Lấy từ TransferState nếu đã có (SSR)
//         if (this.ts.hasKey(ProductReviewService.STATE_KEY)) {
//             return of(
//                 this.ts.get(ProductReviewService.STATE_KEY, [] as ProductReview[])
//             );
//         }

//         return this.http
//             .get<ProductReview[]>('assets/data/product-reviews.json')
//             .pipe(
//                 // Đảm bảo luôn là array
//                 map(list => (Array.isArray(list) ? list : [])),

//                 // Gắn ảnh nội bộ: assets/products-review/review1..N
//                 map(list =>
//                     list.map((r, index) => ({
//                         ...r,
//                         // sửa lại extension nếu m dùng .png/.webp
//                         images: [`assets/products-review/review${index + 1}.jpg`]
//                     }))
//                 ),

//                 // Cache vào TransferState
//                 map(list => {
//                     try {
//                         this.ts.set(ProductReviewService.STATE_KEY, list);
//                     } catch {
//                         // kệ, không cần làm gì
//                     }
//                     return list;
//                 }),

//                 catchError(() => of([] as ProductReview[])),
//                 shareReplay(1)
//             );
//     }
// }

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface ProductReview {
    reviewId: string;
    vehicleId: string;
    customerId: string;
    customerName: string;
    rating: number;
    reviewDate: string;
    status: string;
    title: string;
    content: string;
    images: string[];
}

@Injectable({
    providedIn: 'root'
})
export class ProductReviewService {
    private http = inject(HttpClient);
    private jsonUrl = 'assets/data/product-reviews.json';
    private localKey = 'eco_user_reviews';

    private getLocalReviews(): ProductReview[] {
        if (typeof localStorage === 'undefined') return [];
        const raw = localStorage.getItem(this.localKey);
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed as ProductReview[];
            }
            return [];
        } catch {
            return [];
        }
    }

    private saveLocalReviews(list: ProductReview[]): void {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(this.localKey, JSON.stringify(list));
    }

    getAllReviews(): Observable<ProductReview[]> {
        return this.http.get<ProductReview[]>(this.jsonUrl).pipe(
            map(serverList => {
                const userList = this.getLocalReviews();
                return [...serverList, ...userList];
            })
        );
    }

    getReviewForCustomerVehicle(
        customerId: string,
        vehicleId: string
    ): Observable<ProductReview | undefined> {
        return this.getAllReviews().pipe(
            map(list => list.find(r => r.customerId === customerId && r.vehicleId === vehicleId))
        );
    }

    // Lấy danh sách review theo mã xe, dùng cho homepage
    getByVehicleId(vehicleId: string): Observable<ProductReview[]> {
        return this.getAllReviews().pipe(
            map(list => list.filter(r => r.vehicleId === vehicleId))
        );
    }


    addUserReview(review: ProductReview): void {
        const current = this.getLocalReviews();
        current.push(review);
        this.saveLocalReviews(current);
    }
}

