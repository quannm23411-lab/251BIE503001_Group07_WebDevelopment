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
        <div class="bd-content">
          <h2>Giới thiệu bạn – Nhận quà liền tay</h2>
          <p>EcoMove tri ân cộng đồng người dùng bằng chương trình <strong>Giới thiệu bạn bè</strong>. Mỗi khi bạn mời bạn bè đăng ký và hoàn tất đơn thuê đầu tiên, <strong>bạn và người được giới thiệu</strong> đều nhận ngay <strong>50.000VND</strong> vào ví thuê xe. Ưu đãi áp dụng trên toàn quốc cho tất cả dòng xe điện và hybrid trong hệ thống EcoMove.</p>

          <h3>Cách thực hiện</h3>
          <ol>
            <li>Mở ứng dụng EcoMove &rarr; vào mục <em>Giới thiệu bạn bè</em>.</li>
            <li>Sao chép mã hoặc liên kết mời cá nhân &rarr; gửi cho bạn bè.</li>
            <li>Bạn của bạn đăng ký, xác minh tài khoản và hoàn tất <strong>đơn thuê đầu tiên</strong>.</li>
            <li>Phần thưởng sẽ được cộng tự động vào ví của cả hai trong vòng 5–10 phút sau khi đơn thuê được xác nhận hoàn tất.</li>
          </ol>

          <blockquote>Không giới hạn số lần giới thiệu trong thời gian khuyến mãi. Càng giới thiệu nhiều, càng có nhiều quà!</blockquote>

          <h3>Điều kiện &amp; lưu ý</h3>
          <ul>
            <li>Mỗi tài khoản chỉ được nhận thưởng “người được giới thiệu” một lần cho đơn thuê đầu tiên.</li>
            <li>Khoản thưởng trong ví có thể sử dụng để thanh toán phí thuê xe, phí giao/nhận, phụ phí đường dài; không quy đổi thành tiền mặt.</li>
            <li>Trong trường hợp đơn thuê bị hủy do vi phạm điều khoản, phần thưởng sẽ tự động thu hồi.</li>
            <li>Không áp dụng cùng lúc với các chương trình thưởng giới thiệu đặc biệt khác (nếu có).</li>
          </ul>

          <h3>FAQ nhanh</h3>
          <p><strong>Hỏi:</strong> Bạn mình đặt nhưng chưa xác minh tài khoản, có nhận thưởng không?<br>
          <strong>Đáp:</strong> Cần hoàn tất xác minh và kết thúc đơn thuê đầu tiên hợp lệ mới được cộng thưởng.</p>

          <p><strong>Hỏi:</strong> Mã mời của tôi có hết hạn không?<br>
          <strong>Đáp:</strong> Mã không hết hạn trong thời gian diễn ra chương trình; tuy nhiên, thời gian khuyến mãi có thể thay đổi theo thông báo trong ứng dụng.</p>

          <h3>Thời gian áp dụng</h3>
          <p>Chương trình áp dụng đến hết <strong>30/12/2025</strong>. Hãy lan tỏa lối sống xanh và nhận quà cùng EcoMove 🌱</p>
        </div>
      `
    },
    {
      id: '2',
      title: 'Giảm 20% cho lần thuê đầu tiên: Mã [ECOM20] chỉ có trong tháng này!',
      excerpt: 'Đặt xe nhanh, chạy êm – nhận ưu đãi liền tay.',
      date: '2025-10-30',
      image: 'https://i.pinimg.com/736x/3e/94/09/3e940937b2aa01bce8cb2700cccf122b.jpg',
      category: 'Ưu đãi',
      content: `
        <div class="bd-content">
          <h2>Ưu đãi tân binh EcoMove – Giảm 20% với mã <code>ECOM20</code></h2>
          <p>Chào mừng bạn đến với EcoMove! Trong tháng này, khi đăng ký tài khoản mới và đặt xe đầu tiên, bạn sẽ được <strong>giảm ngay 20%</strong> (tối đa 120.000VND) bằng cách nhập mã <code>ECOM20</code>. Ưu đãi áp dụng cho mọi dòng xe điện đô thị, xe đường dài và xe máy điện có mặt trên ứng dụng.</p>

          <h3>Điều kiện áp dụng</h3>
          <ul>
            <li>Áp dụng cho người dùng mới đăng ký trong vòng 60 ngày tính từ thời điểm tạo tài khoản.</li>
            <li>Mỗi tài khoản được sử dụng mã <code>ECOM20</code> một lần cho <strong>đơn thuê đầu tiên</strong>.</li>
            <li>Không áp dụng đồng thời với mã giảm giá phần trăm khác; có thể dùng cùng ưu đãi tiền ví nếu đủ điều kiện.</li>
            <li>Không áp dụng cho phụ phí cầu đường, vé bến bãi, hoặc các khoản phạt vi phạm hợp đồng.</li>
          </ul>

          <h3>Cách sử dụng mã</h3>
          <ol>
            <li>Chọn xe &rarr; Chọn thời gian thuê &rarr; Chọn điểm giao/nhận.</li>
            <li>Tại bước <em>Thanh toán</em>, nhập mã <code>ECOM20</code>.</li>
            <li>Kiểm tra số tiền giảm hiển thị &rarr; Xác nhận thanh toán để hoàn tất.</li>
          </ol>

          <h3>Mẹo tiết kiệm thêm</h3>
          <ul>
            <li>Đặt sớm 3–7 ngày để có mức giá tốt hơn.</li>
            <li>Chọn khung giờ giao/nhận linh hoạt để tối ưu chi phí giao xe.</li>
            <li>Kết hợp cùng ví thưởng từ chương trình “Giới thiệu bạn bè” để nhân đôi ưu đãi.</li>
          </ul>

          <blockquote>Ưu đãi có thể kết thúc sớm khi đạt hạn mức ngân sách trong tháng. Hãy tận dụng ngay hôm nay!</blockquote>
        </div>
      `
    },
    {
      id: '3',
      title: 'Thuê xe 3 ngày, tính tiền 2 ngày: Chào mừng Quốc Khánh 2/9.',
      excerpt: 'Ưu đãi áp dụng cho tất cả dòng xe điện đô thị.',
      date: '2025-08-30',
      image: 'https://i.pinimg.com/736x/6b/fb/5d/6bfb5d6e9dd161bee90191aa8dedf302.jpg',
      category: 'Ưu đãi',
      content: `
        <div class="bd-content">
          <h2>Chào mừng Quốc khánh – Ưu đãi 3 ngày tính tiền 2 ngày</h2>
          <p>Từ <strong>30/8 đến 5/9</strong>, đặt xe bất kỳ dòng <em>Eco EV</em> hoặc <em>City EV</em> trong 3 ngày, bạn chỉ thanh toán 2 ngày. Ngày miễn phí sẽ được hệ thống tự động khấu trừ vào hóa đơn tại bước thanh toán.</p>

          <h3>Phạm vi &amp; đối tượng</h3>
          <ul>
            <li>Áp dụng tại các thành phố có chi nhánh EcoMove: TP.HCM, Hà Nội, Đà Nẵng, Cần Thơ, Hải Phòng.</li>
            <li>Áp dụng cho người dùng cá nhân; khách doanh nghiệp vui lòng liên hệ để nhận báo giá đoàn.</li>
          </ul>

          <h3>Điều kiện &amp; loại trừ</h3>
          <ul>
            <li>Áp dụng cho đơn đặt mới, thời lượng thuê liên tục từ 72 giờ.</li>
            <li>Không áp dụng kèm mã giảm phần trăm khác; có thể cộng dồn với ví thưởng giới thiệu.</li>
            <li>Số lượng suất ưu đãi có hạn mỗi ngày; hệ thống sẽ hiển thị trạng thái còn/đã hết suất theo thời gian thực.</li>
          </ul>

          <h3>Gợi ý lịch trình 3 ngày</h3>
          <ol>
            <li><strong>Ngày 1:</strong> Nhận xe buổi sáng, kiểm tra nhanh tình trạng, khởi hành theo lộ trình nội đô.</li>
            <li><strong>Ngày 2:</strong> Di chuyển liên tỉnh/ngoại thành, tối ưu điểm sạc/điểm nghỉ.</li>
            <li><strong>Ngày 3:</strong> Trải nghiệm điểm đến cuối &rarr; trả xe linh hoạt theo khung giờ đã chọn.</li>
          </ol>

          <blockquote>Vui lòng đọc kỹ hợp đồng số, chụp ảnh hiện trạng xe khi nhận và trước khi trả để bảo vệ quyền lợi của bạn.</blockquote>
        </div>
      `
    },
    {
      id: '4',
      title: 'Miễn phí giao xe tận nơi trong bán kính 5km',
      excerpt: 'Đặt xe online – nhận xe tại nhà, tiện lợi và tiết kiệm.',
      date: '2025-11-04',
      image: 'https://i.pinimg.com/736x/7c/73/57/7c7357312de2baee0795f0ca0aa2bf77.jpg',
      category: 'Tin tức',
      content: `
        <div class="bd-content">
          <h2>Dịch vụ giao xe miễn phí bán kính 5km</h2>
          <p>EcoMove chính thức triển khai dịch vụ <strong>giao xe tận nơi miễn phí</strong> trong bán kính 5km tính từ trạm gần nhất. Tính năng này giúp bạn tiết kiệm thời gian di chuyển, đặc biệt trong các khung giờ cao điểm hoặc khi lịch trình dày đặc.</p>

          <h3>Cách đặt giao/nhận tận nơi</h3>
          <ol>
            <li>Chọn xe &rarr; Chọn thời gian &rarr; Bật tùy chọn <em>Giao/nhận tại địa chỉ</em>.</li>
            <li>Nhập địa chỉ chi tiết (tên tòa nhà, số nhà, phường/xã) và chọn khung giờ mong muốn.</li>
            <li>Xác nhận lại phí giao/nhận (0đ nếu trong 5km) &rarr; Đặt xe.</li>
          </ol>

          <h3>Chính sách phí ngoài phạm vi</h3>
          <ul>
            <li>Phí ngoài 5km: <strong>5.000VND/km</strong>, tính dựa trên quãng đường một chiều ngắn nhất.</li>
            <li>Miễn phụ phí tầng hầm/tầng cao nếu bãi gửi có lối tiếp cận thuận tiện cho xe.</li>
          </ul>

          <h3>Lưu ý quan trọng</h3>
          <ul>
            <li>Áp dụng cho đơn có giá trị từ <strong>300.000VND</strong> trở lên.</li>
            <li>Khung giờ giao/nhận phụ thuộc tình trạng xe và điều phối; hệ thống sẽ gợi ý khung giờ khả dụng gần nhất.</li>
            <li>Vui lòng giữ liên lạc trong 15 phút trước/sau giờ hẹn để đội ngũ giao xe xác nhận hiện trạng.</li>
          </ul>

          <blockquote>Tiện lợi, nhanh chóng và thân thiện – chỉ có tại EcoMove!</blockquote>
        </div>
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
        <div class="bd-content">
          <h2>Bảo dưỡng giữa kỳ – An toàn hành trình của bạn là ưu tiên số 1</h2>
          <p>Để mỗi chuyến đi đều mượt mà và an tâm, đội ngũ kỹ thuật EcoMove triển khai đợt <strong>bảo dưỡng giữa kỳ</strong> cho toàn bộ đội xe điện/hybrid trên toàn hệ thống. Công tác bảo dưỡng bao gồm kiểm tra tổng thể cơ – điện – phần mềm theo tiêu chuẩn nhà sản xuất và quy trình nội bộ của EcoMove.</p>

          <h3>Danh mục bảo dưỡng chính</h3>
          <ul>
            <li>Kiểm tra và cân chỉnh hệ thống phanh, lốp, đèn chiếu sáng/tín hiệu.</li>
            <li>Đo và đánh giá sức khỏe pin, cập nhật firmware quản lý pin (BMS).</li>
            <li>Vệ sinh, khử khuẩn khoang lái; thay lọc gió/lọc cabin (nếu đến hạn).</li>
            <li>Hiệu chỉnh cảm biến ADAS và cập nhật phần mềm giám sát tiêu thụ năng lượng.</li>
          </ul>

          <h3>Ảnh hưởng đến lịch đặt xe</h3>
          <p>Một số dòng xe có thể <em>tạm ngưng</em> trong vài giờ để bảo dưỡng. Ứng dụng sẽ hiển thị trạng thái theo thời gian thực và đề xuất mẫu xe tương đương nếu chiếc bạn chọn đang trong lịch bảo dưỡng.</p>

          <h3>Mẹo kiểm tra nhanh trước chuyến đi</h3>
          <ol>
            <li>Chụp ảnh 4 góc xe, đồng hồ công tơ, mức pin/nhiên liệu trước khi nhận.</li>
            <li>Kiểm tra lốp, phanh tay, đèn chiếu gần/xa, tín hiệu rẽ.</li>
            <li>Đọc nhanh <em>Checklist nhận xe</em> trong ứng dụng và đánh dấu hoàn tất.</li>
          </ol>

          <blockquote>EcoMove luôn đặt an toàn của khách hàng lên hàng đầu – mọi chiếc xe rời bãi đều đạt chuẩn kỹ thuật nghiêm ngặt.</blockquote>
        </div>
      `
    },
    {
      id: '6',
      title: 'Nạp tiền ví EcoMove tặng thêm 10%',
      excerpt: 'Áp dụng cho các gói từ 300.000VND, không giới hạn số lần trong 3 ngày.',
      date: '2025-11-02',
      image: 'https://mgdongsaigon.com.vn/wp-content/uploads/2023/06/dreamstime_xxl_139966991-scaled-1.jpg',
      category: 'Ưu đãi',
      content: `
        <div class="bd-content">
          <h2>Nạp ví EcoMove – nhận thêm 10% giá trị</h2>
          <p>Trong 3 ngày khuyến mãi đặc biệt, khi nạp ví với giá trị từ <strong>300.000VND</strong> trở lên, bạn sẽ được cộng thêm <strong>10%</strong> giá trị vào tài khoản. Khoản thưởng hiển thị ngay trong mục <em>Ví &amp; Thanh toán</em> sau vài phút, sẵn sàng dùng cho mọi giao dịch thuê xe.</p>

          <h3>Ví dụ minh họa</h3>
          <ul>
            <li>Nạp 300.000VND &rarr; Nhận 330.000VND.</li>
            <li>Nạp 500.000VND &rarr; Nhận 550.000VND.</li>
            <li>Nạp 1.000.000VND &rarr; Nhận 1.100.000VND.</li>
          </ul>

          <h3>Điều kiện sử dụng</h3>
          <ul>
            <li>Khoản thưởng không quy đổi tiền mặt, không chuyển nhượng.</li>
            <li>Có thể dùng cùng các chương trình giảm giá khác nếu điều kiện cho phép.</li>
            <li>Không áp dụng thanh toán các khoản phạt vi phạm/hủy đơn.</li>
          </ul>

          <h3>Cách nạp nhanh</h3>
          <ol>
            <li>Vào <em>Ví &amp; Thanh toán</em> &rarr; chọn số tiền nạp.</li>
            <li>Chọn phương thức: thẻ ngân hàng, Momo, ZaloPay, chuyển khoản nhanh.</li>
            <li>Xác nhận giao dịch &rarr; Kiểm tra số dư và khoản thưởng.</li>
          </ol>

          <blockquote>Không giới hạn số lần nạp trong thời gian khuyến mãi. Tận dụng để đặt xe giá tốt cho mùa lễ hội!</blockquote>
        </div>
      `
    }
  ]
};
