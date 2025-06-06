import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DisciplineService } from '../../services/discipline.service';
import { DisciplineRequestDto } from '../../interfaces/api';

@Component({
  selector: 'app-discipline-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './discipline-form.component.html',
  styleUrl: './discipline-form.component.scss'
})
export class DisciplineFormComponent implements OnInit {
  disciplineForm: FormGroup;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private disciplineService: DisciplineService,
    private router: Router
  ) {
    this.disciplineForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      basePrice: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    // Inicialização adicional se necessário
  }

  onSubmit(): void {
    if (this.disciplineForm.valid) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;

      const disciplineData: DisciplineRequestDto = {
        name: this.disciplineForm.value.name,
        basePrice: parseFloat(this.disciplineForm.value.basePrice)
      };

      this.disciplineService.create(disciplineData).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = `Disciplina ${response.name} cadastrada com sucesso!`;
          this.disciplineForm.reset();

          // Redireciona para a lista de alunos após 2 segundos
          setTimeout(() => {
            this.router.navigate(['/students']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erro ao cadastrar disciplina:', error);
          this.error = 'Erro ao cadastrar disciplina. Verifique se o nome da disciplina não está duplicado.';
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/students']);
  }

  formatCurrency(event: any): void {
    let value = event.target.value.replace(/[^\d]/g, '');
    if (value) {
      value = (parseInt(value) / 100).toFixed(2);
      this.disciplineForm.patchValue({
        basePrice: value
      });
    }
  }

  getFieldError(fieldName: string): string | null {
    const field = this.disciplineForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return 'Este campo é obrigatório';
      }
      if (field.errors?.['minLength']) {
        return 'Nome deve ter pelo menos 2 caracteres';
      }
      if (field.errors?.['min']) {
        return 'Preço deve ser maior que 0';
      }
    }
    return null;
  }
}
