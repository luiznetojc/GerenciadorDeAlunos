import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  DisciplineRequestDto, 
  DisciplineResponseDto 
} from '../interfaces/api';

@Injectable({
  providedIn: 'root'
})
export class DisciplineService {
  private readonly baseUrl = `${environment.apiUrl}/Discipline`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<DisciplineResponseDto[]> {
    return this.http.get<DisciplineResponseDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<DisciplineResponseDto> {
    return this.http.get<DisciplineResponseDto>(`${this.baseUrl}/${id}`);
  }

  create(discipline: DisciplineRequestDto): Observable<DisciplineResponseDto> {
    return this.http.post<DisciplineResponseDto>(this.baseUrl, discipline);
  }

  update(id: number, discipline: DisciplineRequestDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, discipline);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
