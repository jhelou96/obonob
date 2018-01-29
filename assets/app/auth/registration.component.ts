import {Component, OnInit} from "@angular/core";
import {Title} from "@angular/platform-browser";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "./auth.service";
import {User} from "./user.model";
import {Router} from "@angular/router";

@Component({
    selector: 'app-auth-registration',
    templateUrl: './registration.component.html'
})
/**
 * Auth component for the registration process
 */
export class RegistrationComponent implements OnInit {
    registrationForm: FormGroup;

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

        // Registration form
        this.registrationForm = new FormGroup({
            username: new FormControl(null, Validators.required),
            email: new FormControl(null, [Validators.required, Validators.email]),
            password: new FormControl(null, Validators.required)
        })
    }

    /**
     * Method executed when registration form is submitted
     */
    register() {
        const user = new User(
            this.registrationForm.value.username,
            this.registrationForm.value.password,
            this.registrationForm.value.email
        );

        this.authService.register(user);

        this.registrationForm.reset();
    }

}