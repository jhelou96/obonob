import { Component } from "@angular/core";
import {Title} from "@angular/platform-browser";
import {AppComponent} from "../app.component";
import {ActivatedRoute} from "@angular/router";
import {ProjectsService} from "./projects.service";
import {AuthService} from "../auth/auth.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-projects-allProjects',
    templateUrl: './allProjects.component.html'
})
/**
 * Projects component listing all the projects and categories
 */
export class AllProjectsComponent {
    /**
     * All the projects hosted on the platform
     */
    projects;

    /**
     * Filtered projects based on the category chosen by the user
     */
    filteredProjects;

    /**
     * Random image picked from public/images/mascot folder
     */
    pageHeaderImage;

    /**
     * Current page
     * @type {number}
     */
    page = 1;

    /**
     * ID of the category currently being viewed by the user
     * Used to apply the CSS active class to the link badges
     */
    activeCategory = 1;

    constructor(
        private titleService: Title,
        private route: ActivatedRoute,
        private appComponent: AppComponent,
        private projectsService: ProjectsService,
        private authService: AuthService,
        private translateService: TranslateService
    ) {}

    ngOnInit() {
        //Page title
        this.translateService.get('PROJECTS.ALLPROJECTS').subscribe((res: any) => {
            this.titleService.setTitle(res.projects + " - " + this.appComponent.appName);
        });

        //Randomly chosen page image
        this.pageHeaderImage = this.appComponent.randomPageHeaderImage();

        //If user is logged in, update his notifications
        if(this.authService.isLoggedIn())
            this.appComponent.updateUserNotifications();

        //Retrieve all the projects
        this.projectsService.getProjects().subscribe(projects => {
            this.projects = projects;
            this.filteredProjects = this.appComponent.shuffle(projects);
        });
    }

    /**
     * Filters the project based on the category chosen by the user once category badge is clicked
     * @param {string} category Category chosen by the user
     * @param {number} idCategory Category badge ID used to update the badges 'active' class
     */
    onChangeCategory(category: string, idCategory: number) {
        //Refresh the list of projects
        this.filteredProjects = this.projects;

        //Filter based on the category
        if(category != 'all')
            this.filteredProjects = this.projects.filter(project => project.category ==  category);

        //Update badges active class
        this.activeCategory = idCategory
    }
}