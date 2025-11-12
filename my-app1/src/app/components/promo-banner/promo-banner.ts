import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-promo-banner',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './promo-banner.html',
    styleUrls: ['./promo-banner.css']
})
export class PromoBanner implements OnInit, OnDestroy, OnChanges {
    @Input() active = true;
    @Input() code = '';
    @Input() amount = 0;          // phần trăm
    @Input() endDate = '';        // ISO string
    @Input() variant: 'green' | 'red' = 'green'; // đổi theme nhanh

    days = '00'; hours = '00'; minutes = '00'; seconds = '00';

    private timer: any = null;
    private endTs = 0;

    ngOnInit() {
        // trường hợp inputs đã sẵn
        this.tryStart();
    }

    ngOnChanges(changes: SimpleChanges) {
        // chạy lại khi endDate/active/variant đổi sau khi load config
        if (changes['endDate'] || changes['active']) {
            this.tryStart();
        }
    }

    ngOnDestroy() {
        this.clearTimer();
    }

    private tryStart() {
        this.clearTimer();
        if (!this.active) return;
        this.endTs = this.parseEnd(this.endDate);
        if (!this.endTs) return;

        // cập nhật ngay lập tức để không đợi 1 giây đầu
        this.tick();
        // dùng setInterval “thẳng tay”, không phụ thuộc tương tác
        this.timer = window.setInterval(() => this.tick(), 1000);
    }

    private parseEnd(iso: string): number {
        const ts = new Date(iso).getTime();
        return Number.isFinite(ts) ? ts : 0;
    }

    private tick() {
        const diff = this.endTs - Date.now();
        if (diff <= 0) {
            this.setTime(0, 0, 0, 0);
            this.clearTimer();
            return;
        }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        this.setTime(d, h, m, s);
    }

    private setTime(d: number, h: number, m: number, s: number) {
        this.days = String(d).padStart(2, '0');
        this.hours = String(h).padStart(2, '0');
        this.minutes = String(m).padStart(2, '0');
        this.seconds = String(s).padStart(2, '0');
    }

    private clearTimer() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
    }
}
