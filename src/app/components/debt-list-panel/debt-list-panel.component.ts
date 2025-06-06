import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentForTable } from '../../interfaces/student';

@Component({
  selector: 'app-debt-list-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './debt-list-panel.component.html',
  styleUrl: './debt-list-panel.component.scss'
})
export class DebtListPanelComponent {
  @Input() student: StudentForTable | null = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() paymentToggled = new EventEmitter<{ student: StudentForTable, subjectIndex: number }>();

  onClose(): void {
    this.close.emit();
  }

  onPaymentToggle(subjectIndex: number): void {
    if (this.student) {
      this.paymentToggled.emit({ student: this.student, subjectIndex });
    }
  }

  getTotalPaid(): number {
    if (!this.student) return 0;
    return this.student.subjects
      .filter(subject => subject.isPaid)
      .reduce((total, subject) => total + subject.monthlyPayment, 0);
  }

  getTotalPending(): number {
    if (!this.student) return 0;
    return this.student.subjects
      .filter(subject => !subject.isPaid)
      .reduce((total, subject) => total + subject.monthlyPayment, 0);
  }

  getPendingSubjects() {
    if (!this.student) return [];
    return this.student.subjects.filter(subject => !subject.isPaid);
  }

  getPaidSubjects() {
    if (!this.student) return [];
    return this.student.subjects.filter(subject => subject.isPaid);
  }
}
