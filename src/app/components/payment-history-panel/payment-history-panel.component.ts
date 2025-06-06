import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentForTable } from '../../interfaces/student';
import { MonthlyPaymentResponseDto, MonthlyPaymentRequestDto } from '../../interfaces/api';
import { MonthlyPaymentService } from '../../services/monthly-payment.service';

interface PaymentDetailForHistory {
  disciplineId: number;
  disciplineName: string;
  amount: number;
  isPaid: boolean;
  paymentDate?: Date;
}

interface MonthlyPaymentForHistory {
  id: number;
  studentId: number;
  month: number;
  year: number;
  totalAmount: number;
  isPaid: boolean;
  paymentDate?: Date;
  details: PaymentDetailForHistory[];
}

@Component({
  selector: 'app-payment-history-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-history-panel.component.html',
  styleUrl: './payment-history-panel.component.scss'
})
export class PaymentHistoryPanelComponent implements OnInit, OnChanges {
  @Input() student: StudentForTable | null = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() paymentUpdated = new EventEmitter<void>();

  monthlyPayments: MonthlyPaymentForHistory[] = [];
  loading = false;
  error: string | null = null;
  
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1; // API usa 1-12, Date usa 0-11
  
  months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  constructor(private monthlyPaymentService: MonthlyPaymentService) {}

  ngOnInit(): void {
    if (this.student && this.isVisible) {
      this.loadPaymentHistory();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['student'] || changes['isVisible']) {
      if (this.student && this.isVisible) {
        this.loadPaymentHistory();
      }
    }
  }

  loadPaymentHistory(): void {
    if (!this.student) return;

    this.loading = true;
    this.error = null;

    this.monthlyPaymentService.getByStudentId(this.student.id).subscribe({
      next: (payments) => {
        this.monthlyPayments = this.mapPaymentsToHistory(payments);
        this.generateMissingMonths();
        this.sortPaymentsByDate();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar histórico de pagamentos:', error);
        this.error = 'Erro ao carregar histórico de pagamentos';
        this.loading = false;
        this.generateMockHistory();
      }
    });
  }

  private mapPaymentsToHistory(payments: MonthlyPaymentResponseDto[]): MonthlyPaymentForHistory[] {
    if (!this.student) return [];

    return payments.map(payment => ({
      id: payment.id,
      studentId: payment.studentId,
      month: payment.month,
      year: payment.year,
      totalAmount: payment.totalAmount,
      isPaid: payment.isPaid,
      paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : undefined,
      details: this.student!.subjects.map(subject => ({
        disciplineId: subject.disciplineId,
        disciplineName: subject.name,
        amount: subject.monthlyPayment,
        isPaid: payment.isPaid, // Por ora, assume que todos os detalhes têm o mesmo status
        paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : undefined
      }))
    }));
  }

  private generateMissingMonths(): void {
    if (!this.student) return;

    // Gerar últimos 12 meses se não existirem na API
    for (let i = 0; i < 12; i++) {
      const month = ((this.currentMonth - i - 1) % 12) + 1;
      const year = this.currentYear - Math.floor((this.currentMonth - i - 1) / 12);
      
      const existingPayment = this.monthlyPayments.find(p => p.month === month && p.year === year);
      
      if (!existingPayment) {
        const newPayment: MonthlyPaymentForHistory = {
          id: 0, // ID 0 indica que não existe na API ainda
          studentId: this.student.id,
          month,
          year,
          totalAmount: this.student.totalMonthlyPayment,
          isPaid: false,
          details: this.student.subjects.map(subject => ({
            disciplineId: subject.disciplineId,
            disciplineName: subject.name,
            amount: subject.monthlyPayment,
            isPaid: false
          }))
        };
        
        this.monthlyPayments.push(newPayment);
      }
    }
  }

  private generateMockHistory(): void {
    if (!this.student) return;

    this.monthlyPayments = [];
    
    for (let i = 0; i < 12; i++) {
      const month = ((this.currentMonth - i - 1) % 12) + 1;
      const year = this.currentYear - Math.floor((this.currentMonth - i - 1) / 12);
      
      const mockPayment: MonthlyPaymentForHistory = {
        id: 0,
        studentId: this.student.id,
        month,
        year,
        totalAmount: this.student.totalMonthlyPayment,
        isPaid: i > 2, // Marca os 3 últimos meses como não pagos
        paymentDate: i > 2 ? new Date(year, month - 1, 15) : undefined,
        details: this.student.subjects.map(subject => ({
          disciplineId: subject.disciplineId,
          disciplineName: subject.name,
          amount: subject.monthlyPayment,
          isPaid: i > 2
        }))
      };
      
      this.monthlyPayments.push(mockPayment);
    }
  }

  private sortPaymentsByDate(): void {
    this.monthlyPayments.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }

  isCurrentMonth(payment: MonthlyPaymentForHistory): boolean {
    return payment.month === this.currentMonth && payment.year === this.currentYear;
  }

  async togglePaymentDetail(payment: MonthlyPaymentForHistory, detailIndex: number): Promise<void> {
    const detail = payment.details[detailIndex];
    detail.isPaid = !detail.isPaid;
    detail.paymentDate = detail.isPaid ? new Date() : undefined;

    // Atualizar status do pagamento mensal
    const allPaid = payment.details.every(d => d.isPaid);
    payment.isPaid = allPaid;
    payment.paymentDate = allPaid ? new Date() : undefined;

    await this.updatePaymentInAPI(payment);
  }

  async toggleMonthPayment(payment: MonthlyPaymentForHistory): Promise<void> {
    const shouldMarkAsPaid = !payment.isPaid;
    const currentDate = new Date();

    payment.isPaid = shouldMarkAsPaid;
    payment.paymentDate = shouldMarkAsPaid ? currentDate : undefined;

    // Atualizar todos os detalhes
    payment.details.forEach(detail => {
      detail.isPaid = shouldMarkAsPaid;
      detail.paymentDate = shouldMarkAsPaid ? currentDate : undefined;
    });

    await this.updatePaymentInAPI(payment);
  }

  private async updatePaymentInAPI(payment: MonthlyPaymentForHistory): Promise<void> {
    if (!this.student) return;

    try {
      const paymentRequest: MonthlyPaymentRequestDto = {
        studentId: payment.studentId,
        year: payment.year,
        month: payment.month,
        totalAmount: payment.totalAmount,
        isPaid: payment.isPaid,
        paymentDate: payment.paymentDate?.toISOString()
      };

      if (payment.id === 0) {
        // Criar novo pagamento
        const createdPayment = await this.monthlyPaymentService.create(paymentRequest).toPromise();
        if (createdPayment) {
          payment.id = createdPayment.id;
        }
      } else {
        // Atualizar pagamento existente
        await this.monthlyPaymentService.update(payment.id, paymentRequest).toPromise();
      }

      this.paymentUpdated.emit();
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      this.error = 'Erro ao salvar alterações do pagamento';
    }
  }

  getPaidAmount(payment: MonthlyPaymentForHistory): number {
    return payment.details
      .filter(detail => detail.isPaid)
      .reduce((total, detail) => total + detail.amount, 0);
  }

  getRemainingAmount(payment: MonthlyPaymentForHistory): number {
    return payment.totalAmount - this.getPaidAmount(payment);
  }

  closePanel(): void {
    this.close.emit();
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closePanel();
    }
  }
}
