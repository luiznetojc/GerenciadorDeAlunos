import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentForTable } from '../../interfaces/student';
import { DisciplineResponseDto, EnrollmentRequestDto, EnrollmentResponseDto } from '../../interfaces/api';
import { DisciplineService } from '../../services/discipline.service';
import { EnrollmentService } from '../../services/enrollment.service';

interface StudentDiscipline {
  enrollmentId: number;
  disciplineId: number;
  disciplineName: string;
  monthlyPrice: number;
  enrollmentDate: string;
}

@Component({
  selector: 'app-student-disciplines-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './student-disciplines-panel.component.html',
  styleUrl: './student-disciplines-panel.component.scss'
})
export class StudentDisciplinesPanelComponent implements OnInit, OnChanges {
  @Input() student: StudentForTable | null = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() disciplinesUpdated = new EventEmitter<void>();

  studentDisciplines: StudentDiscipline[] = [];
  availableDisciplines: DisciplineResponseDto[] = [];
  loading = false;
  error: string | null = null;
  
  addDisciplineForm: FormGroup;
  showAddForm = false;
  savingDiscipline = false;

  constructor(
    private disciplineService: DisciplineService,
    private enrollmentService: EnrollmentService,
    private fb: FormBuilder
  ) {
    this.addDisciplineForm = this.fb.group({
      disciplineId: ['', [Validators.required]],
      monthlyPrice: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.loadAvailableDisciplines();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['student'] && this.student) {
      this.loadStudentDisciplines();
    }
    if (changes['isVisible'] && this.isVisible) {
      this.loadAvailableDisciplines();
      if (this.student) {
        this.loadStudentDisciplines();
      }
    }
  }

  loadStudentDisciplines(): void {
    if (!this.student) return;

    this.loading = true;
    this.error = null;

    this.enrollmentService.getByStudentId(this.student.id).subscribe({
      next: (enrollments) => {
        // Converter matrículas para o formato do painel
        this.studentDisciplines = this.student!.subjects.map(subject => ({
          enrollmentId: 0, // Precisaríamos buscar isso da API ou adicionar aos dados
          disciplineId: subject.disciplineId,
          disciplineName: subject.name,
          monthlyPrice: subject.monthlyPayment,
          enrollmentDate: this.student!.enrollmentDate
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar disciplinas do aluno:', error);
        this.error = 'Erro ao carregar disciplinas do aluno';
        this.loading = false;
        // Usar dados do student como fallback
        this.studentDisciplines = this.student!.subjects.map(subject => ({
          enrollmentId: 0,
          disciplineId: subject.disciplineId,
          disciplineName: subject.name,
          monthlyPrice: subject.monthlyPayment,
          enrollmentDate: this.student!.enrollmentDate
        }));
      }
    });
  }

  private loadAvailableDisciplines(): void {
    this.disciplineService.getAll().subscribe({
      next: (disciplines) => {
        this.availableDisciplines = disciplines;
      },
      error: (error) => {
        console.error('Erro ao carregar disciplinas disponíveis:', error);
        this.error = 'Erro ao carregar disciplinas disponíveis';
      }
    });
  }

  get availableDisciplinesToAdd(): DisciplineResponseDto[] {
    const enrolledDisciplineIds = this.studentDisciplines.map(sd => sd.disciplineId);
    return this.availableDisciplines.filter(d => !enrolledDisciplineIds.includes(d.id));
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.addDisciplineForm.reset();
      // Definir preço padrão da disciplina selecionada
      this.addDisciplineForm.get('disciplineId')?.valueChanges.subscribe(disciplineId => {
        if (disciplineId) {
          const discipline = this.availableDisciplines.find(d => d.id === parseInt(disciplineId));
          if (discipline) {
            this.addDisciplineForm.patchValue({ monthlyPrice: discipline.basePrice });
          }
        }
      });
    }
  }

  async addDiscipline(): Promise<void> {
    if (!this.student || !this.addDisciplineForm.valid) return;

    this.savingDiscipline = true;
    this.error = null;

    try {
      const formValue = this.addDisciplineForm.value;
      const enrollmentRequest: EnrollmentRequestDto = {
        studentId: this.student.id,
        disciplineId: parseInt(formValue.disciplineId),
        enrollmentDate: new Date().toISOString(),
        monthlyPrice: parseFloat(formValue.monthlyPrice)
      };

      const newEnrollment = await this.enrollmentService.create(enrollmentRequest).toPromise();
      
      if (newEnrollment) {
        const discipline = this.availableDisciplines.find(d => d.id === newEnrollment.disciplineId);
        if (discipline) {
          const newStudentDiscipline: StudentDiscipline = {
            enrollmentId: newEnrollment.id,
            disciplineId: newEnrollment.disciplineId,
            disciplineName: discipline.name,
            monthlyPrice: newEnrollment.monthlyPrice,
            enrollmentDate: newEnrollment.enrollmentDate
          };

          this.studentDisciplines.push(newStudentDiscipline);
          this.disciplinesUpdated.emit();
          this.showAddForm = false;
          this.addDisciplineForm.reset();
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar disciplina:', error);
      this.error = 'Erro ao adicionar disciplina. Tente novamente.';
    } finally {
      this.savingDiscipline = false;
    }
  }

  async removeDiscipline(discipline: StudentDiscipline): Promise<void> {
    if (!this.student) return;

    const confirmRemove = confirm(`Deseja realmente remover a disciplina "${discipline.disciplineName}"?`);
    if (!confirmRemove) return;

    this.loading = true;
    this.error = null;

    try {
      if (discipline.enrollmentId > 0) {
        await this.enrollmentService.delete(discipline.enrollmentId).toPromise();
      }

      this.studentDisciplines = this.studentDisciplines.filter(
        sd => sd.disciplineId !== discipline.disciplineId
      );
      
      this.disciplinesUpdated.emit();
    } catch (error) {
      console.error('Erro ao remover disciplina:', error);
      this.error = 'Erro ao remover disciplina. Tente novamente.';
    } finally {
      this.loading = false;
    }
  }

  getTotalMonthlyPayment(): number {
    return this.studentDisciplines.reduce((total, discipline) => total + discipline.monthlyPrice, 0);
  }

  closePanel(): void {
    this.showAddForm = false;
    this.addDisciplineForm.reset();
    this.close.emit();
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closePanel();
    }
  }
}
