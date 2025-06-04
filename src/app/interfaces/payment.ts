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
