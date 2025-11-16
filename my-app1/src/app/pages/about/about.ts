// src/app/pages/about/about.ts (hoặc tên file của bạn)

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ABOUT_US_DATA, AboutUsDataModel } from './about.data';
import { BLOG_NEWS } from '../../../assets/data/blog-news.data'; // sửa path nếu khác

@Component({
  standalone: true,
  selector: 'app-about-us',
  templateUrl: './about.html',
  styleUrls: ['./about.css'],
  imports: [CommonModule, RouterModule]
})
export class About {
  data: AboutUsDataModel = ABOUT_US_DATA;

  // ===== BLOG TEASER =====
  blogOffers = BLOG_NEWS.items;   // toàn bộ bài blog
  pageSize = 2;                   // 1 lần hiện 2 khung
  currentStartIndex = 0;

  visibleBlogOffers = this.blogOffers.slice(0, this.pageSize);

  showNextBlog() {
    this.currentStartIndex += this.pageSize;
    if (this.currentStartIndex >= this.blogOffers.length) {
      this.currentStartIndex = 0; // quay lại từ đầu
    }
    this.visibleBlogOffers = this.blogOffers.slice(
      this.currentStartIndex,
      this.currentStartIndex + this.pageSize
    );
  }

  showPrevBlog() {
    this.currentStartIndex -= this.pageSize;
    if (this.currentStartIndex < 0) {
      this.currentStartIndex = Math.max(this.blogOffers.length - this.pageSize, 0);
    }
    this.visibleBlogOffers = this.blogOffers.slice(
      this.currentStartIndex,
      this.currentStartIndex + this.pageSize
    );
  }
}
