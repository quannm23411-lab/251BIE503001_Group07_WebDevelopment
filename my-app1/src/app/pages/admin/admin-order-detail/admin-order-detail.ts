import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs'; 

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// (Hãy chắc chắn bạn đã chạy: npm install jspdf jspdf-autotable)

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-order-detail.html',
  styleUrl: './admin-order-detail.css'
})
export class AdminOrderDetail implements OnInit {
  order: any; 
  customer: any; 
  rentedItems: any[] = []; 
  
  isLoading: boolean = true;
  
  // Dữ liệu cho <select>
  orderStatuses = ['Đã hoàn thành', 'Đang thuê', 'Đã xác nhận', 'Đã huỷ'];
  paymentStatuses = ['Đã thanh toán', 'Chờ thanh toán'];
  depositStatuses = ['Đã thanh toán', 'Không yêu cầu', 'Chờ xử lý'];
  vehicleStatuses = ['Chờ giao', 'Đang thuê', 'Đã trả', 'Sự cố'];
  
  showConfirmPopup: boolean = false;
  showSuccessPopup: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isLoading = true;
    
    this.route.paramMap.subscribe(params => {
        const orderId = params.get('id');

        if (orderId) {
            const orders$ = this.http.get<any[]>('assets/data/orders.json');
            const customers$ = this.http.get<any[]>('assets/data/customers.json');
            const products$ = this.http.get<any[]>('assets/data/products.json'); 
            
            forkJoin([orders$, customers$, products$]).subscribe({
                next: ([ordersData, customersData, productsData]) => {
                    
                    // 1. Tìm đơn hàng
                    const foundOrder = ordersData.find(o => o.maDonThue === orderId);
                    if (!foundOrder) {
                        console.error('Không tìm thấy đơn hàng:', orderId);
                        this.isLoading = false;
                        this.cdr.detectChanges();
                        return;
                    }
                    this.order = foundOrder;
                    
                    if (!this.orderStatuses.includes(this.order.tinhTrangDon)) {
                      this.orderStatuses.push(this.order.tinhTrangDon);
                    }

                    // 2. Tìm khách hàng
                    this.customer = customersData.find(c => c.maKhachHang === this.order.maKhachHang);
                    if (!this.customer) {
                        this.customer = { hoTen: 'Khách vãng lai' }; // Dự phòng
                    }

                    // 3. Xử lý danh sách xe
                    const productMap = new Map(productsData.map(p => [p.id, p]));
                    this.rentedItems = this.order.chiTietDonThue.map((item: any) => {
                        const product = productMap.get(item.idXe) || {};
                        return {
                            ...item, // Dữ liệu từ order (soNgayThue, donGia...)
                            vehicleName: product.vehicleName || 'Không rõ tên xe',
                            image: product.image || 'assets/images/default.png'
                        };
                    });

                    this.isLoading = false; 
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Lỗi khi tải dữ liệu', err);
                    this.isLoading = false;
                    this.cdr.detectChanges();
                }
            });
        } else {
            console.error('Không tìm thấy ID trong URL');
            this.isLoading = false;
            this.cdr.detectChanges();
        }
    });
  }

  // === CẬP NHẬT: HÀM TẢI FONT (SỬA LỖI btoa) ===
  private async loadFont(doc: jsPDF) {
    try {
      // 1. Tải font Thường (Regular)
      const fontUrl_Regular = 'assets/fonts/Roboto-Regular.ttf';
      const response_Regular = await fetch(fontUrl_Regular);
      if (!response_Regular.ok) throw new Error('Không tải được font Regular');
      const font_Regular_Buffer = await response_Regular.arrayBuffer();
      const fontData_Regular = new Uint8Array(font_Regular_Buffer);
      
      // 2. Tải font Đậm (Bold)
      const fontUrl_Bold = 'assets/fonts/Roboto-Bold.ttf';
      const response_Bold = await fetch(fontUrl_Bold);
      if (!response_Bold.ok) throw new Error('Không tải được font Bold');
      const font_Bold_Buffer = await response_Bold.arrayBuffer();
      const fontData_Bold = new Uint8Array(font_Bold_Buffer);

      // 3. === SỬA LỖI: Chuyển đổi Uint8Array sang Base64 một cách an toàn ===
      // Phương thức cũ (String.fromCharCode.apply) thất bại với file lớn.
      // Phương thức mới (reduce) an toàn hơn.
      const fontData_Regular_Binary = fontData_Regular.reduce((data, byte) => data + String.fromCharCode(byte), '');
      const fontData_Bold_Binary = fontData_Bold.reduce((data, byte) => data + String.fromCharCode(byte), '');

      doc.addFileToVFS('Roboto-Regular.ttf', btoa(fontData_Regular_Binary));
      doc.addFileToVFS('Roboto-Bold.ttf', btoa(fontData_Bold_Binary));
      
      // 4. Thêm font vào doc
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
      
      // 5. Đặt font mặc định là 'normal'
      doc.setFont('Roboto', 'normal');

    } catch (e) {
      console.warn("Không tải được font tiếng Việt, sử dụng font mặc định. Lỗi:", e);
      // Nếu lỗi, dùng font mặc định (tiếng Việt có thể bị lỗi)
      doc.setFont('helvetica', 'normal');
    }
  }

  // 1. Xuất đơn hàng (chi tiết)
  async exportInvoice() {
    const doc = new jsPDF();
    await this.loadFont(doc); // Tải font tiếng Việt

    const o = this.order;
    const c = this.customer;
    const p = o.thanhToan;
    const items = this.rentedItems;
    
    // Tiêu đề
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(22);
    doc.text('ĐƠN HÀNG THUÊ XE', 105, 20, { align: 'center' });
    
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(12);
    doc.text(`Mã đơn: ${o.maDonThue}`, 105, 28, { align: 'center' });

    // Thông tin khách hàng và đơn hàng
    autoTable(doc, {
      startY: 35,
      body: [
        ['Khách hàng:', c.hoTen || 'N/A', 'Ngày đặt:', new Date(o.thoiGianDatHang).toLocaleString('vi-VN')],
        ['Số điện thoại:', c.soDienThoai || 'N/A', 'Trạng thái đơn:', o.tinhTrangDon],
        ['Email:', c.email || 'N/A', 'Trạng thái thanh toán:', p.tinhTrangThanhToan],
      ],
      theme: 'plain',
      styles: { font: 'Roboto', fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35 },
        1: { cellWidth: 60 },
        2: { fontStyle: 'bold', cellWidth: 40 },
        3: { cellWidth: 'auto' }
      }
    });

    // Chi tiết xe thuê
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(14);
    doc.text('Chi tiết xe thuê', 14, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['STT', 'Tên xe', 'Thời gian nhận', 'Thời gian trả', 'Địa điểm nhận', 'Địa điểm trả', 'Đơn giá', 'Số ngày', 'Tổng']],
      body: items.map((item, index) => [
        index + 1,
        item.vehicleName,
        new Date(item.thoiGianNhanXe).toLocaleString('vi-VN'),
        new Date(item.thoiGianTraXe).toLocaleString('vi-VN'),
        item.diaDiemNhanXe,
        item.diaDiemTraXe,
        `${item.donGia.toLocaleString('vi-VN')}đ`,
        item.soNgayThue,
        `${item.tongGiaTri.toLocaleString('vi-VN')}đ`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [86, 124, 2], font: 'Roboto', fontStyle: 'bold' },
      styles: { font: 'Roboto', fontSize: 9 }
    });

    // Tổng kết thanh toán
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      body: [
        ['Tổng giá trị gốc:', `${p.tongGiaTriGoc.toLocaleString('vi-VN')}đ`],
        ['Mã giảm giá:', p.maGiamGia || 'Không áp dụng'],
        ['Tiền giảm:', `- ${p.tienGiam.toLocaleString('vi-VN')}đ`],
        ['Tiền đặt cọc:', `${o.tienDatCoc.toLocaleString('vi-VN')}đ`],
        ['Mã thanh toán', p.maThanhToan || 'Chưa thanh toán'],
        [{ content: 'Tổng thanh toán (Sau giảm):', styles: { fontStyle: 'bold', fontSize: 12 } }, 
         { content: `${p.chiPhiSauGiam.toLocaleString('vi-VN')}đ`, styles: { fontStyle: 'bold', fontSize: 12 } }],
      ],
      theme: 'plain',
      styles: { font: 'Roboto', fontSize: 11 },
      columnStyles: { 
        0: { halign: 'right', fontStyle: 'bold' },
        1: { halign: 'right' }
      }
    });

    // Footer
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(10);
    doc.text('Cảm ơn quý khách đã sử dụng dịch vụ của EcoMove!', 105, (doc as any).lastAutoTable.finalY + 15, { align: 'center' });

    doc.save(`DonHang-${o.maDonThue}.pdf`);
  }

  // 2. Xuất phiếu thanh toán (ngắn gọn)
  async exportReceipt() {
    const doc = new jsPDF();
    await this.loadFont(doc); // Tải font tiếng Việt
    
    const o = this.order;
    const c = this.customer;
    const p = o.thanhToan;

    // Tiêu đề
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(22);
    doc.text('PHIẾU THANH TOÁN', 105, 20, { align: 'center' });
    
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(12);
    doc.text(`Mã đơn: ${o.maDonThue}`, 105, 28, { align: 'center' });
    doc.text(`Mã thanh toán: ${p.maThanhToan || 'Chưa thanh toán'}`, 105, 36, { align: 'center' });

    // Thông tin
    autoTable(doc, {
      startY: 45,
      body: [
        ['Khách hàng:', c.hoTen || 'N/A'],
        ['Số điện thoại:', c.soDienThoai || 'N/A'],
        ['Ngày đặt:', new Date(o.thoiGianDatHang).toLocaleString('vi-VN')],
        ['Trạng thái thanh toán:', p.tinhTrangThanhToan],
      ],
      theme: 'plain',
      styles: { font: 'Roboto', fontSize: 11 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' },
      }
    });

    // Chi tiết thanh toán
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(14);
    doc.text('Chi tiết thanh toán', 14, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Diễn giải', 'Số tiền']],
      body: [
        ['Tổng giá trị gốc (tất cả xe)', `${p.tongGiaTriGoc.toLocaleString('vi-VN')}đ`],
        ['Mã giảm giá', p.maGiamGia || 'Không áp dụng'],
        ['Tiền giảm', `- ${p.tienGiam.toLocaleString('vi-VN')}đ`],
        ['Tiền đặt cọc đã trả', `${o.tienDatCoc.toLocaleString('vi-VN')}đ`],
      ],
      foot: [
        ['TỔNG THANH TOÁN (SAU GIẢM)', `${p.chiPhiSauGiam.toLocaleString('vi-VN')}đ`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [86, 124, 2], font: 'Roboto', fontStyle: 'bold' },
      footStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold', font: 'Roboto' },
      styles: { font: 'Roboto', fontSize: 10 },
      columnStyles: {
        1: { halign: 'right' }
      }
    });
    
    // Footer
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(10);
    doc.text('Cảm ơn quý khách đã sử dụng dịch vụ của EcoMove!', 105, (doc as any).lastAutoTable.finalY + 15, { align: 'center' });

    doc.save(`ThanhToan-${o.maDonThue}.pdf`);
  }


  // --- Các hàm điều hướng và popup (Không đổi) ---

  goBack() {
    this.location.back();
  }

  saveChanges() {
    // Sửa lỗi typo "hủy" -> "huỷ" nếu cần
    this.orderStatuses = this.orderStatuses.map(s => s === 'Đã hủy' ? 'Đã huỷ' : s);
    
    this.showConfirmPopup = true;
  }

  onCancelSave() {
    this.showConfirmPopup = false;
  }

  onConfirmSave() {
    this.showConfirmPopup = false;
    this.isLoading = true;
    this.cdr.detectChanges();

    console.log('Đang lưu thay đổi cho:', this.order);
    
    setTimeout(() => {
      this.isLoading = false;
      this.showSuccessPopup = true;
      this.cdr.detectChanges(); 
    }, 1000);
  }

  onCloseSuccessAndStay() {
    this.showSuccessPopup = false;
  }

  onCloseSuccessAndGoBack() {
    this.showSuccessPopup = false;
    this.goBack();
  }
}