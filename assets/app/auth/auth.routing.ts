import {RouterModule, Routes} from "@angular/router";
import {RegistrationComponent} from "./registration.component";
import {LoginComponent} from "./login.component";
import {ResetPasswordComponent} from "./resetPassword.component";

/**
 *  Routing system for the authentication module
 */
const AUTH_ROUTES: Routes = [
    { path: '', redirectTo: 'register', pathMatch: 'full' },
    { path: 'register', component: RegistrationComponent },
    { path: 'login', component: LoginComponent },
    { path: 'reset-password', component: ResetPasswordComponent }
];

export const authRouting = RouterModule.forChild(AUTH_ROUTES);