import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {
  searchText: string = '';
  selected: { startDate: Dayjs | null, endDate: Dayjs | null } = { startDate: null, endDate: null };
  alwaysShowCalendars: boolean;
  videoDates: Dayjs[] = []; // List of dates with videos
  ranges: any = {
    'Today': [dayjs().startOf('day'), dayjs().endOf('day')],
    'Yesterday': [dayjs().subtract(1, 'days').startOf('day'), dayjs().subtract(1, 'days').endOf('day')],
    'Last 7 Days': [dayjs().subtract(6, 'days').startOf('day'), dayjs().endOf('day')],
    'Last 30 Days': [dayjs().subtract(29, 'days').startOf('day'), dayjs().endOf('day')],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')]
  };
  invalidDates: Dayjs[] = [dayjs().add(2, 'days'), dayjs().add(3, 'days'), dayjs().add(5, 'days')];

  @Output() searchTextChange = new EventEmitter<string>();
  private searchTextChanged = new Subject<string>();
  @Output() dateRangeChange = new EventEmitter<{ startDate: number | null, endDate: number | null }>();

  constructor() {
    this.alwaysShowCalendars = true;
    this.searchTextChanged.pipe(
      debounceTime(300) // Adjust the debounce time as needed
    ).subscribe(value => {
      this.searchTextChange.emit(value);
    });
  }

  ngOnInit(): void {
    // Load video dates from the backend or any other source
    this.loadVideoDates();
  }

  onSearchTextChange(value: string): void {
    this.searchTextChanged.next(value);
  }

  onDateRangeChange(): void {
    const startDate = this.selected.startDate ? this.selected.startDate.startOf('day').unix() : null;
    const endDate = this.selected.endDate ? this.selected.endDate.endOf('day').unix() : null;
    this.dateRangeChange.emit({
      startDate: startDate,
      endDate: endDate
    });
  }

  isInvalidDate = (m: Dayjs): boolean => {
    return this.invalidDates.some(d => d.isSame(m, 'day'));
  }

  isCustomDate = (m: Dayjs): string | false => {
    if (this.videoDates.some(d => d.isSame(m, 'day'))) {
      return 'has-video';
    }
    return false;
  }

  loadVideoDates(): void {
    // Replace with actual API call or data source
    // Example static dates
    this.videoDates = [
      dayjs('2024-06-10'),
      dayjs('2024-06-15'),
      dayjs('2024-06-20')
    ];
  }
}
