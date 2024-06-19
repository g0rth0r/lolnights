import { Component, OnInit } from '@angular/core';
import { StatsService } from '../../../services/stats.service';
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-video-day-distribution-chart',
  templateUrl: './video-day-distribution-chart.component.html',
  styleUrls: ['./video-day-distribution-chart.component.css']
})
export class VideoDayDistributionChartComponent implements OnInit {
  data: any[] = [];
  view: [number, number] = [700, 400];
  colorScheme: Color = {
    name: 'nightLights',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA', '#a8385d', '#7aa3e5', '#a27ea8']
  };

  dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.fetchDayDistribution();
  }

fetchDayDistribution(): void {
    this.statsService.getStats('videos_per_day_of_week').subscribe(response => {
      this.data = Object.entries(response.data)
        .map(([key, value]) => ({
          name: key,
          value: value as number
        }))
        .sort((a, b) => this.dayOrder.indexOf(a.name) - this.dayOrder.indexOf(b.name)); // Sort by day order
    });
  }
}

