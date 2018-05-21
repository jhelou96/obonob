import { Component } from "@angular/core";
import {Title} from "@angular/platform-browser";
import {AppComponent} from "../app.component";
import {ActivatedRoute} from "@angular/router";
import {ProjectsService} from "./projects.service";
import {AuthService} from "../auth/auth.service";
import {User} from "../auth/user.model";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-projects-userProjects',
    templateUrl: './userProjects.component.html'
})
export class UserProjectsComponent {
    /**
     * User from whom we are retrieving the list of projects
     * Data retrieved from his username provided in the URL
     */
    user;

    /**
     * User projects
     */
    projects;

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
                this.translateService.get('PROJECTS.USERPROJECTS').subscribe((res: string) => {
                    this.titleService.setTitle(params['user'] + " - Projects - " + this.appComponent.appName);
                });

                //Retrieve user data from his username
                this.authService.getUser(params['user'], 'username').subscribe(
                    (user: User) => {
                        this.user = user;

                        //Retrieve user's projects
                        this.projectsService.getUserProjects(this.user.id).subscribe(projects => this.projects = projects);
                    }
                );
            }
        );
    }
}