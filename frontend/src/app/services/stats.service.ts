import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private baseUrl = environment.apiUrl;
  private passkey = 'your_secret_passkey';

  constructor(private http: HttpClient) { }

  refreshStats(): Observable<any> {
    const headers = new HttpHeaders({ 'Passkey': this.passkey });
    return this.http.get(`${this.baseUrl}/stats/refresh`, { headers });
  }

  getStatsLogs(): Observable<any> {
    const headers = new HttpHeaders({ 'Passkey': this.passkey });
    return this.http.get(`${this.baseUrl}/stats/logs`, { headers });
  }

  getStats(statType: string): Observable<any> {
    const headers = new HttpHeaders({ 'Passkey': this.passkey });
    return this.http.get(`${this.baseUrl}/stats/${statType}`, { headers });
  }
}
