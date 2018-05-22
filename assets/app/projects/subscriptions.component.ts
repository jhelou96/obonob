import { Component } from "@angular/core";
import {Title} from "@angular/platform-browser";
import {AppComponent} from "../app.component";
import {ActivatedRoute} from "@angular/router";
import {ProjectsService} from "./projects.service";
import {User} from "../auth/user.model";
import {TranslateService} from "@ngx-translate/core";
import {AuthService} from "../auth/auth.service";
import {Project} from "./project.model";

@Component({
    selector: 'app-projects-subscriptions',
    templateUrl: './subscriptions.component.html'
})
export class SubscriptionsComponent {
    /**
     * User projects subscriptions
     */
    subscriptions;

    /**
     * User from whom we are retrieving the list of subscriptions
     * Data retrieved from his username provided in the URL
     */
    user;

    /**
     * Current page
     * @type {number}
     */
    page = 1;

    /**
     * Random image picked from public/images/mascot folder
     */
    pageHeaderImage;

    /**
     * Determines if the user visiting the page is the one that subscribed to the listed projects
     */
    isSubscriber = false;

    constructor(
        private titleService: Title,
        private route: ActivatedRoute,
        private appComponent: AppComponent,
        private projectsService: ProjectsService,
        private translateService: TranslateService,
        private authService: AuthService
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
                this.translateService.get('PROJECTS.SUBSCRIPTIONS').subscribe((res: any) => {
                    this.titleService.setTitle(params['user'] + " - " + res.subscriptions + " - " + res.projects + " - " + this.appComponent.appName);
                });

                //Retrieve user data from his username
                this.authService.getUser(params['user'], 'username').subscribe(
                    (user: User) => {
                        this.user = user;

                        //Retrieve user's activity related to all projects
                        this.projectsService.getUserSubscriptions(this.user.id).subscribe(subscriptions => this.subscriptions = subscriptions);
                    }
                );

                //Check if user visiting the page is the one that subscribed to the listed projects
                if(this.authService.isLoggedIn() && localStorage.getItem('userUsername') == params['user'])
                    this.isSubscriber = true;
            }
        );
    }

    /**
     * Allows user to unsubscribe to a project once button is clicked
     * @param {Project} project Project to unsubscribe from
     */
    onUnsubscribe(project: Project) {
        this.projectsService.unsubscribeFromProject(project).subscribe(
            () => {
                this.subscriptions = this.subscriptions.filter(function(subscription) {
                    return subscription.address != project.address;
                });
            }
        )
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