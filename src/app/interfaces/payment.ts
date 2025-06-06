// Legacy interfaces - mantidas para compatibilidade
export interface Payment {
  id: number;
  studentId: number;
  subjectId: number;
  month: number;
  year: number;
  amount: number;
  isPaid: boolean;
  paymentDate?: Date;
}

export interface MonthlyPaymentStatus {
  month: number;
  year: number;
  subjects: {
    name: string;
    amount: number;
    isPaid: boolean;
    paymentDate?: Date;
  }[];
  totalAmount: number;
  paidAmount: number;
}

// New interfaces based on API
export interface PaymentDetail {
  id: number;
  disciplineId: number;
  disciplineName: string;
  amount: number;
  isPaid: boolean;
  paymentDate?: Date;
}

export interface MonthlyPaymentForDisplay {
  id: number;
  studentId: number;
  month: number;
  year: number;
  totalAmount: number;
  isPaid: boolean;
  paymentDate?: Date;
  details: PaymentDetail[];
  paidAmount: number;
}
