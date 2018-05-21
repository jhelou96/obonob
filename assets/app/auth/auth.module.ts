import {NgModule} from "@angular/core";
import {LoginComponent} from "./login.component";
import {RegistrationComponent} from "./registration.component";
import {CommonModule} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {authRouting} from "./auth.routing";
import {TranslateModule} from "@ngx-translate/core";
import {SettingsComponent} from "./settings.component";
import {ProfileComponent} from "./profile.component";
import {MomentModule} from "angular2-moment";
import {LMarkdownEditorModule} from "ngx-markdown-editor";
import {ValidationComponent} from "./validation.component";
import {PasswordResetComponent} from "./passwordReset.component";
import {MarkdownModule} from "ngx-markdown";

@NgModule({
    declarations: [
        LoginComponent,
        RegistrationComponent,
        PasswordResetComponent,
        SettingsComponent,
        ProfileComponent,
        ValidationComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        authRouting,
        TranslateModule.forChild(),
        MomentModule,
        LMarkdownEditorModule,
        MarkdownModule.forChild()
    ],
    providers: []
})
/**
 * Auth module package
 */
export class AuthModule {

}