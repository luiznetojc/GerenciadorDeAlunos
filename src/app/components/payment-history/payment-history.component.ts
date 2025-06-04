import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Student } from '../../interfaces/student';
import { MonthlyPaymentStatus, Payment } from '../../interfaces/payment';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-history.component.html',
  styleUrl: './payment-history.component.scss'
})
export class PaymentHistoryComponent implements OnInit {
  @Input() student!: Student;
  monthlyPayments: MonthlyPaymentStatus[] = [];
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  ngOnInit() {
    this.generateMonthlyPayments();
  }

  generateMonthlyPayments() {
    // Gerar histórico para os últimos 12 meses
    for (let i = 0; i < 12; i++) {
      const month = (this.currentMonth - i + 12) % 12;
      const year = this.currentYear - Math.floor((i - this.currentMonth) / 12);
      
      const monthlyStatus: MonthlyPaymentStatus = {
        month,
        year,
        subjects: this.student.subjects.map(subject => ({
          name: subject.name,
          amount: subject.monthlyPayment,
          isPaid: false,
          paymentDate: undefined
        })),
        totalAmount: this.student.totalMonthlyPayment,
        paidAmount: 0
      };

      this.monthlyPayments.push(monthlyStatus);
    }
  }

  isCurrentMonth(payment: MonthlyPaymentStatus): boolean {
    return payment.month === this.currentMonth && payment.year === this.currentYear;
  }

  togglePayment(monthlyPayment: MonthlyPaymentStatus, subjectIndex: number) {
    const subject = monthlyPayment.subjects[subjectIndex];
    subject.isPaid = !subject.isPaid;
    subject.paymentDate = subject.isPaid ? new Date() : undefined;

    // Recalcular o total pago
    this.updatePaidAmount(monthlyPayment);
  }

  toggleMonthPayment(monthlyPayment: MonthlyPaymentStatus) {
    const shouldMarkAsPaid = !this.isMonthFullyPaid(monthlyPayment);
    const currentDate = new Date();

    monthlyPayment.subjects.forEach(subject => {
      subject.isPaid = shouldMarkAsPaid;
      subject.paymentDate = shouldMarkAsPaid ? currentDate : undefined;
    });

    this.updatePaidAmount(monthlyPayment);
  }

  isMonthFullyPaid(monthlyPayment: MonthlyPaymentStatus): boolean {
    return monthlyPayment.subjects.every(subject => subject.isPaid);
  }

  updatePaidAmount(monthlyPayment: MonthlyPaymentStatus) {
    monthlyPayment.paidAmount = monthlyPayment.subjects
      .filter(s => s.isPaid)
      .reduce((total, s) => total + s.amount, 0);
  }

  getRemainingAmount(monthlyPayment: MonthlyPaymentStatus): number {
    return monthlyPayment.totalAmount - monthlyPayment.paidAmount;
  }

  get currentMonthPayment(): MonthlyPaymentStatus | undefined {
    return this.monthlyPayments.find(payment => 
      payment.month === this.currentMonth && payment.year === this.currentYear
    );
  }
}
