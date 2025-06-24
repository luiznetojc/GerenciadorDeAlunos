import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonthlyBillingService } from '../../services/monthly-billing.service';
import { MonthlyPaymentService } from '../../services/monthly-payment.service';
import { MonthlyPaymentResponse, MonthlyPaymentSummary } from '../../interfaces/billing';

@Component({
  selector: 'app-billing-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="billing-container">
      <h2>💰 Gerenciamento de Débitos e Cobranças</h2>
      
      <!-- Dashboard de Resumo -->
      <div class="dashboard">
        <div class="summary-card total-debt">
          <div class="card-icon">💸</div>
          <div class="card-content">
            <h3>Total em Débito</h3>
            <p class="amount">R$ {{ getTotalDebt().toFixed(2) }}</p>
            <small>{{ getStudentsWithDebt() }} alunos com débitos</small>
          </div>
        </div>
        
        <div class="summary-card overdue">
          <div class="card-icon">⚠️</div>
          <div class="card-content">
            <h3>Em Atraso</h3>
            <p class="amount">{{ getTotalOverdue() }}</p>
            <small>pagamentos vencidos</small>
          </div>
        </div>
        
        <div class="summary-card current-month">
          <div class="card-icon">📅</div>
          <div class="card-content">
            <h3>Mês Atual</h3>
            <p class="amount">{{ getCurrentMonthName() }}</p>
            <small>{{ getCurrentYear() }}</small>
          </div>
        </div>
      </div>

      <!-- Seção de Geração de Débitos -->
      <div class="card">
        <h3>🔄 Gerar Débitos Mensais</h3>
        <div class="generation-form">
          <div class="form-row">
            <div class="form-group">
              <label>Ano:</label>
              <input type="number" [(ngModel)]="selectedYear" min="2020" max="2030">
            </div>
            <div class="form-group">
              <label>Mês:</label>
              <select [(ngModel)]="selectedMonth">
                <option value="1">Janeiro</option>
                <option value="2">Fevereiro</option>
                <option value="3">Março</option>
                <option value="4">Abril</option>
                <option value="5">Maio</option>
                <option value="6">Junho</option>
                <option value="7">Julho</option>
                <option value="8">Agosto</option>
                <option value="9">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
              </select>
            </div>
          </div>
          
          <div class="button-group">
            <button (click)="generateMonthlyBillings()" [disabled]="isLoading" class="btn-primary">
              {{ isLoading ? '⏳ Gerando...' : '🔄 Gerar Débitos' }}
            </button>
            <button (click)="generateCurrentMonthBillings()" [disabled]="isLoading" class="btn-secondary">
              📅 Gerar Mês Atual
            </button>
            <button (click)="refreshData()" [disabled]="isLoading" class="btn-refresh">
              🔄 Atualizar Dados
            </button>
          </div>
        </div>
        
        <div *ngIf="message" class="message" [ngClass]="messageType">
          {{ message }}
        </div>
      </div>

      <!-- Seção de Resumo de Débitos por Aluno -->
      <div class="card">
        <h3>👥 Resumo de Débitos por Aluno</h3>
        
        <div *ngIf="debtSummary.length === 0 && !isLoading" class="no-data">
          <p>📊 Nenhum débito encontrado. Todos os alunos estão em dia!</p>
          <button (click)="loadDebtSummary()" class="btn-secondary">Recarregar</button>
        </div>
        
        <div *ngIf="debtSummary.length > 0" class="debt-summary">
          <div *ngFor="let summary of debtSummary" class="student-debt">
            <div class="student-header" [ngClass]="{'has-overdue': summary.overdueCount > 0}">
              <div class="student-info">
                <h4>{{ summary.studentName }}</h4>
                <div class="student-stats">
                  <span class="total-debt">💰 R$ {{ summary.totalDebt.toFixed(2) }}</span>
                  <span class="payment-count">📄 {{ summary.payments.length }} faturas</span>
                  <span *ngIf="summary.overdueCount > 0" class="overdue-count">
                    ⚠️ {{ summary.overdueCount }} em atraso
                  </span>
                </div>
              </div>
              <button (click)="toggleStudent(summary.studentId)" class="toggle-btn">
                {{ expandedStudents.has(summary.studentId) ? '▼' : '▶' }}
              </button>
            </div>
            
            <div *ngIf="expandedStudents.has(summary.studentId)" class="payments-list">
              <div *ngFor="let payment of summary.payments" class="payment-item" 
                   [ngClass]="{
                     'overdue': payment.isOverdue, 
                     'paid': payment.isPaid,
                     'due-soon': isDueSoon(payment.dueDate)
                   }">
                <div class="payment-header">
                  <div class="payment-basic-info">
                    <span class="month">📅 {{ payment.monthName }}/{{ payment.year }}</span>
                    <span class="amount">💰 R$ {{ payment.totalAmount.toFixed(2) }}</span>
                    <span class="status-badge" [ngClass]="getStatusClass(payment)">
                      {{ getStatusText(payment) }}
                    </span>
                  </div>
                  
                  <div class="payment-dates">
                    <small class="created-date">Criado: {{ formatDate(payment.createdDate) }}</small>
                    <small class="due-date" [ngClass]="{'overdue-date': payment.isOverdue}">
                      Vencimento: {{ formatDate(payment.dueDate) }}
                    </small>
                    <small *ngIf="payment.paymentDate" class="paid-date">
                      Pago em: {{ formatDate(payment.paymentDate) }}
                    </small>
                  </div>
                </div>
                
                <div class="payment-actions">
                  <button *ngIf="!payment.isPaid" 
                          (click)="markAsPaid(payment.id)" 
                          class="btn-pay" 
                          [disabled]="isLoading">
                    ✅ Marcar como Pago
                  </button>
                  <button (click)="togglePaymentDetails(payment.id)" class="btn-details">
                    {{ expandedPayments.has(payment.id) ? 'Ocultar' : 'Ver' }} Detalhes
                  </button>
                </div>
                
                <div *ngIf="expandedPayments.has(payment.id)" class="payment-details">
                  <h5>📋 Detalhes da Cobrança:</h5>
                  <div *ngFor="let detail of payment.details" class="detail-item">
                    <div class="detail-info">
                      <span class="discipline">🎓 {{ detail.disciplineName }}</span>
                      <div class="amounts">
                        <span class="original">R$ {{ detail.originalAmount.toFixed(2) }}</span>
                        <span *ngIf="detail.discountAmount > 0" class="discount">
                          - R$ {{ detail.discountAmount.toFixed(2) }} (desconto)
                        </span>
                        <span class="final-amount">= R$ {{ detail.finalAmount.toFixed(2) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Seção de Pagamentos em Atraso -->
      <div class="card" *ngIf="overduePayments.length > 0">
        <h3>🚨 Pagamentos em Atraso</h3>
        
        <div class="overdue-summary">
          <p>Total de <strong>{{ overduePayments.length }}</strong> pagamentos em atraso</p>
          <p>Valor total: <strong>R$ {{ getTotalOverdueAmount().toFixed(2) }}</strong></p>
        </div>
        
        <div class="overdue-list">
          <div *ngFor="let payment of overduePayments" class="overdue-item" 
               [ngClass]="getOverdueSeverity(payment.daysOverdue)">
            <div class="overdue-info">
              <div class="student-payment">
                <strong>{{ payment.studentName }}</strong>
                <span class="payment-ref">{{ payment.monthName }}/{{ payment.year }}</span>
              </div>
              
              <div class="overdue-details">
                <span class="amount">R$ {{ payment.totalAmount.toFixed(2) }}</span>
                <span class="days-overdue">{{ payment.daysOverdue }} dias em atraso</span>
                <span class="due-date">Venceu em: {{ formatDate(payment.dueDate) }}</span>
              </div>
            </div>
            
            <button (click)="markAsPaid(payment.id)" 
                    class="btn-pay urgent" 
                    [disabled]="isLoading">
              ✅ Quitar Agora
            </button>
          </div>
        </div>
      </div>
      
      <div *ngIf="overduePayments.length === 0 && overdueLoaded" class="card no-overdue">
        <h3>🎉 Parabéns!</h3>
        <p>Nenhum pagamento em atraso no momento!</p>
      </div>
    </div>
  `,
  styleUrls: ['./billing-management.component.scss']
})
export class BillingManagementComponent implements OnInit {
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  isLoading: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  
  debtSummary: MonthlyPaymentSummary[] = [];
  overduePayments: MonthlyPaymentResponse[] = [];
  overdueLoaded: boolean = false;
  
  expandedStudents = new Set<number>();
  expandedPayments = new Set<number>();

  constructor(
    private billingService: MonthlyBillingService,
    private paymentService: MonthlyPaymentService
  ) {}

  ngOnInit(): void {
    this.loadDebtSummary();
    this.loadOverduePayments();
  }

  // Métodos de cálculo para o dashboard
  getTotalDebt(): number {
    return this.debtSummary.reduce((total, summary) => total + summary.totalDebt, 0);
  }

  getStudentsWithDebt(): number {
    return this.debtSummary.length;
  }

  getTotalOverdue(): number {
    return this.overduePayments.length;
  }

  getTotalOverdueAmount(): number {
    return this.overduePayments.reduce((total, payment) => total + payment.totalAmount, 0);
  }

  getCurrentMonthName(): string {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[new Date().getMonth()];
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  // Métodos de toggle para expandir/contrair seções
  toggleStudent(studentId: number): void {
    if (this.expandedStudents.has(studentId)) {
      this.expandedStudents.delete(studentId);
    } else {
      this.expandedStudents.add(studentId);
    }
  }

  togglePaymentDetails(paymentId: number): void {
    if (this.expandedPayments.has(paymentId)) {
      this.expandedPayments.delete(paymentId);
    } else {
      this.expandedPayments.add(paymentId);
    }
  }

  // Métodos de status e estilo
  getStatusClass(payment: MonthlyPaymentResponse): string {
    if (payment.isPaid) return 'status-paid';
    if (payment.isOverdue) return 'status-overdue';
    if (this.isDueSoon(payment.dueDate)) return 'status-due-soon';
    return 'status-current';
  }

  getStatusText(payment: MonthlyPaymentResponse): string {
    if (payment.isPaid) return '✅ Pago';
    if (payment.isOverdue) return `⚠️ ${payment.daysOverdue} dias em atraso`;
    if (this.isDueSoon(payment.dueDate)) return '⏰ Vence em breve';
    return '📅 Em dia';
  }

  isDueSoon(dueDate: string): boolean {
    const due = new Date(dueDate);
    const today = new Date();
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 5 && diffDays >= 0;
  }

  getOverdueSeverity(daysOverdue: number): string {
    if (daysOverdue <= 7) return 'overdue-mild';
    if (daysOverdue <= 30) return 'overdue-moderate';
    return 'overdue-severe';
  }

  // Métodos de ação
  refreshData(): void {
    this.loadDebtSummary();
    this.loadOverduePayments();
  }

  generateMonthlyBillings(): void {
    this.isLoading = true;
    this.billingService.generateMonthlyBillings(this.selectedYear, this.selectedMonth)
      .subscribe({
        next: (response) => {
          this.message = response.message;
          this.messageType = 'success';
          this.loadDebtSummary();
          this.isLoading = false;
        },
        error: (error) => {
          this.message = 'Erro ao gerar débitos: ' + (error.error?.Error || error.message);
          this.messageType = 'error';
          this.isLoading = false;
        }
      });
  }

  generateCurrentMonthBillings(): void {
    this.isLoading = true;
    this.billingService.generateCurrentMonthBillings()
      .subscribe({
        next: (response) => {
          this.message = response.message;
          this.messageType = 'success';
          this.loadDebtSummary();
          this.isLoading = false;
        },
        error: (error) => {
          this.message = 'Erro ao gerar débitos: ' + (error.error?.Error || error.message);
          this.messageType = 'error';
          this.isLoading = false;
        }
      });
  }

  loadDebtSummary(): void {
    this.billingService.getDebtSummary()
      .subscribe({
        next: (data) => {
          this.debtSummary = data;
        },
        error: (error) => {
          console.error('Erro ao carregar resumo de débitos:', error);
        }
      });
  }

  loadOverduePayments(): void {
    this.billingService.getOverduePayments()
      .subscribe({
        next: (data) => {
          this.overduePayments = data;
          this.overdueLoaded = true;
        },
        error: (error) => {
          console.error('Erro ao carregar pagamentos em atraso:', error);
          this.overdueLoaded = true;
        }
      });
  }

  markAsPaid(paymentId: number): void {
    this.isLoading = true;
    // Usando o endpoint personalizado para marcar como pago
    this.paymentService.markAsPaid(paymentId)
      .subscribe({
        next: () => {
          this.message = 'Pagamento marcado como pago com sucesso!';
          this.messageType = 'success';
          this.loadDebtSummary();
          this.loadOverduePayments();
          this.isLoading = false;
        },
        error: (error) => {
          this.message = 'Erro ao marcar pagamento como pago: ' + (error.error?.Error || error.message);
          this.messageType = 'error';
          this.isLoading = false;
        }
      });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }
}
