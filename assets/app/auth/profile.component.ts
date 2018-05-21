import {Component, OnInit} from "@angular/core";
import {User} from "./user.model";
import {AuthService} from "./auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {TranslateService} from "@ngx-translate/core";
import {AppComponent} from "../app.component";

declare var jquery:any;
declare var $ :any;

@Component({
    selector: 'app-auth-profile',
    templateUrl: './profile.component.html'
})
/**
 * Auth component used to display a member's profile
 */
export class ProfileComponent implements OnInit {
    /**
     * Data of the user of whom the profile is being visited
     * Retrieved from his username in the URL
     */
    user: User;

    /**
     * Random image picked from public/images/mascot folder
     */
    pageHeaderImage;

    constructor(
        private route: ActivatedRoute,
        private authService: AuthService,
        private titleService: Title,
        private translateService: TranslateService,
        private appComponent: AppComponent,
        private router: Router
    ) {}

    ngOnInit() {
        //Randomly chosen page image
        this.pageHeaderImage = this.appComponent.randomPageHeaderImage();

        //Retrieve user username from URL
        this.route.params.subscribe(params => {
            //Page title
            this.translateService.get('AUTH.PROFILE').subscribe((res: string) => {
                this.titleService.setTitle(params['username'] + " - " + res.members + " - " + this.appComponent.appName);
            });

            //Get user data based on his username
            this.authService.getUser(params['username'], 'username').subscribe(user => {
                this.user = user;
            });
        });

        //If user visiting the page is logged in --> Update his notifications
        if(this.authService.isLoggedIn())
            this.appComponent.updateUserNotifications();
    }

    ngAfterViewInit() {
        //Import SVG animated icons scripts
        $.getScript( "/LivIconsEvo/js/tools/DrawSVGPlugin.min.js" );
        $.getScript( "/LivIconsEvo/js/tools/MorphSVGPlugin.min.js" );
        $.getScript( "/LivIconsEvo/js/tools/verge.min.js" );
        $.getScript( "/LivIconsEvo/js/LivIconsEvo.defaults.js" );
        $.getScript( "/LivIconsEvo/js/LivIconsEvo.min.js" );
    }

    /**
     * Computes the difference in days between the current datetime and a specific one
     * @param date Date to which threshold is applied
     * @returns {number} Number of days
     */
    dateThreshold(date) {
        const formattedDate = new Date(date);
        return ((Date.now() - formattedDate.getTime()) / (1000*3600 * 24));
    }

    /**
     * Checks if user is online
     * If lastActionDate < 5 min (300 000 ms): User is online
     */
    isOnline() {
        if(this.user.lastActionDate.getTime() > (new Date().getTime() - 300000))
            return true;

        return false;
    }
}