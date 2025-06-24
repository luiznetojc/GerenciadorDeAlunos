export interface MonthlyPaymentResponse {
  id: number;
  studentId: number;
  studentName: string;
  year: number;
  month: number;
  monthName: string;
  totalAmount: number;
  isPaid: boolean;
  paymentDate?: string;
  dueDate: string;
  createdDate: string;
  isOverdue: boolean;
  daysOverdue: number;
  details: MonthlyPaymentDetailResponse[];
}

export interface MonthlyPaymentDetailResponse {
  id: number;
  monthlyPaymentId: number;
  enrollmentId: number;
  disciplineName: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

export interface MonthlyPaymentSummary {
  studentId: number;
  studentName: string;
  totalDebt: number;
  overdueCount: number;
  payments: MonthlyPaymentResponse[];
}

export interface MonthlyPaymentRequest {
  studentId: number;
  year: number;
  month: number;
  totalAmount: number;
  isPaid: boolean;
  paymentDate?: string;
  dueDate: string;
}
