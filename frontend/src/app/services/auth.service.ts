// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, ReplaySubject, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private loggedIn = new BehaviorSubject<boolean>(false);
  private username = new BehaviorSubject<string>(this.getUsername());
  private tokenValiditySubject = new ReplaySubject<boolean>(1);

  constructor(private http: HttpClient, private router: Router) {
    this.checkTokenValidity().subscribe();
  }

  login(username: string, password: string): Observable<any> {
    return new Observable(observer => {
      this.http.post<any>(`${this.baseUrl}/login`, { username, password }).subscribe(
        response => {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('username', username);
          this.loggedIn.next(true);
          this.username.next(username);
          this.tokenValiditySubject.next(true); // Update token validity
          observer.next(response);
          observer.complete();
        },
        error => {
          observer.error(error);
        }
      );
    });
  }

  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  getLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  getUsernameObservable(): Observable<string> {
    return this.username.asObservable();
  }

  logout(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.http.post(`${this.baseUrl}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('username');
        this.loggedIn.next(false);
        this.username.next('');
        this.tokenValiditySubject.next(false); // Update token validity
        this.router.navigate(['/login']);
      });
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('username');
      this.loggedIn.next(false);
      this.username.next('');
      this.tokenValiditySubject.next(false); // Update token validity
      this.router.navigate(['/login']);
    }
  }

  checkTokenValidity(): Observable<boolean> {
    const token = localStorage.getItem('access_token');
    if (token) {
      return this.http.get(`${this.baseUrl}/verify_token`, {
        headers: { Authorization: `Bearer ${token}` }
      }).pipe(
        tap(response => this.loggedIn.next(true)),
        tap(response => this.tokenValiditySubject.next(true)),
        map(() => true),
        catchError(error => {
          this.loggedIn.next(false);
          localStorage.removeItem('access_token');
          localStorage.removeItem('username');
          this.tokenValiditySubject.next(false); // Update token validity
          this.router.navigate(['/login']);
          return of(false);
        })
      );
    } else {
      this.loggedIn.next(false);
      this.tokenValiditySubject.next(false); // Update token validity
      return of(false);
    }
  }

  getTokenValidity(): Observable<boolean> {
    return this.tokenValiditySubject.asObservable();
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
