import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MonthlyPaymentResponse, MonthlyPaymentSummary } from '../interfaces/billing';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MonthlyBillingService {
  private readonly apiUrl = `${environment.apiUrl}/api/MonthlyBilling`;

  constructor(private http: HttpClient) {}

  /**
   * Gera débitos mensais para todos os alunos
   */
  generateMonthlyBillings(year: number, month: number): Observable<{generatedCount: number, message: string}> {
    return this.http.post<{generatedCount: number, message: string}>(`${this.apiUrl}/generate/${year}/${month}`, {});
  }

  /**
   * Gera débito mensal para um aluno específico
   */
  generateMonthlyBillingForStudent(studentId: number, year: number, month: number): Observable<MonthlyPaymentResponse> {
    return this.http.post<MonthlyPaymentResponse>(`${this.apiUrl}/generate/student/${studentId}/${year}/${month}`, {});
  }

  /**
   * Gera débitos para o mês atual
   */
  generateCurrentMonthBillings(): Observable<{generatedCount: number, message: string}> {
    return this.http.post<{generatedCount: number, message: string}>(`${this.apiUrl}/generate-current-month`, {});
  }

  /**
   * Obtém resumo de débitos por aluno
   */
  getDebtSummary(): Observable<MonthlyPaymentSummary[]> {
    return this.http.get<MonthlyPaymentSummary[]>(`${this.apiUrl}/debt-summary`);
  }

  /**
   * Obtém débitos em atraso
   */
  getOverduePayments(): Observable<MonthlyPaymentResponse[]> {
    return this.http.get<MonthlyPaymentResponse[]>(`${this.apiUrl}/overdue`);
  }
}
