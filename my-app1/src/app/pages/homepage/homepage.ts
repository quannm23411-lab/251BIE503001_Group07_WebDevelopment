import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgIf, NgFor, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, interval, Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TrendingService } from '../../services/trending.services';

// ===== Model =====
interface Product {
  id: string;
  vehicleName: string;
  pricePerHour?: number;
  pricePerDay: number;
  image: string;
  discount: number;
  availabilityStatus: boolean;
  vehicleType: string;
  tags?: string[];
  rating?: number;
}

interface HomepageConfig {
  hero: string[];
  sections: {
    motorbike: { title: string; subtitle: string; items: string[]; limit: number; };
    ebike: { title: string; subtitle: string; items: string[]; limit: number; };
    compact: { title: string; subtitle: string; items: string[]; limit: number; };
  };
  promo: { code: string; discountAmount: string; endDate: string; active: boolean; };
  fallbackRules: {
    motorbikeTypes: string[];
    ebikeTypes: string[];
    compactTags: string[];
  };
}

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, NgClass],
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.css']
})
export class Homepage implements OnInit, OnDestroy {

  // ===== Data =====
  topRentList: Product[] = [];
  motorbikeList: Product[] = [];
  ecoBikeList: Product[] = [];
  compactBikeList: Product[] = [];

  // Section titles
  sectionText = {
    motorbike: { title: 'Xe máy điện', subtitle: 'Động cơ mạnh mẽ, vượt dốc dễ dàng. Thích hợp cho chuyến đi dài.' },
    ebike: { title: 'Xe đạp điện', subtitle: 'Nhẹ nhàng, tiết kiệm, phù hợp di chuyển nội đô.' },
    compact: { title: 'Xe đạp điện gấp gọn', subtitle: 'Gọn gàng, dễ mang lên thang máy, phù hợp căn hộ.' }
  };

  // Promo
  promoCode = 'ECOPHUNU';
  promoAmount = '10';

