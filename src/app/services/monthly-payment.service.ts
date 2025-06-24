import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  MonthlyPaymentRequestDto, 
  MonthlyPaymentResponseDto 
} from '../interfaces/api';

@Injectable({
  providedIn: 'root'
})
export class MonthlyPaymentService {
  private readonly baseUrl = `${environment.apiUrl}/MonthlyPayment`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<MonthlyPaymentResponseDto[]> {
    return this.http.get<MonthlyPaymentResponseDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<MonthlyPaymentResponseDto> {
    return this.http.get<MonthlyPaymentResponseDto>(`${this.baseUrl}/${id}`);
  }

  getByStudentId(studentId: number): Observable<MonthlyPaymentResponseDto[]> {
    return this.http.get<MonthlyPaymentResponseDto[]>(`${this.baseUrl}/student/${studentId}`);
  }

  getByStudentAndMonth(studentId: number, year: number, month: number): Observable<MonthlyPaymentResponseDto> {
    return this.http.get<MonthlyPaymentResponseDto>(`${this.baseUrl}/student/${studentId}/month/${year}/${month}`);
  }

  create(payment: MonthlyPaymentRequestDto): Observable<MonthlyPaymentResponseDto> {
    return this.http.post<MonthlyPaymentResponseDto>(this.baseUrl, payment);
  }

  update(id: number, payment: MonthlyPaymentRequestDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payment);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  markAsPaid(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/mark-paid`, {});
  }
}
