import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root' 
})
export class ReviewStateService {

  // Kênh "bắn tin" (vẫn giữ)
  private reviewSubmittedSource = new Subject<string>();
  public reviewSubmitted$ = this.reviewSubmittedSource.asObservable();
  
  // ==========================================================
  // ⭐ THÊM BỘ NHỚ
  // Thêm một Set để "ghi nhớ" các đơn hàng đã được gửi trong phiên này
  // ==========================================================
  private submittedOrderIds = new Set<string>();

  /**
   * Component 'account-review' sẽ gọi hàm này khi gửi thành công.
   */
  notifyReviewSubmitted(orderId: string) {
    if (orderId) {
      // 1. Ghi nhớ
      this.submittedOrderIds.add(orderId);
      
      // 2. "Bắn tin" (cho các component đang "sống")
      this.reviewSubmittedSource.next(orderId);
    }
  }

  // ==========================================================
  // ⭐ THÊM HÀM MỚI
  // Hàm để component 'orders' gọi khi nó tải lại
  // ==========================================================
  getSubmittedOrderIds(): Set<string> {
    return this.submittedOrderIds;
  }
}