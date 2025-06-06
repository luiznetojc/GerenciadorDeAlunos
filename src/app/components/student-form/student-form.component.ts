import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { StudentRequestDto } from '../../interfaces/api';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss'
})
export class StudentFormComponent implements OnInit {
  studentForm: FormGroup;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private router: Router
  ) {
    this.studentForm = this.fb.group({
      registrationNumber: ['', [Validators.required, Validators.min(1)]],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      enrollmentDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Define a data de hoje como padrão
    const today = new Date().toISOString().split('T')[0];
    this.studentForm.patchValue({
      enrollmentDate: today
    });
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;

      const studentData: StudentRequestDto = {
        registrationNumber: this.studentForm.value.registrationNumber,
        fullName: this.studentForm.value.fullName,
        enrollmentDate: this.studentForm.value.enrollmentDate
      };

      this.studentService.create(studentData).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = `Aluno ${response.fullName} cadastrado com sucesso!`;
          this.studentForm.reset();
          
          // Define a data de hoje novamente após reset
          const today = new Date().toISOString().split('T')[0];
          this.studentForm.patchValue({
            enrollmentDate: today
          });

          // Redireciona para a lista de alunos após 2 segundos
          setTimeout(() => {
            this.router.navigate(['/students']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erro ao cadastrar aluno:', error);
          this.error = 'Erro ao cadastrar aluno. Verifique se o número de matrícula não está duplicado.';
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/students']);
  }

  getFieldError(fieldName: string): string | null {
    const field = this.studentForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return 'Este campo é obrigatório';
      }
      if (field.errors?.['minLength']) {
        return 'Nome deve ter pelo menos 2 caracteres';
      }
      if (field.errors?.['min']) {
        return 'Número de matrícula deve ser maior que 0';
      }
    }
    return null;
  }
}
