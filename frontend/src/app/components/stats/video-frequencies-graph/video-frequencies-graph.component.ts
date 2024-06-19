// src/app/components/stats/video-frequencies-graph/video-frequencies-graph.component.ts
import { Component, OnInit } from '@angular/core';
import { StatsService } from '../../../services/stats.service';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import moment from 'moment';

@Component({
  selector: 'app-video-frequencies-graph',
  templateUrl: './video-frequencies-graph.component.html',
  styleUrls: ['./video-frequencies-graph.component.css']
})
export class VideoFrequenciesGraphComponent implements OnInit {
  videoFrequencies: any[] = [];
  view: [number, number] = [700, 400];
  gradient: boolean = false;
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  showLegend: boolean = false;
  showXAxisLabel: boolean = true;
  showYAxisLabel: boolean = true;
  xAxisLabel: string = 'Month-Year';
  yAxisLabel: string = 'Lolnights';
  colorScheme : Color ={
    name: 'nightLights',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#4e4c4a', '#6b6b47', '#8f8f41', '#b4b440', '#d6d648',
      '#d49d26', '#cc7425', '#a24b2d', '#693c36', '#3b3c3f',
      '#4e5568', '#71778c'
    ]
  };

  constructor(private statsService: StatsService) { }

  ngOnInit(): void {
    this.fetchVideoFrequencies();
  }

  fetchVideoFrequencies(): void {
    this.statsService.getStats('video_frequencies').subscribe(response => {
      this.videoFrequencies = Object.entries(response.data).map(([key, value]) => ({
        name: this.formatMonthYear(key),
        value: value as number
      }));
    });
  }

  formatMonthYear(dateStr: string): string {
    return moment(dateStr, 'YYYY-MM').format('MMMM YY');
  }
}
