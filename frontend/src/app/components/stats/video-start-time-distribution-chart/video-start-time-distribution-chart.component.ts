import { Component, OnInit } from '@angular/core';
import { StatsService } from '../../../services/stats.service';
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-video-start-time-distribution-chart',
  templateUrl: './video-start-time-distribution-chart.component.html',
  styleUrls: ['./video-start-time-distribution-chart.component.css']
})
export class VideoStartTimeDistributionChartComponent implements OnInit {
  videoStartTimeDistribution: any[] = [];
  view: [number, number] = [700, 400];
  loading: boolean = true; // Add loading state
  colorScheme : Color ={
    name: 'nightLights',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#C7B42C', '#1f77b4']
  };

  constructor(private statsService: StatsService) { }

  ngOnInit(): void {
    this.fetchVideoStartTimeDistribution();
  }

  fetchVideoStartTimeDistribution(): void {
    this.statsService.getStats('video_start_time_distribution').subscribe(response => {
      const filteredData = response.data.filter((item: any) => {
        const hour = parseInt(item.time_bin.split(':')[0], 10);
        return (hour >= 21 || hour < 3);
      });

      // Sort data to ensure 21:00 to 03:00 order
      const sortedData = [
        ...filteredData.filter((item: any) => parseInt(item.time_bin.split(':')[0], 10) >= 20),
        ...filteredData.filter((item: any) => parseInt(item.time_bin.split(':')[0], 10) < 3)
      ];

      this.videoStartTimeDistribution = sortedData.map((item: any) => ({
        name: item.time_bin,
        value: item.count
      }));
      this.loading = false; // Set loading to false when data is loaded
    });
  }
}
