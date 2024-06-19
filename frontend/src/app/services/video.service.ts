import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';  // Import AuthService
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private baseUrl = environment.apiUrl;
  private passkey = 'your_secret_passkey';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getVideos(params: any): Observable<any> {
    const headers = new HttpHeaders({ 'Passkey': this.passkey });
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get(`${this.baseUrl}/videos`, { headers, params: httpParams });
  }

  getVideoDetails(id: string): Observable<any> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
    return this.http.get(`${this.baseUrl}/videos/${id}`, { headers });
  }

  saveAttributes(videoId: number, attributes: any): Observable<any> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('access_token')}` });
    return this.http.post(`${this.baseUrl}/videos/${videoId}/attributes`, { attributes }, { headers });
  }

  addVideo(video: { url: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Passkey': this.passkey });
    return this.http.post(`${this.baseUrl}/videos`, video, { headers });
  }

  getVideoLogs(videoId: string): Observable<any> {
    const headers = new HttpHeaders({ 'Passkey': this.passkey });
    return this.http.get(`${this.baseUrl}/videos/${videoId}/logs`, { headers });
  }

  deleteVideo(videoId: number): Observable<any> {
    const headers = new HttpHeaders({ 'Passkey': this.passkey });
    return this.http.delete(`${this.baseUrl}/videos/${videoId}`, { headers });
  }

  // src/app/services/video.service.ts
getUserAttributes(): Observable<any> {
  const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
  return this.http.get(`${this.baseUrl}/config/user-attributes`, { headers });
}

}
