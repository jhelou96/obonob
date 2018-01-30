import {Injectable} from "@angular/core";
import {HttpClient, HttpResponse, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {AlertService} from "../alerts/alert.service";
import {Category} from "./category.model";
import {Observable} from "rxjs/Observable";
import 'rxjs/add/operator/map';
import {Project} from "./project.model";

@Injectable()
/**
 * Service for the project module
 */
export class ProjectsService {
    constructor(private httpClient: HttpClient, private errorService: AlertService) {}
    private projects: Project[]; //Array containing the list of projects

    /**
     * Sends request to backend server to get the list of projects categories
     * @returns {Observable<any>}
     */
    getCategories() {
        return this.httpClient.get('http://localhost:3000/project/categories')
            .map((response: HttpResponse<Category>) => {
                const categories = response.obj;
                let formattedCategories: Category[] = [];

                for(let category of categories)
                    formattedCategories.push(new Category(category._id, category.name, category.description));

                return formattedCategories;
            }).catch((error: HttpErrorResponse) => {
                this.errorService.handleAlert("error", error.error.error);
                return Observable.throw(error);
            });
    }

    /**
     * Sends request to backend server to create a new project
     * @param {Project} project Project to be created
     * @returns {Observable<any>}
     */
    newProject(project: Project) {
        this.projects.push(project); //Push new project into array to save it temporarily

        //Send project to backend to be stored
        const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
        const body = JSON.stringify(project);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.post('http://localhost:3000/project' + token, body, {headers: headers})
            .catch((error: HttpErrorResponse) => {
                this.errorService.handleAlert("error", error.error.error);
                return Observable.throw(error);
            });
    }

    /**
     * Sends request to backend server to retrieve the list of projects of a user
     * @returns {Observable<any>}
     */
    getProjects() {
        const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
        return this.httpClient.get('http://localhost:3000/project/' + token)
            .map((response: HttpResponse<Project>) => {
                const projects = response.obj;
                let formattedProjects: Project[] = [];

                for(let project of projects)
                    formattedProjects.push(new Project(project.name, project.address, project.description, project.category));

                //Update current list of projects with the new list
                this.projects = formattedProjects;

                return formattedProjects;
            }).catch((error: HttpErrorResponse) => {
                this.errorService.handleAlert("error", error.error.error);
                return Observable.throw(error);
            });
    }
}