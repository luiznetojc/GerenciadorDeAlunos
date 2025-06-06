import { Injectable } from '@angular/core';
import { Observable, forkJoin, map, switchMap, of } from 'rxjs';
import { StudentService } from './student.service';
import { DisciplineService } from './discipline.service';
import { EnrollmentService } from './enrollment.service';
import { MonthlyPaymentService } from './monthly-payment.service';
import { MonthlyPaymentDetailService } from './monthly-payment-detail.service';
import { 
  StudentWithEnrollments, 
  EnrollmentWithDiscipline,
  MonthlyPaymentWithDetails,
  MonthlyPaymentDetailWithDiscipline,
  StudentResponseDto,
  EnrollmentResponseDto,
  DisciplineResponseDto,
  MonthlyPaymentResponseDto,
  MonthlyPaymentDetailResponseDto
} from '../interfaces/api';

@Injectable({
  providedIn: 'root'
})
export class StudentDataService {

  constructor(
    private studentService: StudentService,
    private disciplineService: DisciplineService,
    private enrollmentService: EnrollmentService,
    private monthlyPaymentService: MonthlyPaymentService,
    private monthlyPaymentDetailService: MonthlyPaymentDetailService
  ) { }

  /**
   * Busca todos os alunos com suas matrículas e disciplinas
   */
  getStudentsWithEnrollments(): Observable<StudentWithEnrollments[]> {
    return forkJoin({
      students: this.studentService.getAll(),
      enrollments: this.enrollmentService.getAll(),
      disciplines: this.disciplineService.getAll()
    }).pipe(
      map(({ students, enrollments, disciplines }) => {
        return students.map(student => {
          const studentEnrollments = enrollments
            .filter(enrollment => enrollment.studentId === student.id)
            .map(enrollment => {
              const discipline = disciplines.find(d => d.id === enrollment.disciplineId);
              return {
                ...enrollment,
                discipline: discipline!
              } as EnrollmentWithDiscipline;
            });

          const totalMonthlyPayment = studentEnrollments
            .reduce((total, enrollment) => total + enrollment.monthlyPrice, 0);

          return {
            ...student,
            enrollments: studentEnrollments,
            totalMonthlyPayment
          } as StudentWithEnrollments;
        });
      })
    );
  }

  /**
   * Busca um aluno específico com suas matrículas
   */
  getStudentWithEnrollments(studentId: number): Observable<StudentWithEnrollments> {
    return forkJoin({
      student: this.studentService.getById(studentId),
      enrollments: this.enrollmentService.getByStudentId(studentId),
      disciplines: this.disciplineService.getAll()
    }).pipe(
      map(({ student, enrollments, disciplines }) => {
        const studentEnrollments = enrollments.map(enrollment => {
          const discipline = disciplines.find(d => d.id === enrollment.disciplineId);
          return {
            ...enrollment,
            discipline: discipline!
          } as EnrollmentWithDiscipline;
        });

        const totalMonthlyPayment = studentEnrollments
          .reduce((total, enrollment) => total + enrollment.monthlyPrice, 0);

        return {
          ...student,
          enrollments: studentEnrollments,
          totalMonthlyPayment
        } as StudentWithEnrollments;
      })
    );
  }

  /**
   * Busca pagamentos mensais de um aluno com detalhes das disciplinas
   */
  getStudentMonthlyPaymentsWithDetails(studentId: number): Observable<MonthlyPaymentWithDetails[]> {
    return this.monthlyPaymentService.getByStudentId(studentId).pipe(
      switchMap((payments: any[]) => {
        if (payments.length === 0) {
          return of([]);
        }

        const paymentDetailsRequests = payments.map(payment =>
          forkJoin({
            payment: of(payment),
            details: this.monthlyPaymentDetailService.getByMonthlyPaymentId(payment.id),
            disciplines: this.disciplineService.getAll()
          })
        );

        return forkJoin(paymentDetailsRequests).pipe(
          map(paymentData => 
            paymentData.map(({ payment, details, disciplines }) => ({
              ...payment,
              details: (details as any[]).map(detail => {
                const discipline = (disciplines as any[]).find(d => d.id === detail.disciplineId);
                return {
                  ...detail,
                  discipline: discipline!
                } as MonthlyPaymentDetailWithDiscipline;
              })
            } as MonthlyPaymentWithDetails))
          )
        );
      })
    );
  }

