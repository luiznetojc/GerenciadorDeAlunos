import { Routes } from '@angular/router';
import { StudentTableComponent } from './components/student-table/student-table.component';

export const routes: Routes = [
  { path: '', component: StudentTableComponent },
  { path: 'students', component: StudentTableComponent },
  { 
    path: 'novo-aluno', 
    loadComponent: () => import('./components/student-form/student-form.component').then(m => m.StudentFormComponent) 
  },
  { 
    path: 'nova-disciplina', 
    loadComponent: () => import('./components/discipline-form/discipline-form.component').then(m => m.DisciplineFormComponent) 
  },
  { 
    path: 'cobrancas', 
    loadComponent: () => import('./components/billing-management/billing-management.component').then(m => m.BillingManagementComponent) 
  }
];
