import { Component, OnInit } from '@angular/core';
import { StatsService } from '../../../services/stats.service';
import { CommonModule } from '@angular/common'; // Import CommonModule


@Component({
  selector: 'app-stats',
  templateUrl: './admin-stats.component.html',
  styleUrls: ['./admin-stats.component.css']
})
export class AdminStatsComponent implements OnInit {
  loading: boolean = false;
  logs: string = ''; // Variable to store logs
  refreshMessage: string = ''; // Variable to store the refresh message

  constructor(private statsService: StatsService) { }

  ngOnInit(): void {
    this.fetchLogs();
  }

  refreshStats(): void {
    this.loading = true;
    this.statsService.refreshStats().subscribe(response => {
      this.refreshMessage = 'Statistics database refresh in progress.';
      this.fetchLogs();
      this.loading = false;
    }, error => {
      this.refreshMessage = 'Error refreshing stats. Please try again.';
      this.loading = false;
    });
  }

  fetchLogs(): void {
    this.statsService.getStatsLogs().subscribe(response => {
      this.logs = response.logs.map((line: string) => line.trim()).join('\n');
    });
  }
}
