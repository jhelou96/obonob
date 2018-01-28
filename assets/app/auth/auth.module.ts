import {NgModule} from "@angular/core";
import {AuthComponent} from "./auth.component";
import {LoginComponent} from "./login.component";
import {RegistrationComponent} from "./registration.component";
import {CommonModule} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {authRouting} from "./auth.routing";
import {ResetPasswordComponent} from "./resetPassword.component";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
    declarations: [
        LoginComponent,
        RegistrationComponent,
        ResetPasswordComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        authRouting,
        TranslateModule.forChild()
    ],
    providers: []
})
export class AuthModule {

}