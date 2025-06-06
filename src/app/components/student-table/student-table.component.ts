import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student, Subject, StudentForTable, SubjectForTable } from '../../interfaces/student';
import { PaymentHistoryPanelComponent } from '../payment-history-panel/payment-history-panel.component';
import { DebtListPanelComponent } from '../debt-list-panel/debt-list-panel.component';
import { StudentDisciplinesPanelComponent } from '../student-disciplines-panel/student-disciplines-panel.component';
import { StudentDataService } from '../../services/student-data.service';
import { MonthlyPaymentService } from '../../services/monthly-payment.service';
import { MonthlyPaymentDetailService } from '../../services/monthly-payment-detail.service';
import { StudentWithEnrollments } from '../../interfaces/api';

@Component({
  selector: 'app-student-table',
  standalone: true,
  imports: [CommonModule, FormsModule, PaymentHistoryPanelComponent, DebtListPanelComponent, StudentDisciplinesPanelComponent],
  templateUrl: './student-table.component.html',
  styleUrl: './student-table.component.scss'
})
export class StudentTableComponent implements OnInit {
  students: StudentForTable[] = [];
  selectedStudent: Student | null = null;
  selectedStudentForDebt: StudentForTable | null = null;
  selectedStudentForHistory: StudentForTable | null = null;
  selectedStudentForDisciplines: StudentForTable | null = null;
  showDebtPanel = false;
  showHistoryPanel = false;
  showDisciplinesPanel = false;
  searchTerm: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';
  loading = true;
  error: string | null = null;

  constructor(
    private studentDataService: StudentDataService,
    private monthlyPaymentService: MonthlyPaymentService,
    private monthlyPaymentDetailService: MonthlyPaymentDetailService
  ) { }

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.error = null;
    
