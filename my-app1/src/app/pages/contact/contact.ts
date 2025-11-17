import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class Contact {
  isChatVisible: boolean = false;
  public showBackToTop: boolean = false;  

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    // Lấy vị trí cuộn (tương thích nhiều trình duyệt)
    const scrollOffset = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

    // Chỉ hiện nút nếu người dùng cuộn xuống quá 300px
    this.showBackToTop = scrollOffset > 300;
  }
  toggleChat() {
    this.isChatVisible = !this.isChatVisible;
  }

  closeChat() {
    this.isChatVisible = false;

  }
  
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
