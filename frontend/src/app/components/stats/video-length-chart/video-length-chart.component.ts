import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { StatsService } from '../../../services/stats.service';
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-video-length-chart',
  templateUrl: './video-length-chart.component.html',
  styleUrls: ['./video-length-chart.component.css'],
changeDetection: ChangeDetectionStrategy.OnPush

})
export class VideoLengthChartComponent implements OnInit {
  videoLengthData: any[] = [];
  totalLengthPerDay: any[] = [];
  rollingAvgLengthPerDay: any[] = [];
  colorScheme : Color ={
    name: 'nightLights',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#C7B42C', '#1f77b4']
  };
  view: [number, number] = [700, 400];

  constructor(private statsService: StatsService) { }

  ngOnInit(): void {
    this.fetchVideoLengthStats();
  }

  fetchVideoLengthStats(): void {
    const totalLengthSeries: any[] = [];
    const rollingAvgSeries: any[] = [];
    const overallAvgSeries: any[] = [];

    this.statsService.getStats('total_length_per_day').subscribe(response => {
      const totalLengthData = Object.entries(response.data)
        .slice(-365) // Limit to the last 365 entries
        .map(([key, value]) => ({
          name: key,
          value: (value as number) / 60 // Convert to minutes
        }));

      const totalLengthSum = totalLengthData.reduce((sum, entry) => sum + entry.value, 0);
      const overallAverage = totalLengthSum / totalLengthData.length;

      totalLengthSeries.push({
        name: 'Total Length per Day',
        series: totalLengthData
      });

      overallAvgSeries.push({
        name: 'Overall Average Length',
        series: totalLengthData.map(entry => ({
          name: entry.name,
          value: overallAverage
        }))
      });

      this.updateVideoLengthData(totalLengthSeries, rollingAvgSeries, overallAvgSeries);
    });

    this.statsService.getStats('rolling_avg_length_per_day').subscribe(response => {
      rollingAvgSeries.push({
        name: 'Rolling Average Length per Day',
        series: Object.entries(response.data)
          .slice(-365) // Limit to the last 365 entries
          .map(([key, value]) => ({
            name: key,
            value: (value as number) / 60 // Convert to minutes
          }))
      });

      this.updateVideoLengthData(totalLengthSeries, rollingAvgSeries, overallAvgSeries);
    });
  }

  updateVideoLengthData(totalLengthSeries: any[], rollingAvgSeries: any[], overallAvgSeries: any[]): void {
    if (totalLengthSeries.length && rollingAvgSeries.length && overallAvgSeries.length) {
      this.videoLengthData = [...totalLengthSeries, ...rollingAvgSeries, ...overallAvgSeries];
    }
  }
}
