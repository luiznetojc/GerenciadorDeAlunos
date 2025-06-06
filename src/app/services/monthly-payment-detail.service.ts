import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  MonthlyPaymentDetailRequestDto, 
  MonthlyPaymentDetailResponseDto 
} from '../interfaces/api';

@Injectable({
  providedIn: 'root'
})
export class MonthlyPaymentDetailService {
  private readonly baseUrl = `${environment.apiUrl}/MonthlyPaymentDetail`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<MonthlyPaymentDetailResponseDto[]> {
    return this.http.get<MonthlyPaymentDetailResponseDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<MonthlyPaymentDetailResponseDto> {
    return this.http.get<MonthlyPaymentDetailResponseDto>(`${this.baseUrl}/${id}`);
  }

  getByMonthlyPaymentId(monthlyPaymentId: number): Observable<MonthlyPaymentDetailResponseDto[]> {
    return this.http.get<MonthlyPaymentDetailResponseDto[]>(`${this.baseUrl}/payment/${monthlyPaymentId}`);
  }

  create(detail: MonthlyPaymentDetailRequestDto): Observable<MonthlyPaymentDetailResponseDto> {
    return this.http.post<MonthlyPaymentDetailResponseDto>(this.baseUrl, detail);
  }

  update(id: number, detail: MonthlyPaymentDetailRequestDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, detail);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
