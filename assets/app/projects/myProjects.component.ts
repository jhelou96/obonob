import {Component, OnInit} from "@angular/core";
import {AuthService} from "../auth/auth.service";
import {Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {ProjectsService} from "./projects.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Project} from "./project.model";
import {AppComponent} from "../app.component";
import {TranslateService} from "@ngx-translate/core";
import {AppService} from "../app.service";

declare var jquery:any;
declare var $ :any;

@Component({
    selector: 'app-projects-myProjects',
    templateUrl: './myProjects.component.html'
})
/**
 * Projects component serving as a dashboard for user's projects
 */
export class MyProjectsComponent implements OnInit {
    /**
     * Array of projects
     */
    projects: Project[];

    /**
     * Form used to create a new project
     */
    newProjectForm: FormGroup;

    /**
     * User activity related to all the projects (reviews, posts, replies)
     */
    activity;

    /**
     * User's username
     */
    userUsername = localStorage.getItem('userUsername');

    /**
     * User projects subscriptions
     * Array of projects the user subscribed to
     */
    subscriptions;

    /**
     * Random image picked from public/images/mascot folder
     */
    pageHeaderImage;

    constructor(
        private appService: AppService,
        private titleService: Title,
        private router: Router,
        private authService: AuthService,
        private projectsService: ProjectsService,
        private appComponent: AppComponent,
        private translateService: TranslateService
    ) {}

    ngOnInit() {
        //Page title
        this.translateService.get('PROJECTS.MYPROJECTS').subscribe((res: any) => {
            this.titleService.setTitle(res.myProjects + " - " + res.projects + " - " + this.appComponent.appName);
        });

        //Randomly chosen page image
        this.pageHeaderImage = this.appComponent.randomPageHeaderImage();

        //If user is not logged in, page can't be accessed
        if (!this.isLoggedIn())
            this.router.navigateByUrl('/');
        else
            this.appComponent.updateUserNotifications(); //Update user notifications

        //List of projects
        this.projectsService.getUserProjects(localStorage.getItem('userId')).subscribe(
            (projects: Project[]) => {
                this.projects = projects;
            }
        );

        //User activity related to projects (posts, replies, reviews)
        this.projectsService.getUserActivity(localStorage.getItem('userId')).subscribe(
            activity => this.activity = activity
        );

        //User subscriptions
        this.projectsService.getUserSubscriptions(localStorage.getItem('userId')).subscribe(
            projects => this.subscriptions = projects
        );

        // New project form
        this.newProjectForm = new FormGroup({
            name: new FormControl(null, Validators.required),
            address: new FormControl(null, [Validators.required]),
            description: new FormControl(null, [Validators.required, Validators.maxLength(30)]),
            category: new FormControl(null, Validators.required)
        });
    }

    /**
     * Checks if user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        return this.authService.isLoggedIn();
    }

    /**
     * Toggles modal when new project button is clicked
     */
    onNewProject() {
        $("#newProjectModal").css("z-index", "1500");
        $("#newProjectModal").modal({backdrop: true});
    }

    /**
     * Hides modal when close button is clicked
     */
    onHideNewProjectModal() {
        $("#newProjectModal").modal('hide');
    }

    /**
     * Creates new projet once form is submitted
     */
    newProject() {
        const project = new Project(
            this.newProjectForm.value.name,
            this.newProjectForm.value.address,
            this.newProjectForm.value.description,
            this.newProjectForm.value.category
        );

        this.projectsService.addProject(project).subscribe(project => {
            //Update list of projects with newly added project
            this.projects.push(project);

            //If project was created successfully, reset form
            this.newProjectForm.reset();
            $("#newProjectModal").modal('hide');
        });
    }

    /**
     * Removes a project once button is clicked
     * @param {Project} project Project to be removed
     */
    onRemoveProject(project: Project) {
        this.translateService.get('PROJECTS').subscribe((res: any) => {
            if(confirm(res.ALERT.CONFIRMATION.removeProject)) {
                this.projectsService.removeProject(project).subscribe(
                    data => {
                        //Remove project from global array of projects
                        for (var i = 0; i < this.projects.length; i++) {
                            if (this.projects[i].address == project.address)
                                this.projects.splice(i, 1);
                        }
                    }
                );
            }
        });
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
}