import { Component } from "@angular/core";
import {Title} from "@angular/platform-browser";
import {AppComponent} from "../app.component";
import {ActivatedRoute} from "@angular/router";
import {ProjectsService} from "./projects.service";
import {AuthService} from "../auth/auth.service";
import {User} from "../auth/user.model";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-projects-activity',
    templateUrl: './activity.component.html'
})
/**
 * Projects component displaying user's activity on projects
 */
export class ActivityComponent {
    /**
     * User from whom we are retrieving the list of posts, reviews and replies on projects
     * Data retrieved from his username provided in the URL
     */
    user;

    /**
     * User activity related to all the projects (posts, replies, reviews)
     */
    activity;

    /**
     * Current page
     * @type {number}
     */
    page = 1;

    /**
     * Random image picked from public/images/mascot folder
     */
    pageHeaderImage;

    constructor(
        private titleService: Title,
        private route: ActivatedRoute,
        private appComponent: AppComponent,
        private projectsService: ProjectsService,
        private authService: AuthService,
        private translateService: TranslateService
    ) {}

    ngOnInit() {
        //Randomly chosen page image
        this.pageHeaderImage = this.appComponent.randomPageHeaderImage();

        //If user is logged in, update his notifications
        if(this.authService.isLoggedIn())
            this.appComponent.updateUserNotifications();

        //Retrieve user username from URL
        this.route.params.subscribe(
            params => {
                //Page title
                this.translateService.get('PROJECTS.ACTIVITY').subscribe((res: any) => {
                    this.titleService.setTitle(params['user'] + " - " + res.activity + " - " + res.projects + " - " + this.appComponent.appName);
                });

                //Retrieve user data from his username
                this.authService.getUser(params['user'], 'username').subscribe(
                    (user: User) => {
                        this.user = user;

                        //Retrieve user's activity related to all projects
                        this.projectsService.getUserActivity(this.user.id).subscribe(activity => this.activity = activity);
                    }
                );
            }
        );
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
}