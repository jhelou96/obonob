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

    /**
     * Asks backend server to get the list of projects categories
     * @returns {Observable<any>} Array of categories or throws an error
     */
    getCategories() {
        return this.httpClient.get('http://localhost:3000/project/list-categories')
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

    newProject(project: Project) {
        const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
        const body = JSON.stringify(project);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.post('http://localhost:3000/project' + token, body, {headers: headers})
            .catch((error: HttpErrorResponse) => {
                this.errorService.handleAlert("error", error.error.error);
                return Observable.throw(error);
            });
    }
}