// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VideoMosaicComponent } from './components/video-mosaic/video-mosaic.component';
import { VideoDetailComponent } from './components/video-detail/video-detail.component';
import { VideoService } from './services/video.service';
import { StatsService } from './services/stats.service';
import { AuthService } from './services/auth.service';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { StatsComponent } from './components/stats/stats.component';
import { AdminComponent } from './components/admin/admin.component';
import { AddVideoComponent } from './components/admin/add-video/add-video.component';
import { DeleteVideoComponent } from './components/admin/delete-video/delete-video.component';
import { AdminStatsComponent } from './components/admin/admin-stats/admin-stats.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { VideoFrequenciesGraphComponent } from './components/stats/video-frequencies-graph/video-frequencies-graph.component';
import { VideoLengthChartComponent } from './components/stats/video-length-chart/video-length-chart.component';
import { VideoDayDistributionChartComponent } from './components/stats/video-day-distribution-chart/video-day-distribution-chart.component';
import { TopTenDurationChartComponent } from './components/stats/top-ten-duration-chart/top-ten-duration-chart.component';
import { VideoStartTimeDistributionChartComponent } from './components/stats/video-start-time-distribution-chart/video-start-time-distribution-chart.component';
import { LoginComponent } from './components/login/login.component';
import { AuthInterceptor } from './interceptors/auth.interceptor'; // Import AuthInterceptor
import { AuthGuard } from './guards/auth.guard';
import { NavigationComponent } from './components/navigation/navigation.component';
import { AchievementShowcaseComponent } from './components/achievement-showcase/achievement-showcase.component'; // Add this import


@NgModule({
  declarations: [
    AppComponent,
    VideoMosaicComponent,
    VideoDetailComponent,
    SafeUrlPipe,
    SearchBarComponent,
    StatsComponent,
    AdminComponent,
    AdminStatsComponent,
    AddVideoComponent,
    DeleteVideoComponent,
    VideoFrequenciesGraphComponent,
    VideoLengthChartComponent,
    VideoDayDistributionChartComponent,
    TopTenDurationChartComponent,
    VideoStartTimeDistributionChartComponent,
    LoginComponent,
    NavigationComponent,
    AchievementShowcaseComponent 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgxDaterangepickerMd.forRoot(),
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    NgxChartsModule
  ],
  providers: [
    VideoService,
    StatsService,
    AuthGuard,
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // Register AuthInterceptor
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
