import {Component, OnInit} from "@angular/core";
import {Title} from "@angular/platform-browser";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {User} from "./user.model";
import {AuthService} from "./auth.service";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {AppComponent} from "../app.component";
import {AppService} from "../app.service";

@Component({
    selector: 'app-auth-login',
    templateUrl: './login.component.html'
})
/**
 * Auth component for the login process
 */
export class LoginComponent implements OnInit {
    /**
     * Form used to login user
     */
    loginForm: FormGroup;

    /**
     * Random image picked from public/images/mascot folder
     */
    pageHeaderImage;

    constructor(
        private appService: AppService,
        private titleService: Title,
        private authService: AuthService,
        private router: Router,
        private translateService: TranslateService,
        private appComponent: AppComponent
    ) {}

    ngOnInit() {
        //Randomly chosen page image
        this.pageHeaderImage = this.appComponent.randomPageHeaderImage();

        //Page title
        this.translateService.get('AUTH.LOGIN').subscribe((res: any) => {
            this.titleService.setTitle(res.signIn + " - " + this.appComponent.appName);
        });

        //If user is logged in, page can't be accessed
        if(this.authService.isLoggedIn())
            this.router.navigateByUrl('/');

        // Login form
        this.loginForm = new FormGroup({
            username: new FormControl(null, Validators.required),
            password: new FormControl(null, Validators.required)
        });
    }

    /**
     * Method executed when login form is submitted
     */
    login() {
        const user = new User(
            this.loginForm.value.username,
            this.loginForm.value.password
        );

        this.authService.login(user).subscribe(
            //Returned user data
            user => {
                this.appService.mapUserToSocket().subscribe(); //Map user to socket

                this.appComponent.user = user; //Save user data

                this.router.navigateByUrl('/'); //Redirect user to home page
            }
        );

        this.loginForm.reset();
    }
}