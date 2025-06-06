// Legacy interfaces - mantidas para compatibilidade
export interface Student {
  id: number;
  name: string;
  subjects: Subject[];
  totalMonthlyPayment: number;
}

export interface Subject {
  name: string;
  monthlyPayment: number;
  isPaid: boolean;
}

// New interfaces based on API
export interface StudentForTable {
  id: number;
  name: string;
  registrationNumber: number;
  enrollmentDate: string;
  subjects: SubjectForTable[];
  totalMonthlyPayment: number;
}

export interface SubjectForTable {
  disciplineId: number;
  name: string;
  monthlyPayment: number;
  isPaid: boolean;
  paymentDate?: Date;
}
