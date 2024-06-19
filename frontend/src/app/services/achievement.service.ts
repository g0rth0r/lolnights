import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getTotalLengthPerDay(): Observable<any> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('access_token')}` });
    return this.http.get(`${this.baseUrl}/total_length_per_day`, { headers });
  }
}
