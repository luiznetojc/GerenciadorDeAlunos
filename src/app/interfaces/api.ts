// Interfaces para comunicação com a API

// Student DTOs
export interface StudentRequestDto {
  registrationNumber: number;
  fullName: string;
  enrollmentDate: string;
}

export interface StudentResponseDto {
  id: number;
  registrationNumber: number;
  fullName: string;
  enrollmentDate: string;
}

// Discipline DTOs
export interface DisciplineRequestDto {
  name: string;
  basePrice: number;
}

export interface DisciplineResponseDto {
  id: number;
  name: string;
  basePrice: number;
}

// Enrollment DTOs
export interface EnrollmentRequestDto {
  studentId: number;
  disciplineId: number;
  discount?: number;
}

export interface EnrollmentResponseDto {
  id: number;
  studentId: number;
  disciplineId: number;
  discount?: number;
}

// Monthly Payment DTOs
export interface MonthlyPaymentRequestDto {
  studentId: number;
  year: number;
  month: number;
  totalAmount: number;
  isPaid: boolean;
  paymentDate?: string;
}

export interface MonthlyPaymentResponseDto {
  id: number;
  studentId: number;
  year: number;
  month: number;
  totalAmount: number;
  isPaid: boolean;
  paymentDate?: string;
}

// Monthly Payment Detail DTOs
export interface MonthlyPaymentDetailRequestDto {
  monthlyPaymentId: number;
  disciplineId: number;
  amount: number;
  isPaid: boolean;
  paymentDate?: string;
}

export interface MonthlyPaymentDetailResponseDto {
  id: number;
  monthlyPaymentId: number;
  disciplineId: number;
  amount: number;
  isPaid: boolean;
  paymentDate?: string;
}

// Combined interfaces for frontend use
export interface StudentWithEnrollments extends StudentResponseDto {
  enrollments: EnrollmentWithDiscipline[];
  totalMonthlyPayment: number;
}

export interface EnrollmentWithDiscipline extends EnrollmentResponseDto {
  discipline: DisciplineResponseDto;
  monthlyPrice: number;
}

export interface MonthlyPaymentWithDetails extends MonthlyPaymentResponseDto {
  details: MonthlyPaymentDetailWithDiscipline[];
}

export interface MonthlyPaymentDetailWithDiscipline extends MonthlyPaymentDetailResponseDto {
  discipline: DisciplineResponseDto;
}
