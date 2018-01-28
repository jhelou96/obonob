import {User} from "./user.model";
import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {AlertService} from "../alerts/alert.service";

@Injectable()
/**
 * Service for the authentication module
 */
export class AuthService {
    constructor(private httpClient: HttpClient, private errorService: AlertService) {}

    /**
     *  Sends user data to the backend for registration purposes
     * @param {User} user User to be registered
     * @returns {Observable<any>} if any error is thrown
     */
    register(user: User) {
        const body = JSON.stringify(user);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.post('http://localhost:3000/user/register', body, {headers: headers})
            .catch((error: HttpErrorResponse) => {
                this.errorService.handleAlert("error", error.error.error);
                return Observable.throw(error);
            });
    }

    /**
     *  Sends user credentials to the backend to check their validity
     * @param {User} user User to be logged in
     * @returns {Observable<any>} if any error is thrown
     */
    login(user: User) {
        const body = JSON.stringify(user);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.post('http://localhost:3000/user/login', body, {headers: headers})
            .catch((error: HttpErrorResponse) => {
                this.errorService.handleAlert("error", error.error.error);
                return Observable.throw(error);
            });
    }

    /**
     * Clears stored token and id to logout user
     */
    logout() {
        localStorage.clear();
    }

    /**
     * Checks if user is logged in
     */
    isLoggedIn() {
        return localStorage.getItem('token') !== null;
    }
}