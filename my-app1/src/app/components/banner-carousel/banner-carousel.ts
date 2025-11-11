import { Component, Input, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BannerItem = {
    id: string;
    src: string;           // /assets/images/banner-1.jpg
    alt?: string;
    link?: string;         // optional: click chuyển trang
};

@Component({
    selector: 'app-banner-carousel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './banner-carousel.html',
    styleUrls: ['./banner-carousel.css']
})
export class BannerCarousel implements OnDestroy {
    @Input({ required: true }) items: BannerItem[] = [];
    @Input() intervalMs = 4000;
    @Input() showArrows = true;
    @Input() showDots = true;
    @Input() pauseOnHover = true;
    @Input() loop = true;

    active = signal(0);
    private timer: any;

    constructor() {
        // auto-play
        effect(() => {
            this.clearTimer();
            if (this.items.length === 0 || this.intervalMs <= 0) return;
            this.timer = setInterval(() => this.next(), this.intervalMs);
        });
    }

    ngOnDestroy() { this.clearTimer(); }
    private clearTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }

    onHover(enter: boolean) {
        if (!this.pauseOnHover) return;
        enter ? this.clearTimer() : (this.timer = setInterval(() => this.next(), this.intervalMs));
    }

    next() {
        if (this.items.length === 0) return;
        const i = this.active();
        const n = i + 1;
        if (n < this.items.length) this.active.set(n);
        else if (this.loop) this.active.set(0);
    }

    prev() {
        if (this.items.length === 0) return;
        const i = this.active();
        const p = i - 1;
        if (p >= 0) this.active.set(p);
        else if (this.loop) this.active.set(this.items.length - 1);
    }

    go(i: number) { if (i >= 0 && i < this.items.length) this.active.set(i); }

    trackById(_: number, it: BannerItem) { return it.id; }
}
