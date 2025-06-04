import { Routes } from '@angular/router';
import { StudentTableComponent } from './components/student-table/student-table.component';

export const routes: Routes = [
  { path: '', component: StudentTableComponent },
  { path: 'students', component: StudentTableComponent }
];
