import { Component, OnInit } from '@angular/core';
import { StatsService } from '../../../services/stats.service';
import { min } from 'moment';
import { Router } from '@angular/router';


@Component({
  selector: 'app-top-ten-duration-chart',
  templateUrl: './top-ten-duration-chart.component.html',
  styleUrls: ['./top-ten-duration-chart.component.css']
})
export class TopTenDurationChartComponent implements OnInit {
  topTenVideos: any[] = [];
  view: [number, number] = [700, 400];

  constructor(private statsService: StatsService, private router: Router) { }

  ngOnInit(): void {
    this.fetchTopTenLongestVideos();
  }

  fetchTopTenLongestVideos(): void {
    this.statsService.getStats('top_10_longest_videos').subscribe(response => {
      this.topTenVideos = response.data.map((video: any, index: number) => ({
        name: `${index + 1}. ${video.title}`,
        value: this.formatDuration(video.length), // Precompute formatted duration
        id: video.id // Include the video id
      }));
    });
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  onSelect(event: any): void {
    const selectedVideo = this.topTenVideos.find(video => video.name === event.name);
    if (selectedVideo) {
      this.router.navigate(['/video', selectedVideo.id]);
    }
  }
}
