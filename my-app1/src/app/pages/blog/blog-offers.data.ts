export interface OfferItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;   
  image?: string; 
  category?: string;
}

export const BLOG_OFFERS = {
  items: [
    {
      id: '1',
      title: 'Giới thiệu bạn bè, nhận ngay 50.000VND vào tài khoản thuê xe.',
      excerpt: 'Nhân đôi niềm vui, nhận đôi ưu đãi! Bạn đã sẵn sàng lan tỏa lối sống xanh và nhận ngay 50.000VND cho mỗi người bạn giới thiệu thành công?',
      date: '2025-11-11',
      image: 'https://motogo.vn/wp-content/uploads/2021/05/thue-xe-may-san-bay-nha-trang-2.jpg',
     
      category: 'Ưu đãi',
      content: `
        <h2>Giới thiệu bạn – Nhận quà liền tay</h2>
        <p>EcoMove tri ân cộng đồng người dùng bằng chương trình <strong>Giới thiệu bạn bè</strong>.
        Mỗi khi bạn mời bạn bè đăng ký và hoàn tất đơn thuê đầu tiên, <strong>bạn và người được giới thiệu</strong>
        đều nhận ngay <strong>50.000VND</strong> vào ví thuê xe.</p>

        <h3>Cách thực hiện</h3>
        <ol>
          <li>Mở ứng dụng EcoMove → chọn mục <em>Giới thiệu bạn bè</em>.</li>
          <li>Sao chép liên kết mời riêng của bạn và gửi cho bạn bè.</li>
          <li>Khi bạn của bạn thuê xe thành công, phần thưởng sẽ được cộng tự động.</li>
        </ol>

        <blockquote>Không giới hạn số lần giới thiệu trong thời gian khuyến mãi. Càng giới thiệu nhiều, càng có nhiều quà!</blockquote>

        <p>Chương trình áp dụng đến hết <strong>30/12/2025</strong>.  
        Hãy chia sẻ hành trình xanh cùng EcoMove nhé 🌱</p>
      `
    },
    {
      id: '2',
      title: 'Giảm 20% cho lần thuê đầu tiên: Mã [ECOM20] chỉ có trong tháng này!',
      excerpt: 'Đặt xe nhanh, chạy êm – nhận ưu đãi liền tay.',
      date: '2025-10-30',
      image: 'https://xeducvinh.vn/wp-content/uploads/2023/09/cho-thue-xe-audi-a4-hang-sang.jpg',
      category: 'Ưu đãi',
      content: `
        <h2>Ưu đãi tân binh EcoMove – Giảm 20% với mã <code>ECOM20</code></h2>
        <p>Chào mừng bạn đến với EcoMove! Trong tháng này, khi đăng ký tài khoản mới và đặt xe đầu tiên, 
        bạn sẽ được <strong>giảm ngay 20%</strong> (tối đa 120.000VND) bằng cách nhập mã <code>ECOM20</code>.</p>

        <h3>Điều kiện áp dụng</h3>
        <ul>
          <li>Áp dụng cho người dùng mới đăng ký trong vòng 60 ngày.</li>
          <li>Không áp dụng đồng thời với mã giảm giá phần trăm khác.</li>
          <li>Không áp dụng cho các phụ phí bổ sung.</li>
        </ul>

        <p>Hãy đặt xe, vi vu và tận hưởng hành trình xanh cùng EcoMove!</p>
      `
    },
    {
      id: '3',
      title: 'Thuê xe 3 ngày, tính tiền 2 ngày: Chào mừng Quốc Khánh 2/9.',
      excerpt: 'Ưu đãi áp dụng cho tất cả dòng xe điện đô thị.',
      date: '2025-08-30',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkFcsAbexbzSHDZqSnDFi2lM3bJeuji2OVaQ&s',
      category: 'Ưu đãi',
      content: `
        <h2>Chào mừng Quốc khánh – Ưu đãi 3 ngày tính tiền 2 ngày</h2>
        <p>Đặt xe từ <strong>30/8 đến 5/9</strong>, bạn chỉ phải thanh toán 2 ngày khi thuê 3 ngày.</p>

        <p>Áp dụng cho tất cả dòng xe điện đô thị (Eco EV, City EV).  
        Số lượng ưu đãi giới hạn mỗi ngày, nhanh tay đặt sớm để giữ chỗ!</p>

        <p>Chương trình chỉ áp dụng cho thanh toán trực tuyến, không áp dụng kèm ưu đãi khác.</p>
      `
    },
    {
      id: '4',
      title: 'Miễn phí giao xe tận nơi trong bán kính 5km',
      excerpt: 'Đặt xe online – nhận xe tại nhà, tiện lợi và tiết kiệm.',
      date: '2025-11-04',
      image: 'https://motortrip.vn/wp-content/uploads/2021/11/thue-xe-may-phu-quoc-3.jpg',
      category: 'Tin tức',
      content: `
        <h2>Dịch vụ giao xe miễn phí bán kính 5km</h2>
        <p>EcoMove ra mắt dịch vụ mới: <strong>Giao xe tận nơi miễn phí</strong> trong phạm vi 5km tính từ trạm gần nhất.</p>

        <ul>
          <li>Áp dụng cho mọi đơn hàng có giá trị từ 300.000VND trở lên.</li>
          <li>Khách hàng có thể chọn khung giờ giao xe linh hoạt trong ứng dụng.</li>
          <li>Phí ngoài 5km được tính 5.000VND/km.</li>
        </ul>

        <p>Tiện lợi, nhanh chóng và thân thiện – chỉ có tại EcoMove!</p>
      `
    },
    {
      id: '5',
      title: 'Bảo dưỡng giữa kỳ cho toàn bộ đội xe',
      excerpt: 'EcoMove kiểm tra định kỳ đảm bảo an toàn tối đa cho chuyến đi.',
      date: '2025-09-18',
      image: 'https://storage.googleapis.com/blogvxr-uploads/2025/10/18279fa2-thue-xe-may-tuy-hoa-phu-yen-8216924.jpg',
      category: 'Tin tức',
      content: `
        <h2>Bảo dưỡng giữa kỳ – An toàn hành trình của bạn là ưu tiên số 1</h2>
        <p>Đội ngũ kỹ thuật EcoMove thực hiện kiểm tra định kỳ giữa kỳ toàn bộ hệ thống xe điện và hybrid.</p>

        <ul>
          <li>Thay pin, lốp, kiểm tra hệ thống phanh và đèn tín hiệu.</li>
          <li>Cập nhật phần mềm giám sát tiêu thụ năng lượng.</li>
          <li>Khử khuẩn, làm sạch toàn bộ nội thất và khoang lái.</li>
        </ul>

        <p>Nhờ đó, bạn có thể yên tâm tận hưởng chuyến đi mượt mà và an toàn tuyệt đối.</p>
      `
    },
    {
      id: '6',
      title: 'Nạp tiền ví EcoMove tặng thêm 10%',
      excerpt: 'Áp dụng cho các gói từ 300.000VND, không giới hạn số lần trong 3 ngày.',
      date: '2025-11-02',
      image: '/assets/images/offers/topup.jpg',
      category: 'Ưu đãi',
      content: `
        <h2>Nạp ví EcoMove – nhận thêm 10% giá trị</h2>
        <p>Trong 3 ngày khuyến mãi đặc biệt, khi nạp ví với giá trị từ <strong>300.000VND trở lên</strong>, bạn sẽ được cộng thêm <strong>10%</strong> giá trị vào tài khoản.</p>

        <p>Ví dụ: Nạp 500.000VND → nhận 550.000VND trong ví ngay lập tức!</p>

        <p>Không giới hạn số lần nạp trong thời gian khuyến mãi, 
        áp dụng cho mọi phương thức thanh toán: Momo, ZaloPay, ngân hàng.</p>
      `
    }
  ]
};

