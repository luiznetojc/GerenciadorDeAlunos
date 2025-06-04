import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student, Subject } from '../../interfaces/student';
import { PaymentHistoryComponent } from '../payment-history/payment-history.component';

@Component({
  selector: 'app-student-table',
  standalone: true,
  imports: [CommonModule, FormsModule, PaymentHistoryComponent],
  templateUrl: './student-table.component.html',
  styleUrl: './student-table.component.scss'
})
export class StudentTableComponent {
  students: Student[] = [
    {
      id: 1,
      name: 'João Silva',
      subjects: [
        { name: 'Matemática', monthlyPayment: 250, isPaid: false },
        { name: 'Biologia', monthlyPayment: 250, isPaid: false }
      ],
      totalMonthlyPayment: 500
    },
    {
      id: 2,
      name: 'Maria Santos',
      subjects: [
        { name: 'Física', monthlyPayment: 300, isPaid: false },
        { name: 'Química', monthlyPayment: 300, isPaid: false },
        { name: 'Matemática', monthlyPayment: 300, isPaid: false }
      ],
      totalMonthlyPayment: 900
    },
    {
      id: 3,
      name: 'Pedro Oliveira',
      subjects: [
        { name: 'História', monthlyPayment: 200, isPaid: false },
        { name: 'Geografia', monthlyPayment: 200, isPaid: false },
        { name: 'Literatura', monthlyPayment: 200, isPaid: false },
        { name: 'Redação', monthlyPayment: 200, isPaid: false }
      ],
      totalMonthlyPayment: 800
    }
  ];

  selectedStudent: Student | null = null;
  searchTerm: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';

  get filteredStudents(): Student[] {
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

  togglePaymentStatus(student: Student, subject: Subject): void {
    subject.isPaid = !subject.isPaid;
  }

  calculateTotalPaid(student: Student): number {
    return student.subjects
      .filter(subject => subject.isPaid)
      .reduce((total, subject) => total + subject.monthlyPayment, 0);
  }

  calculateRemainingPayment(student: Student): number {
    return student.totalMonthlyPayment - this.calculateTotalPaid(student);
  }

  showPaymentHistory(student: Student): void {
    this.selectedStudent = this.selectedStudent === student ? null : student;
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
  }
}
