import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, map, startWith, Subscription } from 'rxjs';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog.html',
  styleUrls: ['./blog.css'],
})
export class Blog implements OnInit, OnDestroy {
  crumb = 'Ưu đãi'; // mặc định khi redirect vào /blog -> offers
  private sub?: Subscription;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.sub = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      startWith(null),
      map(() => this.route.firstChild?.snapshot.data?.['breadcrumb'] as string | undefined)
    ).subscribe(lbl => {
      this.crumb = lbl ?? 'Ưu đãi';
      // scroll top nho nhỏ cho mượt (tuỳ thích)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
export default Blog;
