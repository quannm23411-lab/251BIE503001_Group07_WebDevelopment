import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

// ✅ Import thư viện Chart.js (đã cài bằng npm install chart.js)
import Chart from 'chart.js/auto';

// ✅ Khai báo interface dữ liệu nhận từ dashboard.json
interface DashboardData {
  carsRented: number;
  carsTotal: number;
  ordersToday: number;
  revenue: number;
  newUsers: number;
  alerts: string[];
  months: string[];
  revenueData: number[];
}

@Component({
  selector: 'app-admin-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-main.html',
  styleUrl: './admin-main.css'
})
export class AdminMain implements OnInit {
  @ViewChild('revenueChartCanvas') chartRef!: ElementRef<HTMLCanvasElement>;

  data!: DashboardData;
  revenueChart: any;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    // ✅ Đọc file JSON từ thư mục assets/data/
    this.http.get<DashboardData>('assets/data/dashboard.json').subscribe({
      next: (data) => {
        this.data = data;
        this.renderChart(); // Sau khi có data → vẽ biểu đồ
      },
      error: () => console.error('❌ Không thể tải dữ liệu Dashboard.')
    });
  }

  renderChart() {
    if (!this.data) return;
    const ctx = this.chartRef.nativeElement;

    // Xóa biểu đồ cũ nếu tồn tại (tránh lỗi)
    if (this.revenueChart) {
      this.revenueChart.destroy();
    }

    // ✅ Khởi tạo biểu đồ mới
    this.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.data.months,
        datasets: [
          {
            label: 'Doanh thu (triệu VNĐ)',
            data: this.data.revenueData,
            borderColor: '#6fa304',
            backgroundColor: 'rgba(111, 163, 4, 0.15)',
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#6fa304'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'bottom' },
          tooltip: { enabled: true }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#444' } },
          y: {
            beginAtZero: true,
            ticks: { color: '#444' },
            grid: { color: '#eee' }
          }
        }
      }
    });
  }
}
