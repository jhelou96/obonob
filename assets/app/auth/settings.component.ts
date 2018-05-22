import {Component, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "./auth.service";
import {User} from "./user.model";
import {AlertService} from "../alerts/alert.service";
import {AppComponent} from "../app.component";
import {Title} from "@angular/platform-browser";
import {TranslateService} from "@ngx-translate/core";
import {Router} from "@angular/router";

@Component({
    selector: 'app-auth-settings',
    templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
    /**
     * Form used to updated settings
     */
    settingsForm: FormGroup;

    /**
     * User data
     */
    user: User;

    /**
     * Markdown editor options
     */
    markdownEditorOptions = {
        "hideIcons": ['TogglePreview', 'FullScreen']
    };

    /**
     * Translator
     */
    translate;

    /**
     * Random image picked from public/images/mascot folder
     */
    pageHeaderImage;

    constructor(
        private authService: AuthService,
        private alertService: AlertService,
        private appComponent: AppComponent,
        private titleService: Title,
        private translateService: TranslateService,
        private router: Router
    ) {}

    ngOnInit() {
        //If user is not logged in, he can't access the page
        if(!this.appComponent.isLoggedIn())
            this.router.navigateByUrl('/auth/login');

        //Randomly chosen page image
        this.pageHeaderImage = this.appComponent.randomPageHeaderImage();

        //Page title
        this.translateService.get('AUTH').subscribe((res: any) => {
            this.translate = res;
            this.titleService.setTitle(res.SETTINGS.settings + " - " + this.appComponent.appName);
        });

        //Update user's notifications
        this.appComponent.updateUserNotifications();

        //Retrieve user data
        this.user = this.appComponent.user;

        this.settingsForm = new FormGroup({
            username: new FormControl(this.user.username, Validators.required),
            password: new FormControl(null),
            confirmation: new FormControl(null),
            email: new FormControl(this.user.email, Validators.required),
            avatar: new FormControl(this.user.avatar),
            biography: new FormControl(this.user.biography)
        });
    }

    /**
     * Updates user settings once form is submitted
     */
    updateSettings() {
        this.user.email = this.settingsForm.value.email;
        this.user.avatar = this.settingsForm.value.avatar;
        this.user.biography = this.settingsForm.value.biography;

        //If user wants to change his password
        if(this.settingsForm.value.password) {
            if(this.settingsForm.value.password == this.settingsForm.value.confirmation)
                this.user.password = this.settingsForm.value.password;
            else {
                this.alertService.handleAlert('error', this.translate.ALERT.ERROR.passwordAndConfirmationDoesNotMatch)
                return null; //Stop function execution
            }
        }

        this.authService.updateUserSettings(this.user).subscribe(user => this.user = user);
    }
}