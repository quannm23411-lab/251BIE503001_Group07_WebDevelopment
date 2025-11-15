import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { FormsModule } from '@angular/forms'; // <-- THÊM MỚI

import {
  Chart,
  LineController, BarController, DoughnutController,
  ArcElement, LineElement, PointElement, BarElement,
  CategoryScale, LinearScale,
  Legend, Tooltip
} from 'chart.js';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    FormsModule // <-- THÊM MỚI
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  isLoading: boolean = true;
  
  // Dữ liệu gốc
  private allOrders: any[] = [];
  private productsMap = new Map<string, any>();

  // Biến state cho 4 thẻ
  stats = {
    totalRevenue: 0,
    totalOrders: 0,
    activeRentals: 0,
    uniqueCustomers: 0
  };

  // Biến state cho bảng
  recentOrders: any[] = [];
  
  // Biến state cho danh sách top xe
  topVehicles: any[] = [];

  // === BIẾN STATE MỚI CHO BỘ LỌC ===
  public revenueView: 'daily' | 'weekly' | 'monthly' = 'daily';
  public filterStartDate: string = ''; // Sẽ được gán trong ngOnInit
  public filterEndDate: string = '';   // Sẽ được gán trong ngOnInit

  // Biểu đồ 1: Doanh thu (Line)
  public lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {},
      y: { type: 'linear', display: true, position: 'left', min: 0 },
      y1: {
        type: 'linear', display: true, position: 'right',
        grid: { drawOnChartArea: false },
        min: 0,
        ticks: { stepSize: 1 }
      }
    },
    plugins: { legend: { display: true } }
  };
  public lineChartType: ChartType = 'line';

  // Biểu đồ 2: Trạng thái (Donut)
  public donutChartData: ChartData<'doughnut'> = { labels: ['...'], datasets: [{ data: [1] }] };
  public donutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top' } },
    // cutout: '70%'
  };
  public donutChartType: ChartType = 'doughnut';

  // Biểu đồ 3: Top xe (Bar)
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: {}, y: {} },
    plugins: { legend: { display: false } }
  };
  public barChartType: ChartType = 'bar';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { 
    // Đăng ký tất cả components của Chart.js
    Chart.register(
      LineController, BarController, DoughnutController,
      ArcElement, LineElement, PointElement, BarElement,
      CategoryScale, LinearScale,
      Legend, Tooltip
    );
  }

  ngOnInit() {
    this.isLoading = true;
    
    const orders$ = this.http.get<any[]>('assets/data/orders.json');
    const products$ = this.http.get<any[]>('assets/data/products.json');

    forkJoin([orders$, products$]).subscribe({
      next: ([ordersData, productsData]) => {
        // Lưu dữ liệu gốc
        this.allOrders = ordersData;
        this.productsMap = new Map(productsData.map(p => [p.id, p]));
        
        // === THÊM MỚI: Tự động gán ngày lọc ===
        if (this.allOrders.length > 0) {
          const allDates = ordersData.map(o => new Date(o.thoiGianDatHang).getTime());
          const minDate = new Date(Math.min.apply(null, allDates));
          const maxDate = new Date(Math.max.apply(null, allDates));
          
          this.filterStartDate = minDate.toISOString().split('T')[0];
          this.filterEndDate = maxDate.toISOString().split('T')[0];
        }
        // === HẾT ===

        // Chạy tất cả các hàm xử lý
        this.processStats();
        this.processRecentOrders();
        this.processTopVehiclesAndBarChart();
        this.processDonutChart();
        this.processLineChart(); // Chạy lần đầu với ngày đã gán
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải dữ liệu Dashboard', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // === HÀM ĐỔI VIEW (Ngày/Tuần/Tháng) ===
  changeRevenueView(view: 'daily' | 'weekly' | 'monthly') {
    this.revenueView = view;
    this.processLineChart(); // Chạy lại logic cho biểu đồ line
  }
  
  // === HÀM MỚI: XỬ LÝ KHI ĐỔI NGÀY ===
  onDateChange() {
    // Chỉ cần chạy lại processLineChart, nó sẽ tự đọc giá trị mới
    this.processLineChart();
  }

  // === HÀM HELPER LẤY NGÀY ĐẦU TUẦN ===
  private getWeekStartDate(date: Date): string {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Chủ Nhật, 1 = Thứ 2, ...
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lùi về Thứ 2
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0]; // Trả về "YYYY-MM-DD"
  }


  // --- Các hàm xử lý dữ liệu (không đổi, giữ nguyên) ---

  processStats() {
    const orders = this.allOrders;
    this.stats.totalRevenue = orders.reduce((sum, order) => sum + order.thanhToan.chiPhiSauGiam, 0);
    this.stats.totalOrders = orders.length;
    this.stats.activeRentals = orders.filter(o => o.tinhTrangDon === 'Đang thuê').length;
    this.stats.uniqueCustomers = new Set(orders.map(o => o.maKhachHang)).size;
  }

  processRecentOrders() {
    this.recentOrders = [...this.allOrders]
      .sort((a, b) => new Date(b.thoiGianDatHang).getTime() - new Date(a.thoiGianDatHang).getTime())
      .slice(0, 7)
      .map(order => ({
        ...order,
        tinhTrangDonClass: this.getStatusClass(order.tinhTrangDon),
        paymentStatusClass: this.getPaymentStatusClass(order.thanhToan.tinhTrangThanhToan)
      }));
  }

  processTopVehiclesAndBarChart() {
    const orders = this.allOrders;
    const vehicleCounts = new Map<string, number>();
    orders.forEach(order => {
      order.chiTietDonThue.forEach((item: any) => {
        const currentCount = vehicleCounts.get(item.idXe) || 0;
        vehicleCounts.set(item.idXe, currentCount + item.soLuong);
      });
    });

    const sortedVehicles = [...vehicleCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // 1. Cập nhật danh sách top
    this.topVehicles = sortedVehicles.map(([id, count]) => {
      return {
        product: this.productsMap.get(id) || { vehicleName: 'Xe không rõ', image: '' },
        count: count
      };
    });

    // 2. Cập nhật biểu đồ bar
    const barLabels = sortedVehicles.map(([id]) => this.productsMap.get(id)?.vehicleName || 'Không rõ');
    const barData = sortedVehicles.map(([id, count]) => count);
    this.barChartData = {
      labels: barLabels,
      datasets: [{ data: barData, label: 'Số lượt thuê', backgroundColor: '#567C02' }]
    };
  }

  processDonutChart() {
    const orders = this.allOrders;
    const statusCounts = new Map<string, number>();
    orders.forEach(order => {
      const status = order.tinhTrangDon;
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });

    const labels = Array.from(statusCounts.keys());
    const data = Array.from(statusCounts.values());
    const colors = labels.map(label => {
        switch (label) {
          case 'Đã hoàn thành': return '#90EE90';
          case 'Đã xác nhận': return '#ADD8E6';
          case 'Đang thuê': return '#FFD700';
          case 'Đã hủy': return '#F08080';
          default: return '#E0E0E0';
        }
    });

    this.donutChartData = {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        hoverBackgroundColor: colors,
        borderColor: '#fff',
        borderWidth: 2
      }]
    };
  }

  // === HÀM QUAN TRỌNG: CẬP NHẬT LOGIC LỌC ===
  processLineChart() {
    let filteredOrders = this.allOrders;

    // === 1. LỌC THEO NGÀY (MỚI) ===
    // Chỉ lọc nếu cả 2 ngày đều được chọn
    if (this.filterStartDate && this.filterEndDate) {
      filteredOrders = filteredOrders.filter(o => {
        const orderDate = o.thoiGianDatHang.split('T')[0];
        return orderDate >= this.filterStartDate && orderDate <= this.filterEndDate;
      });
    }

    const statsByTime = new Map<string, { revenue: number, count: number }>();

    // 2. Gom nhóm dữ liệu *đã lọc*
    filteredOrders.forEach(order => {
      const date = new Date(order.thoiGianDatHang);
      const revenue = order.thanhToan.chiPhiSauGiam;
      let key: string;

      if (this.revenueView === 'monthly') {
        key = date.toISOString().slice(0, 7); // "YYYY-MM"
      } else if (this.revenueView === 'weekly') {
        key = this.getWeekStartDate(date); // "YYYY-MM-DD" (của ngày Thứ 2)
      } else { // 'daily'
        key = date.toISOString().split('T')[0]; // "YYYY-MM-DD"
      }

      const currentStats = statsByTime.get(key) || { revenue: 0, count: 0 };
      currentStats.revenue += revenue;
      currentStats.count += 1;
      statsByTime.set(key, currentStats);
    });

    let sortedStats: [string, { revenue: number, count: number }][];

    // 3. Xử lý "điền vào chỗ trống" (chỉ cho view 'daily')
    if (this.revenueView === 'daily') {
        const completeStats = new Map<string, { revenue: number, count: number }>();
        
        // Chỉ điền vào chỗ trống nếu ngày hợp lệ
        if (this.filterStartDate && this.filterEndDate) {
          let currentDate = new Date(this.filterStartDate + 'T00:00:00');
          const endDate = new Date(this.filterEndDate + 'T00:00:00');

          while (currentDate <= endDate) {
              const dateKey = currentDate.toISOString().split('T')[0];
              const existingData = statsByTime.get(dateKey);
              
              if (existingData) {
                  completeStats.set(dateKey, existingData);
              } else {
                  completeStats.set(dateKey, { revenue: 0, count: 0 }); // Thêm ngày rỗng
              }
              currentDate.setDate(currentDate.getDate() + 1);
          }
        }
        sortedStats = [...completeStats.entries()].sort();

    } else {
        // Đối với 'weekly' và 'monthly', chỉ cần sắp xếp map đã gom nhóm
        sortedStats = [...statsByTime.entries()].sort();
    }
    
    // 4. Tách mảng
    const lineLabels = sortedStats.map(([key]) => key);
    const revenueData = sortedStats.map(([key, stats]) => stats.revenue);
    const countData = sortedStats.map(([key, stats]) => stats.count);

    // 5. Cập nhật biểu đồ
    this.lineChartData = {
      labels: lineLabels,
      datasets: [
        { 
          data: revenueData,
          label: 'Doanh thu (VND)',
          yAxisID: 'y',
          tension: 0.2, 
          backgroundColor: 'rgba(69, 184, 128, 0.1)', 
          borderColor: '#45B880', 
          fill: true 
        },
        { 
          data: countData,
          label: 'Số lượng đơn', 
          yAxisID: 'y1',
          tension: 0.2, 
          backgroundColor: 'rgba(255, 159, 64, 0.1)',
          borderColor: '#FF9F40', 
          fill: true 
        }
      ]
    };
  }


  // --- Các hàm Helper (không đổi) ---
  getStatusClass(status: string): string {
    switch (status) {
      case 'Đã hoàn thành': return 'completed';
      case 'Đang thuê': return 'rented';
      case 'Đã xác nhận': return 'confirmed';
      case 'Đã hủy': return 'cancelled';
      default: return '';
    }
  }

  getPaymentStatusClass(status: string): any {
    switch (status) {
      case 'Đã thanh toán': return 'paid';
      case 'Chờ thanh toán': return 'pending';
      default: 'pending';
    }
  }

  // --- Các hàm điều hướng (không đổi) ---
  goToOrder(orderId: string) {
    this.router.navigate(['/admin/order-detail', orderId]);
  }
  goToBike(bikeId: string) {
    this.router.navigate(['/admin/bike-detail', bikeId]);
  }
  goToAllOrders() {
    this.router.navigate(['/admin/order']);
  }
}