// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideoMosaicComponent } from './components/video-mosaic/video-mosaic.component';
import { VideoDetailComponent } from './components/video-detail/video-detail.component';
import { StatsComponent } from './components/stats/stats.component';
import { AdminComponent } from './components/admin/admin.component';
import { AddVideoComponent } from './components/admin/add-video/add-video.component';
import { DeleteVideoComponent } from './components/admin/delete-video/delete-video.component';
import { AdminStatsComponent } from './components/admin/admin-stats/admin-stats.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: VideoMosaicComponent, canActivate: [AuthGuard] },
  { path: 'video/:id', component: VideoDetailComponent, canActivate: [AuthGuard] },
  { path: 'stats', component: StatsComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard], children: [
    { path: 'add-video', component: AddVideoComponent },
    { path: 'delete-video', component: DeleteVideoComponent },
    { path: 'stats', component: AdminStatsComponent }
  ]},
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
