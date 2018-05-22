import {Component, OnInit} from "@angular/core";
import {AuthService} from "./auth.service";
import {AppComponent} from "../app.component";
import {Title} from "@angular/platform-browser";
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute, Router} from "@angular/router";
import {AppService} from "../app.service";

@Component({
    selector: 'app-auth-validation',
    templateUrl: './validation.component.html'
})
/**
 * Auth component used for the email validation process
 * Component can be accessed only if valid key is provided which is randomly generated and sent to the user by mail
 * If key is valid, 2 operations can be performed:
 * 1 --> Validate email address after registration which will allow user to login
 * 2 --> After password reset request, user will be logged in so he can change his password
 */
export class ValidationComponent implements OnInit {
    /**
     * Random image picked from public/images/mascot folder
     */
    pageHeaderImage;

    /**
     * User data retrieved based on the key provided
     * Null if wrong key
     */
    user = null;

    /**
     * Validation process executed
     * Account validation
     * Password reset
     */
    action;

    constructor(
        private route: ActivatedRoute,
        private appComponent: AppComponent,
        private router: Router,
        private translateService: TranslateService,
        private titleService: Title,
        private authService: AuthService,
        private appService: AppService
    ) {}

    ngOnInit() {
        //If user is logged in, he can't access the page
        if(this.authService.isLoggedIn())
            this.router.navigateByUrl('/');

        //Randomly chosen page image
        this.pageHeaderImage = this.appComponent.randomPageHeaderImage();

        //Page title
        this.translateService.get('AUTH.VALIDATION').subscribe((res: any) => {
            this.titleService.setTitle(res.accountValidation + " - " + this.appComponent.appName);
        });

        //Retrieve URL params
        this.route.params.subscribe(params => {
            this.action = params['action'];

            //If verification key is used to activate user's account
            if(params['action'] == 'registration')
                this.authService.activateUserAccount(params['key']).subscribe(user => this.user = user);
            else if(params['action'] == 'reset-password') { //If verification key is used to reset user password
                this.authService.getUser(params['key'], 'key').subscribe(user => {
                    this.user = user;

                    //Unsecure login --> User is logged in without using his password so he can update his password from his settings
                    this.authService.login(user, 1).subscribe(user => {
                        this.appService.mapUserToSocket().subscribe(); //Map user to socket

                        this.appComponent.user = user; //Save user data
                        this.appComponent.updateUserNotifications(); //Load user notifications

                        this.authService.removeValidationKey(params['key']).subscribe(); //Remove validation key since it is of no use anymore
                    });
                });
            }
            else //If verification key is used for an invalid action
                this.router.navigateByUrl('/');

        });
    }
}