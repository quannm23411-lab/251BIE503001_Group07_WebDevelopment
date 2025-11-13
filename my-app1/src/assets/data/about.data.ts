// src/app/pages/about-us/about-us.data.ts

export interface AboutStat {
  value: string;
  label: string;
}

export interface AboutValue {
  icon: string;
  title: string;
  text: string;
}

/* NEW: đối tác */
export interface AboutPartner {
  title: string;
  description: string;
  logos: string[];  // đường dẫn ảnh logo
}

/* NEW: đội ngũ */
export interface AboutTeamMember {
  name: string;
  avatar?: string;   // đường dẫn ảnh, nếu chưa có có thể để rỗng
  facebook?: string;
  linkedin?: string;
}

/* NEW: thông tin liên hệ */
export interface AboutContactItem {
  icon: string;        // class icon bootstrap (vd: 'bi bi-telephone-outbound')
  title: string;       // HOTLINE / MAIL / MẠNG XÃ HỘI
  contentHtml: string; // nội dung hiển thị, có thể dùng <br> để xuống dòng
}

/* NEW: teaser blog hiển thị trên trang About */
export interface AboutBlogTeaser {
  title: string;
  date: string;        // chuỗi ngày, có thể dùng format pipe nếu muốn
  thumbnail?: string;
}

export interface AboutUsDataModel {
  heroTitle: string;
  heroLead: string;
  heroSubLead: string;
  stats: AboutStat[];
  values: AboutValue[];

  // Đối tác & đội ngũ
  partners: AboutPartner[];
  team: AboutTeamMember[];

  // NEW: contact + blog
  contactItems: AboutContactItem[];
  blogs: AboutBlogTeaser[];
}

export const ABOUT_US_DATA: AboutUsDataModel = {
  heroTitle: 'EcoMOVE',

  heroLead: `Tại EcoMove, chúng tôi tin rằng việc di chuyển hằng ngày có thể <strong>Tiết kiệm</strong> và <strong>Thân thiện môi trường</strong> mà vẫn đảm bảo sự tiện nghi. Chúng tôi không chỉ là một dịch vụ cho thuê xe điện; chúng tôi là đối tác di chuyển xanh của bạn.`,

  heroSubLead: `Sứ mệnh của chúng tôi là xóa bỏ rào cản sở hữu xe điện bằng cách mang đến một đội xe máy và xe đạp điện đa dạng, chất lượng cao, sẵn sàng phục vụ bạn thuê theo ngày hoặc tháng với thủ tục đơn giản nhất. Hãy cùng EcoMove, biến mỗi chuyến đi thành một phần của giải pháp bền vững cho đô thị.`,

  stats: [
    { value: '30+', label: 'Trạm hỗ trợ' },
    { value: '1.200.000', label: 'Quãng đường xanh' },
    { value: '98%', label: 'Khách hàng hài lòng' }
  ],

  values: [
    {
      icon: 'bi bi-leaf',
      title: 'SỨ MỆNH',
      text: 'Kiến tạo trải nghiệm di chuyển Xanh, Tiện lợi và Bền vững nhất cho mọi cư dân đô thị.'
    },
    {
      icon: 'bi bi-patch-check',
      title: 'CAM KẾT',
      text: 'Cung cấp đội xe điện đời mới, pin khỏe; dịch vụ thuê xe linh hoạt; giao nhận nhanh chóng và hỗ trợ kỹ thuật 24/7.'
    },
    {
      icon: 'bi bi-heart',
      title: 'GIÁ TRỊ',
      text: 'Bền vững – Tiện lợi – An toàn.'
    }
  ],

  // NEW: dữ liệu phần ĐỐI TÁC
  partners: [
    {
      title: 'ĐỐI TÁC CUNG CẤP PHƯƠNG TIỆN',
      description:
        'Các đối tác cốt lõi, cung cấp nguồn xe điện chất lượng cao cho đội xe của EcoMove, giúp đảm bảo chất lượng và sự đa dạng.',
      logos: [
        'assets/images/logo_partners/logovinfast.png',
        'assets/images/logo_partners/logoyadea.png',
        'assets/images/logo_partners/logodatbike.png'
      ]
    },
    {
      title: 'ĐỐI TÁC CÔNG NGHỆ VÀ THANH TOÁN',
      description:
        'Tối ưu hóa trải nghiệm đặt xe, thanh toán an toàn và quản lý hành trình thông minh cho khách hàng của EcoMove.',
      logos: [
        'assets/images/logo_partners/logomomo.png',
        'assets/images/logo_partners/logozalopay.png',
        'assets/images/logo_partners/logoVNpay.png'
      ]
    }
  ],

  // NEW: dữ liệu phần ĐỘI NGŨ
  team: [
    {
      name: 'Minh Quân',
      avatar: 'assets/images/about_team/',
      facebook: 'https://www.facebook.com/BpSMon',
      linkedin: 'https://www.linkedin.com/in/minhquan1801/'
    },
    {
      name: 'Duy Nhất',
      avatar: 'assets/images/about_team/',
      facebook: '#',
      linkedin: '#'
    },
    {
      name: 'Ánh Linh',
      avatar: 'assets/images/about_team/anhlinh.jpg',
      facebook: 'https://www.facebook.com/anh.linh.398071',
      linkedin: 'https://www.linkedin.com/in/linh-phan-thi-anh-10168a383/'
    },
    {
      name: 'Khánh Xuân',
      avatar: 'assets/images/about_team/khanhxuan.jpg',
      facebook: 'https://www.facebook.com/khanhxuan.nguyen.7739/',
      linkedin: 'www.linkedin.com/in/khanh-xuan-nguyen-a3828b299'
    },
    {
      name: 'Hồng Phúc',
      avatar: 'assets/images/about_team/hongphuc.png',
      facebook: 'https://www.facebook.com/vhphuc101/',
      linkedin: 'https://www.linkedin.com/in/vohongphuc101/'
    }
  ],

    // NEW: dữ liệu phần THÔNG TIN LIÊN HỆ
  contactItems: [
    {
      icon: 'bi bi-telephone-outbound',
      title: 'HOTLINE',
      contentHtml: '1900 0809<br/>0905 389 287'
    },
    {
      icon: 'bi bi-envelope-fill',
      title: 'MAIL',
      contentHtml: 'ecomove.cskh@gmail.com'
    },
    {
      icon: 'bi bi-globe2',
      title: 'MẠNG XÃ HỘI',
      contentHtml:
        'FB: Thuê xe điện EcoMove<br/>' +
        'Tiktok: EcoMove<br/>' +
        'IG: @ecomove<br/>' +
        'LinkedIn: EcoMove'
    }
  ],
// Dữ liệu BLOG
  blogs: []
};