    this.studentDataService.getStudentsWithEnrollments().subscribe({
      next: (studentsData) => {
        this.students = this.mapToTableFormat(studentsData);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar alunos:', error);
        this.error = 'Erro ao carregar dados dos alunos. Verifique se o backend está rodando.';
        this.loading = false;
        // Fallback para dados mock em caso de erro
        this.loadMockData();
      }
    });
  }

  private mapToTableFormat(studentsData: StudentWithEnrollments[]): StudentForTable[] {
    return studentsData.map(student => ({
      id: student.id,
      name: student.fullName,
      registrationNumber: student.registrationNumber,
      enrollmentDate: student.enrollmentDate,
      subjects: student.enrollments.map(enrollment => ({
        disciplineId: enrollment.disciplineId,
        name: enrollment.discipline.name,
        monthlyPayment: enrollment.monthlyPrice,
        isPaid: false, // Status será obtido dos pagamentos mensais
        paymentDate: undefined
      })),
      totalMonthlyPayment: student.totalMonthlyPayment
    }));
  }

  private loadMockData(): void {
    // Dados mock como fallback
    this.students = [
      {
        id: 1,
        name: 'João Silva',
        registrationNumber: 2024001,
        enrollmentDate: '2024-01-15',
        subjects: [
          { disciplineId: 1, name: 'Matemática', monthlyPayment: 250, isPaid: false },
          { disciplineId: 2, name: 'Biologia', monthlyPayment: 250, isPaid: false }
        ],
        totalMonthlyPayment: 500
      },
      {
        id: 2,
        name: 'Maria Santos',
        registrationNumber: 2024002,
        enrollmentDate: '2024-02-10',
        subjects: [
          { disciplineId: 3, name: 'Física', monthlyPayment: 300, isPaid: false },
          { disciplineId: 4, name: 'Química', monthlyPayment: 300, isPaid: false },
          { disciplineId: 1, name: 'Matemática', monthlyPayment: 300, isPaid: false }
        ],
        totalMonthlyPayment: 900
      },
      {
        id: 3,
        name: 'Pedro Oliveira',
        registrationNumber: 2024003,
        enrollmentDate: '2024-03-05',
        subjects: [
          { disciplineId: 5, name: 'História', monthlyPayment: 200, isPaid: false },
          { disciplineId: 6, name: 'Geografia', monthlyPayment: 200, isPaid: false },
          { disciplineId: 7, name: 'Literatura', monthlyPayment: 200, isPaid: false },
          { disciplineId: 8, name: 'Redação', monthlyPayment: 200, isPaid: false }
        ],
        totalMonthlyPayment: 800
      }
    ];
  }

  get filteredStudents(): StudentForTable[] {
    return this.students
      .filter(student =>
        student.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.subjects.some(subject =>
          subject.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      )
      .sort((a, b) => {
        const comparison = a.totalMonthlyPayment - b.totalMonthlyPayment;
        return this.sortOrder === 'asc' ? comparison : -comparison;
      });
  }

  togglePaymentStatus(student: StudentForTable, subject: SubjectForTable): void {
    subject.isPaid = !subject.isPaid;
    subject.paymentDate = subject.isPaid ? new Date() : undefined;
    
    // TODO: Implementar chamada para API para atualizar status de pagamento
    // this.studentDataService.updatePaymentDetailStatus(...)
  }

  onPaymentToggled(event: { student: StudentForTable, subjectIndex: number }): void {
    const { student, subjectIndex } = event;
    const subject = student.subjects[subjectIndex];
    
    // Simula a atualização via API
    this.updatePaymentStatus(student.id, subject.disciplineId, !subject.isPaid)
      .then((success) => {
        if (success) {
          // Atualiza o status localmente
          subject.isPaid = !subject.isPaid;
          subject.paymentDate = subject.isPaid ? new Date() : undefined;
          
          // Força a atualização da view
          this.students = [...this.students];
        } else {
          console.error('Falha ao atualizar status de pagamento');
        }
      });
  }

  private async updatePaymentStatus(studentId: number, disciplineId: number, isPaid: boolean): Promise<boolean> {
    try {
      // Aqui seria a chamada real para a API
      // Por enquanto, simula uma operação assíncrona
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // TODO: Implementar chamada real para API
      // const payment = await this.monthlyPaymentService.getByStudentAndMonth(studentId, currentYear, currentMonth);
      // if (payment) {
      //   await this.monthlyPaymentDetailService.updatePaymentStatus(payment.id, disciplineId, isPaid);
      // }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      return false;
    }
  }

  calculateTotalPaid(student: StudentForTable): number {
    return student.subjects
      .filter(subject => subject.isPaid)
      .reduce((total, subject) => total + subject.monthlyPayment, 0);
  }

  calculateRemainingPayment(student: StudentForTable): number {
    return student.totalMonthlyPayment - this.calculateTotalPaid(student);
  }

  showPaymentHistory(student: StudentForTable): void {
    this.selectedStudentForHistory = this.selectedStudentForHistory?.id === student.id ? null : student;
    this.showHistoryPanel = !!this.selectedStudentForHistory;
  }

  closeHistoryPanel(): void {
    this.showHistoryPanel = false;
    this.selectedStudentForHistory = null;
  }

  onPaymentUpdated(): void {
    // Recarregar dados após atualização de pagamento
    this.loadStudents();
  }

  showDebtList(student: StudentForTable): void {
    this.selectedStudentForDebt = student;
    this.showDebtPanel = true;
  }

  closeDebtPanel(): void {
    this.showDebtPanel = false;
    this.selectedStudentForDebt = null;
  }

  onDebtPaymentToggled(event: { student: StudentForTable, subjectIndex: number }): void {
    const { student, subjectIndex } = event;
    const subject = student.subjects[subjectIndex];
    
    // Encontrar o estudante na lista principal e atualizar
    const mainStudent = this.students.find(s => s.id === student.id);
    if (mainStudent) {
      const mainSubject = mainStudent.subjects[subjectIndex];
      if (mainSubject) {
        mainSubject.isPaid = !mainSubject.isPaid;
        mainSubject.paymentDate = mainSubject.isPaid ? new Date() : undefined;
        
        // TODO: Implementar chamada para API
        // this.studentDataService.updatePaymentDetailStatus(...)
      }
    }
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
  }

  showDisciplineManagement(student: StudentForTable): void {
    this.selectedStudentForDisciplines = student;
    this.showDisciplinesPanel = true;
  }

  closeDisciplinesPanel(): void {
    this.showDisciplinesPanel = false;
    this.selectedStudentForDisciplines = null;
  }

  onDisciplinesUpdated(): void {
    // Recarregar dados após atualização das disciplinas
    this.loadStudents();
  }
}
