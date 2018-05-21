import {RouterModule, Routes} from "@angular/router";
import {RegistrationComponent} from "./registration.component";
import {LoginComponent} from "./login.component";
import {PasswordResetComponent} from "./passwordReset.component";
import {SettingsComponent} from "./settings.component";
import {ProfileComponent} from "./profile.component";
import {ValidationComponent} from "./validation.component";

/**
 *  Routing system for the authentication module
 */
const AUTH_ROUTES: Routes = [
    { path: '', redirectTo: 'register', pathMatch: 'full' },
    { path: 'register', component: RegistrationComponent },
    { path: 'login', component: LoginComponent },
    { path: 'reset-password', component: PasswordResetComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'profile/:username', component: ProfileComponent },
    { path: 'validation/:action/:key', component: ValidationComponent }
];

export const authRouting = RouterModule.forChild(AUTH_ROUTES);