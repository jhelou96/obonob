import {Component, OnInit} from "@angular/core";
import {AppComponent} from "../app.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "./auth.service";
import {Title} from "@angular/platform-browser";
import {TranslateService} from "@ngx-translate/core";
import {Router} from "@angular/router";

@Component({
    selector: 'app-auth-passwordReset',
    templateUrl: './passwordReset.component.html'
})
/**
 * Auth component for the password reset process
 */
export class PasswordResetComponent implements OnInit {
    resetPasswordForm: FormGroup;

    /**
     * Random image picked from public/images/mascot folder
     */
    pageHeaderImage;

    constructor(
        private appComponent: AppComponent,
        private authService: AuthService,
        private titleService: Title,
        private translateService: TranslateService,
        private router: Router
    ) {}

    ngOnInit() {
        //If user is logged in, page can't be accessed
        if(this.authService.isLoggedIn())
            this.router.navigateByUrl('/');

        //Page title
        this.translateService.get('AUTH').subscribe((res: string) => {
            this.titleService.setTitle(res.PASSWORDRESET.passwordReset + " - " + this.appComponent.appName);
        });

        //Randomly chosen page image
        this.pageHeaderImage = this.appComponent.randomPageHeaderImage();

        //Form used to ask for a password reset
        this.resetPasswordForm = new FormGroup({
            emailOrUsername: new FormControl(null, Validators.required)
        });
    }

    /**
     * Sends a request to reset the user password once form is submitted
     */
    resetPassword() {
        this.authService.resetPasswordRequest(this.resetPasswordForm.value.emailOrUsername).subscribe(data => this.resetPasswordForm.reset());
    }
}