  /**
   * Busca ou cria pagamento mensal para um aluno em um mês específico
   */
  getOrCreateMonthlyPayment(studentId: number, year: number, month: number): Observable<MonthlyPaymentWithDetails> {
    return this.monthlyPaymentService.getByStudentAndMonth(studentId, year, month).pipe(
      switchMap(payment => {
        if (payment) {
          // Se o pagamento existe, busca os detalhes
          return this.getMonthlyPaymentWithDetails(payment.id);
        } else {
          // Se não existe, cria um novo pagamento baseado nas matrículas do aluno
          return this.createMonthlyPaymentForStudent(studentId, year, month);
        }
      })
    );
  }

  /**
   * Cria um pagamento mensal para um aluno baseado em suas matrículas
   */
  private createMonthlyPaymentForStudent(studentId: number, year: number, month: number): Observable<MonthlyPaymentWithDetails> {
    return this.getStudentWithEnrollments(studentId).pipe(
      switchMap(student => {
        const totalAmount = student.totalMonthlyPayment;
        
        // Cria o pagamento mensal
        return this.monthlyPaymentService.create({
          studentId,
          year,
          month,
          totalAmount,
          isPaid: false
        }).pipe(
          switchMap(createdPayment => {
            // Cria os detalhes para cada matrícula
            const detailRequests = student.enrollments.map(enrollment =>
              this.monthlyPaymentDetailService.create({
                monthlyPaymentId: createdPayment.id,
                disciplineId: enrollment.disciplineId,
                amount: enrollment.monthlyPrice,
                isPaid: false
              })
            );

            return forkJoin(detailRequests).pipe(
              switchMap(() => this.getMonthlyPaymentWithDetails(createdPayment.id))
            );
          })
        );
      })
    );
  }

  /**
   * Busca um pagamento mensal específico com seus detalhes
   */
  private getMonthlyPaymentWithDetails(paymentId: number): Observable<MonthlyPaymentWithDetails> {
    return forkJoin({
      payment: this.monthlyPaymentService.getById(paymentId),
      details: this.monthlyPaymentDetailService.getByMonthlyPaymentId(paymentId),
      disciplines: this.disciplineService.getAll()
    }).pipe(
      map(({ payment, details, disciplines }) => ({
        ...payment,
        details: details.map(detail => {
          const discipline = disciplines.find(d => d.id === detail.disciplineId);
          return {
            ...detail,
            discipline: discipline!
          } as MonthlyPaymentDetailWithDiscipline;
        })
      } as MonthlyPaymentWithDetails))
    );
  }

  /**
   * Atualiza o status de pagamento de uma disciplina específica
   */
  updatePaymentDetailStatus(detailId: number, isPaid: boolean, paymentDate?: string): Observable<void> {
    return this.monthlyPaymentDetailService.getById(detailId).pipe(
      switchMap(detail => 
        this.monthlyPaymentDetailService.update(detailId, {
          ...detail,
          isPaid,
          paymentDate
        })
      )
    );
  }

  /**
   * Atualiza o status de pagamento de um mês inteiro
   */
  updateMonthlyPaymentStatus(paymentId: number, isPaid: boolean, paymentDate?: string): Observable<void> {
    return forkJoin({
      payment: this.monthlyPaymentService.getById(paymentId),
      details: this.monthlyPaymentDetailService.getByMonthlyPaymentId(paymentId)
    }).pipe(
      switchMap(({ payment, details }) => {
        // Atualiza o pagamento principal
        const updatePayment = this.monthlyPaymentService.update(paymentId, {
          ...payment,
          isPaid,
          paymentDate
        });

        // Atualiza todos os detalhes
        const updateDetails = details.map(detail =>
          this.monthlyPaymentDetailService.update(detail.id, {
            ...detail,
            isPaid,
            paymentDate
          })
        );

        return forkJoin([updatePayment, ...updateDetails]).pipe(
          map(() => void 0)
        );
      })
    );
  }
}
