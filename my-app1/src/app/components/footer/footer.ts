import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink], // ⬅️ THÊM DÒNG NÀY
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class Footer {

  /**
   * 🔽 THÊM MỚI: Xử lý sự kiện submit form đăng ký
   */
  onSubscribe(event: Event) {
    event.preventDefault(); // Ngăn trang reload
    
    const form = event.target as HTMLFormElement;
    const input = form.querySelector('#emailInput') as HTMLInputElement;
    const msgEl = document.getElementById('subscribeMsg');

    if (input && msgEl) {
      const email = input.value;
      if (email) {
        // Giả lập gửi API thành công
        msgEl.textContent = 'Cảm ơn bạn đã đăng ký!';
        msgEl.className = 'subscribe__msg small text-success mb-0';
        form.reset();
      } else {
        // Xử lý lỗi (nếu cần)
        msgEl.textContent = 'Vui lòng nhập email hợp lệ.';
        msgEl.className = 'subscribe__msg small text-danger mb-0';
      }

      // Tự động xóa thông báo sau 3 giây
      setTimeout(() => {
        msgEl.textContent = '';
      }, 3000);
    }
  }
}