  // Countdown
  days = '00'; hours = '00'; minutes = '00'; seconds = '00';
  private countdownSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private trending: TrendingService
  ) { }

  ngOnInit(): void {
    this.loadAllDataAndConfig();
  }

  ngOnDestroy(): void {
    this.countdownSubscription?.unsubscribe();
  }

  // ===== Utils =====
  private normalizeId(v: string): string {
    return (v ?? '').toString().trim().toUpperCase();
  }

  private mapIds(ids: string[], products: Product[], limit?: number): Product[] {
    const idSet = new Set((ids ?? []).map(x => this.normalizeId(x)));
    const pool = products.filter(p => idSet.has(this.normalizeId(p.id)));
    const order = (ids ?? []).map(x => this.normalizeId(x));
    const ordered = order
      .map(id => pool.find(p => this.normalizeId(p.id) === id))
      .filter(Boolean) as Product[];
    return typeof limit === 'number' ? ordered.slice(0, limit) : ordered;
  }

  private fillFallback(current: Product[], predicate: (p: Product) => boolean, products: Product[], limit: number): Product[] {
    if (current.length >= limit) return current.slice(0, limit);
    const remain = limit - current.length;
    const pool = products
      .filter(predicate)
      .filter(p => !current.some(c => c.id === p.id));
    return current.concat(pool.slice(0, remain));
  }

  // ===== Main Load =====
  loadAllDataAndConfig(): void {
    forkJoin({
      products: this.http.get<Product[]>('assets/data/products.json'),
      config: this.http.get<HomepageConfig>('assets/data/homepage.json').pipe(
        catchError(() => of(null as unknown as HomepageConfig))
      )
    }).subscribe(({ products, config }) => {

      console.log('✅ Loaded products:', products.length, 'Loaded config:', !!config);

      // 1) Nếu không có config → fallback mặc định
      if (!config) {
        this.applyRuleFallback(products);
        this.pushTrendingFromHero();
        this.cdr.detectChanges();
        return;
      }

      // 2) Promo
      if (config.promo?.active) {
        this.promoCode = config.promo.code;
        this.promoAmount = config.promo.discountAmount;
        this.startCountdown(config.promo.endDate);
      }

      // 3) Section text
      this.sectionText.motorbike = { title: config.sections.motorbike.title, subtitle: config.sections.motorbike.subtitle };
      this.sectionText.ebike = { title: config.sections.ebike.title, subtitle: config.sections.ebike.subtitle };
      this.sectionText.compact = { title: config.sections.compact.title, subtitle: config.sections.compact.subtitle };

      // 4) Hero section
      this.topRentList = this.mapIds(config.hero, products, 4);
      if (!this.topRentList.length) {
        this.topRentList = [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 4);
      }
      this.pushTrendingFromHero();

      // 5) Section merch
      const mLimit = config.sections.motorbike.limit ?? 8;
      const eLimit = config.sections.ebike.limit ?? 8;
      const cLimit = config.sections.compact.limit ?? 8;

      const motorPre = this.mapIds(config.sections.motorbike.items, products, mLimit);
      const ebikePre = this.mapIds(config.sections.ebike.items, products, eLimit);
      const compPre = this.mapIds(config.sections.compact.items, products, cLimit);

      const isMotor = (p: Product) => config.fallbackRules.motorbikeTypes.includes(p.vehicleType);
      const isEBike = (p: Product) =>
        config.fallbackRules.ebikeTypes.includes(p.vehicleType) ||
        (p.tags?.some(t => ['eco', 'student'].includes(t)) ?? false);
      const isFold = (p: Product) => p.tags?.some(t => config.fallbackRules.compactTags.includes(t)) ?? false;

      this.motorbikeList = this.fillFallback(motorPre, isMotor, products, mLimit);
      this.ecoBikeList = this.fillFallback(ebikePre, isEBike, products, eLimit);
      this.compactBikeList = this.fillFallback(compPre, isFold, products, cLimit);

      // 6) Debug output
      console.log('📦 Result:', {
        hero: this.topRentList.length,
        motor: this.motorbikeList.length,
        ebike: this.ecoBikeList.length,
        compact: this.compactBikeList.length
      });

      // 7) Nếu vẫn rỗng, fallback tự động
      if (!this.motorbikeList.length || !this.ecoBikeList.length || !this.compactBikeList.length) {
        this.applyRuleFallback(products);
        console.warn('⚠️ Merch lists empty — applied rule-based fallback.');
      }

      // 8) Force change detection
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }

  // ===== Fallback mặc định =====
  private applyRuleFallback(products: Product[]) {
    const isMotor = (p: Product) => ['Motorbike', 'Scooter'].includes(p.vehicleType);
    const isEBike = (p: Product) =>
      ['E-Bike', 'Bicycle', 'Electric Bicycle'].includes(p.vehicleType) ||
      (p.tags?.some(t => ['eco', 'student'].includes(t)) ?? false);
    const isFold = (p: Product) => p.tags?.some(t => ['compact', 'foldable'].includes(t)) ?? false;

    this.topRentList = [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 4);
    this.motorbikeList = products.filter(isMotor).slice(0, 8);
    this.ecoBikeList = products.filter(isEBike).slice(0, 8);
    this.compactBikeList = products.filter(isFold).slice(0, 8);

    console.log('🔄 Fallback counts:', {
      hero: this.topRentList.length,
      motor: this.motorbikeList.length,
      ebike: this.ecoBikeList.length,
      compact: this.compactBikeList.length
    });

    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  // ===== Trending push for header =====
  private pushTrendingFromHero() {
    this.trending.setTrending(
      (this.topRentList ?? []).map(p => ({ id: p.id, label: p.vehicleName, img: p.image }))
    );
  }

  // ===== Countdown =====
  startCountdown(endDate: string): void {
    const end = new Date(endDate).getTime();
    this.countdownSubscription?.unsubscribe();
    this.countdownSubscription = interval(1000).subscribe(() => {
      const diff = end - Date.now();
      if (diff <= 0) {
        this.days = this.hours = this.minutes = this.seconds = '00';
        this.countdownSubscription?.unsubscribe();
        return;
      }
      this.days = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
      this.hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
      this.minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
      this.seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
    });
  }

  // ===== Currency format =====
  formatVND(price: number): string {
    return (price ?? 0).toLocaleString('vi-VN') + 'đ';
  }
}
