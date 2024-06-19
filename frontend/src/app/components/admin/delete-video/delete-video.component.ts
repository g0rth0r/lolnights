import { Component, OnInit } from '@angular/core';
import { VideoService } from '../../../services/video.service';
import { ToastrService } from 'ngx-toastr'; // For displaying toast notifications

@Component({
  selector: 'app-delete-video',
  templateUrl: './delete-video.component.html',
  styleUrls: ['./delete-video.component.css']
})
export class DeleteVideoComponent implements OnInit {
  videos: any[] = [];
  page: number = 1;
  perPage: number = 10;
  hasMoreVideos: boolean = true;
  loading: boolean = false; // Add a loading flag
  searchText: string = ''; // Add a search text property

  constructor(
    private videoService: VideoService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos(): void {
    this.loading = true;
    const params: any = { page: this.page, per_page: this.perPage };
    if (this.searchText) {
      params.searchText = this.searchText;
    }
    this.videoService.getVideos(params).subscribe(data => {
      this.videos = data;
      this.hasMoreVideos = data.length === this.perPage;
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  deleteVideo(videoId: number): void {
    this.loading = true;
    this.videoService.deleteVideo(videoId).subscribe(response => {
      this.toastr.success('Video deleted successfully!');
      this.loadVideos();
    }, error => {
      this.toastr.error('Error deleting video. Please try again.');
      this.loading = false;
    });
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadVideos();
    }
  }

  nextPage(): void {
    if (this.hasMoreVideos) {
      this.page++;
      this.loadVideos();
    }
  }

  onSearchTextChange(searchText: string): void {
    this.page = 1;
    this.loadVideos();
  }
}
