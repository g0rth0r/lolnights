import { Component } from '@angular/core';
import { VideoService } from '../../../services/video.service';

@Component({
  selector: 'app-add-video',
  templateUrl: './add-video.component.html',
  styleUrls: ['./add-video.component.css']
})
export class AddVideoComponent {
  videoUrl: string = '';
  loading: boolean = false;
  logs: string = ''; // Variable to store logs
  videoId: string | null = null; // Store the video ID
  errorMessage: string = ''; // Variable to store error message

  constructor(private videoService: VideoService) { }

  onSubmit(): void {
    this.errorMessage = '';
    this.videoId = this.extractVideoId(this.videoUrl);

    if (!this.videoId) {
      this.errorMessage = 'Invalid YouTube URL. Please provide a valid URL.';
      return;
    }

    this.loading = true;
    this.logs = 'Starting the process...\n'; // Initialize logs

    this.videoService.addVideo({ url: this.videoUrl }).subscribe(response => {
      if (response.error) {
        this.errorMessage = response.error;
        this.loading = false;
        return;
      }
      this.pollLogs();
    }, error => {
      this.logs += 'Error adding video. Please try again.\n';
      this.loading = false;
    });
  }

  extractVideoId(url: string): string | null {
    const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([^\?&#]+)/;
    const match = url.match(regex);
    if (match) {
      return match[1].split('&')[0]; // Extract video ID before '&'
    }
    return null;
  }

  pollLogs(): void {
    if (this.videoId === null) return;

    this.videoService.getVideoLogs(this.videoId).subscribe(response => {
      this.logs = response.logs.join('');
      if (!this.logs.includes('Video processing complete.')) {
        setTimeout(() => this.pollLogs(), 2000); // Poll every 2 seconds
      } else {
        this.loading = false;
        this.videoUrl = '';
      }
    });
  }
}
