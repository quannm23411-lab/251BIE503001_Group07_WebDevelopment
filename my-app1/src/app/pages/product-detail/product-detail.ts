// src/app/pages/product/product-detail/product-detail.ts
import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { ProductLoadingService, ProductVM } from '../../services/product-loading.services';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule,  ],
    templateUrl: './product-detail.html',
    styleUrls: ['./product-detail.css']
})
export class ProductDetail {
    
      rentStart: string = new Date().toISOString().split('T')[0];
  rentEnd: string = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private products = inject(ProductLoadingService);

    // Lấy id từ URL
    id = toSignal(this.route.paramMap.pipe(map(pm => pm.get('id') || '')), { initialValue: '' });

    // Sản phẩm theo id (đúng kiểu ProductVM)
    product = toSignal<ProductVM | undefined>(
        this.route.paramMap.pipe(
            map(pm => pm.get('id') || ''),
            switchMap(id => id ? this.products.getById(id) : of(undefined))
        ),
        { initialValue: undefined }
    );

    // Vì schema chỉ có 1 ảnh (image), gallery đơn giản 1 phần tử
    gallery = computed<string[]>(() => {
        const p = this.product();
        if (!p) return [];
        return [this.products.getImageUrl(p, 'detail')];
    });

    // Thumbnail index vẫn giữ cho dễ mở rộng sau
    activeIndex = signal(0);
    setActive(i: number) { this.activeIndex.set(i); }

    // Gợi ý liên quan: cùng vehicleType, khác id
    allProducts = toSignal(this.products.getAll(), { initialValue: [] as ProductVM[] });

    related = computed<ProductVM[]>(() => {
        const cur = this.product();
        const list = this.allProducts();
        if (!cur || !list.length) return [];
        return list
            .filter(x => x.vehicleType === cur.vehicleType && String(x.id) !== String(cur.id))
            .slice(0, 8);
    });


    // availabilityStatus là boolean -> 2 trạng thái
    statusLabel = computed(() => this.product()?.availabilityStatus ? 'Còn xe' : 'Hết xe');
    statusClass = computed(() => this.product()?.availabilityStatus ? 'ok' : 'bad');

    vnd(n?: number) {
        if (n == null) return '';
        return n.toLocaleString('vi-VN') + '₫';
    }

    goTo(p: ProductVM) { this.router.navigate(['/rent', p.id]); }

    constructor() {
        // Đổi id thì reset thumbnail (cho đồng bộ)
        effect(() => {
            this.id();
            this.activeIndex.set(0);
        });
    }
      showFullDescription = false;

  toggleDescription() {
    this.showFullDescription = !this.showFullDescription;
  }
}
