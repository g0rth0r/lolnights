import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { VideoService } from '../../services/video.service';

@Component({
  selector: 'app-video-mosaic',
  templateUrl: './video-mosaic.component.html',
  styleUrls: ['./video-mosaic.component.css']
})
export class VideoMosaicComponent implements OnInit, AfterViewInit {
  videos: any[] = [];
  filteredVideos: any[] = [];
  searchText: string = '';
  page: number = 1;
  perPage: number = 10;
  loading: boolean = false;
  hasMoreVideos: boolean = true;
  startDate: number | null = null;
  endDate: number | null = null;

  private scrollTimeout: any;

  constructor(private videoService: VideoService) { }

  ngOnInit(): void {
    this.loadVideos();
  }

  ngAfterViewInit(): void {
    this.checkContentHeight();
  }

  onScroll(): void {
    if (!this.hasMoreVideos) return;
    this.page++;
    this.loadVideos();
  }

  loadVideos(): void {
    if (this.loading) return;
    this.loading = true;
    const params: any = { page: this.page, per_page: this.perPage };
    if (this.searchText) params.searchText = this.searchText;
    if (this.startDate !== null) params.startDate = this.startDate;
    if (this.endDate !== null) params.endDate = this.endDate;

    this.videoService.getVideos(params).subscribe(data => {
      if (this.page === 1) {
        this.videos = data;
      } else {
        this.videos = [...this.videos, ...data];
      }
      this.filteredVideos = this.videos;
      this.hasMoreVideos = data.length === this.perPage;
      this.loading = false;

      // Check content height after loading videos
      this.checkContentHeight();
    }, () => {
      this.loading = false; // Ensure loading is set to false in case of error
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        this.onScroll();
      }
    }, 200);
  }

  checkContentHeight(): void {
    if (document.body.offsetHeight < window.innerHeight && this.hasMoreVideos) {
      this.page++;
      this.loadVideos();
    }
  }

  onSearchTextChange(searchText: string): void {
    this.searchText = searchText;
    this.page = 1;
    this.videos = [];
    this.filteredVideos = [];
    this.loadVideos();
  }

  onDateRangeChange(dateRange: { startDate: number | null, endDate: number | null }): void {
    console.log('Date range change:', dateRange); // Add a debug log to check the date range being received
    this.startDate = dateRange.startDate;
    this.endDate = dateRange.endDate;
    this.page = 1;
    this.videos = [];
    this.loadVideos();
  }

  filterVideos(): void {
    const startTimestamp = this.startDate !== null ? this.startDate : null;
    const endTimestamp = this.endDate !== null ? this.endDate : null;

    this.filteredVideos = this.videos.filter(video => {
      const matchesTitle = video.title.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesDate = (!startTimestamp || video.timestamp >= startTimestamp) &&
                          (!endTimestamp || video.timestamp <= endTimestamp);
      return matchesTitle && matchesDate;
    });
  }
}
