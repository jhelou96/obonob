import {Component, OnInit} from "@angular/core";
import {Title} from "@angular/platform-browser";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "./auth.service";
import {User} from "./user.model";
import {Router} from "@angular/router";
import {AppComponent} from "../app.component";
import {TranslateService} from "@ngx-translate/core";
import {AppService} from "../app.service";

declare var jquery:any;
declare var $ :any;

@Component({
    selector: 'app-auth-registration',
    templateUrl: './registration.component.html'
})
/**
 * Auth component for the registration process
 */
export class RegistrationComponent implements OnInit {
    /**
     * Form used to register
     */
    registrationForm: FormGroup;

    /**
     * Random image picked from public/images/mascot folder
     */
    pageHeaderImage;

    constructor(
        private appService: AppService,
        private titleService: Title,
        private authService: AuthService,
        private router: Router,
        private appComponent: AppComponent,
        private translateService: TranslateService
    ) {}

    /**
     * Method executed on initialization
     */
    ngOnInit() {
        //Randomly chosen page image
        this.pageHeaderImage = this.appComponent.randomPageHeaderImage();

        //Page title
        this.translateService.get('AUTH.REGISTRATION').subscribe((res: string) => {
            this.titleService.setTitle(res.signUp + " - " +this.appComponent.appName);
        });

        //If user is logged in, page can't be accessed
        if(this.isLoggedIn())
            this.router.navigateByUrl('/');

        // Registration form
        this.registrationForm = new FormGroup({
            username: new FormControl(null, Validators.required),
            email: new FormControl(null, [Validators.required, Validators.email]),
            password: new FormControl(null, Validators.required)
        })
    }

    /**
     * Method executed after view is loaded
     */
    ngAfterViewInit() {
        //Import SVG animated icons scripts
        $.getScript( "/LivIconsEvo/js/tools/DrawSVGPlugin.min.js" );
        $.getScript( "/LivIconsEvo/js/tools/MorphSVGPlugin.min.js" );
        $.getScript( "/LivIconsEvo/js/tools/verge.min.js" );
        $.getScript( "/LivIconsEvo/js/LivIconsEvo.defaults.js" );
        $.getScript( "/LivIconsEvo/js/LivIconsEvo.min.js" );
    }

    /**
     * Checks if user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        return this.authService.isLoggedIn();
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

        this.authService.register(user).subscribe();

        this.registrationForm.reset();
    }

}