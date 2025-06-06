import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  StudentRequestDto, 
  StudentResponseDto 
} from '../interfaces/api';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly baseUrl = `${environment.apiUrl}/Student`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<StudentResponseDto[]> {
    return this.http.get<StudentResponseDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<StudentResponseDto> {
    return this.http.get<StudentResponseDto>(`${this.baseUrl}/${id}`);
  }

  create(student: StudentRequestDto): Observable<StudentResponseDto> {
    return this.http.post<StudentResponseDto>(this.baseUrl, student);
  }

  update(id: number, student: StudentRequestDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, student);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
