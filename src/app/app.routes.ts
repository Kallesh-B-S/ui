import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { AddServiceProviderComponent } from './service-provider/add/add-service-provider.component';
import { EditServiceProviderComponent } from './service-provider/edit/edit-service-provider.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ParamTableComponent } from './param/table/param-table.component';
import { ManageTableRecordComponent } from './param/manage-table-record/manage-table-record.component';
import { ManageParamRecordComponent } from './param/manage-param-record/manage-param-record.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'table-record', component: ManageTableRecordComponent },
  { path: 'param-record/:id', component: ManageParamRecordComponent },
  { path: 'usersettings', component: UserSettingsComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'service-provider/:id', component: EditServiceProviderComponent, canActivate: [AuthGuard] },
  { path: 'add-service-provider', component: AddServiceProviderComponent, canActivate: [AuthGuard] },
  { path: '404', component: NotFoundComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/404' }
];