import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  EnrollmentRequestDto, 
  EnrollmentResponseDto 
} from '../interfaces/api';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private readonly baseUrl = `${environment.apiUrl}/Enrollment`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<EnrollmentResponseDto[]> {
    return this.http.get<EnrollmentResponseDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<EnrollmentResponseDto> {
    return this.http.get<EnrollmentResponseDto>(`${this.baseUrl}/${id}`);
  }

  getByStudentId(studentId: number): Observable<EnrollmentResponseDto[]> {
    return this.http.get<EnrollmentResponseDto[]>(`${this.baseUrl}/student/${studentId}`);
  }

  create(enrollment: EnrollmentRequestDto): Observable<EnrollmentResponseDto> {
    return this.http.post<EnrollmentResponseDto>(this.baseUrl, enrollment);
  }

  update(id: number, enrollment: EnrollmentRequestDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, enrollment);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
