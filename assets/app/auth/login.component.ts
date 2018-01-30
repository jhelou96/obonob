import {Component, OnInit} from "@angular/core";
import {Title} from "@angular/platform-browser";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {User} from "./user.model";
import {AuthService} from "./auth.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-auth-login',
    templateUrl: './login.component.html'
})
/**
 * Auth component for the login process
 */
export class LoginComponent implements OnInit {
    loginForm: FormGroup;

    constructor(private titleService: Title, private authService: AuthService, private router: Router) {}

    /**
     * Method executed on initialization
     */
    ngOnInit() {
        //If user is logged in, page can't be accessed
        if(this.authService.isLoggedIn())
            this.router.navigateByUrl('/');

        // Page title
        this.titleService.setTitle('test');

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
            //If data is returned
            data => {
                localStorage.setItem('token', data.token); //Store generated token locally
                localStorage.setItem('userId', data.userId); //Store user id locally
                this.router.navigateByUrl('/'); //Redirect user to home page
            }
        );

        this.loginForm.reset();
    }
}