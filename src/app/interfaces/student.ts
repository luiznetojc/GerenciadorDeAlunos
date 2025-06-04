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
