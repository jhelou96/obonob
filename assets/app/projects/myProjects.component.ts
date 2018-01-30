import {Component, OnInit} from "@angular/core";
import {AuthService} from "../auth/auth.service";
import {Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {ProjectsService} from "./projects.service";
import {Category} from "./category.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Project} from "./project.model";
import {AlertService} from "../alerts/alert.service";

declare var jquery:any;
declare var $ :any;

@Component({
    selector: 'app-projects-myProjects',
    templateUrl: './myProjects.component.html'
})
export class MyProjectsComponent implements OnInit {
    projects: Project[]; //Array of projects
    categories: Category[]; //Array of projects categories
    newProjectForm: FormGroup; //New project form

    constructor(private titleService: Title, private router: Router, private authService: AuthService, private projectsService: ProjectsService, private alertService: AlertService) {}

    /**
     * Method executed on initialization
     */
    ngOnInit() {
        //If user is not logged in, page can't be accessed
        if (!this.authService.isLoggedIn())
            this.router.navigateByUrl('/');

        //Page title
        this.titleService.setTitle('test');

        //List of projects
        this.projectsService.getProjects().subscribe(
            (projects: Project[]) => {
                this.projects = projects;
            }
        );

        //List of projects categories
        this.projectsService.getCategories().subscribe(
            (projectsCategories: Category[]) => {
                this.categories = projectsCategories;
            }
        );

        // New project form
        this.newProjectForm = new FormGroup({
            name: new FormControl(null, Validators.required),
            address: new FormControl(null, Validators.required),
            description: new FormControl(null, [Validators.required, Validators.maxLength(30)]),
            category: new FormControl(null, Validators.required)
        });
    }

    /**
     * Toggles modal when new project button is clicked
     */
    onNewProject() {
        $(".backdrop").fadeIn();
        $("#newProjectModal").fadeIn();
    }

    /**
     * Hides modal when close button is clicked
     */
    hideNewProjectModal() {
        $(".backdrop").fadeOut();
        $("#newProjectModal").fadeOut();
    }

    /**
     * Creates new projet once form is submitted
     */
    createNewProject() {
        const project = new Project(
            this.newProjectForm.value.name,
            this.newProjectForm.value.address,
            this.newProjectForm.value.description,
            this.newProjectForm.value.category
        );

        this.projectsService.newProject(project).subscribe();

        //Throw success notification
        this.alertService.handleAlert("success", 'Project created.');

        this.newProjectForm.reset();
        $(".backdrop").hide();
        $("#newProjectModal").hide();
    }
}