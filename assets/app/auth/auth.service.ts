import {User} from "./user.model";
import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {AlertService} from "../alerts/alert.service";
import {Router} from "@angular/router";
import {JwtHelper} from "angular2-jwt";
import {Project} from "../projects/project.model";
import {AppService} from "../app.service";
import {TranslateService} from "@ngx-translate/core";

@Injectable()
/**
 * Service for the authentication module
 */
export class AuthService {
    /**
     * Translator for success and error messages
     */
    translate;

    constructor(
        private httpClient: HttpClient,
        private alertService: AlertService,
        private router: Router,
        private appService : AppService,
        private translateService: TranslateService
    ) {
        this.translateService.get('AUTH').subscribe((res: string) => {
            this.translate = res;
        });
    }

    /**
     * Sends user data to the backend for registration purposes
     * @param {User} user User to be registered
     * @returns Added user
     */
    register(user: User) {
        const body = JSON.stringify(user);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.post(this.appService.appAddress + '/api/auth/register', body, {headers: headers})
            .map((response: HttpResponse<User>) => {
                //Throw success notification
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.accountCreated);

                return response.obj;
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to activate a user account based on the key provided
     * @param {string} key Validation key (User ID)
     * @returns Validated user
     */
    activateUserAccount(key: string) {
        return this.httpClient.get(this.appService.appAddress + '/api/auth/validation/registration/' + key)
            .map((response: HttpResponse<Project>) => {
                return this.populateUser(response.obj);
            }).catch((error: HttpErrorResponse) => {
                this.router.navigateByUrl('/');
                return Observable.throw(error);
            });
    }

    /**
     * Sends a confirmation email to the user before he can resets his password
     * @param {string} user User's username or email
     * @returns Retrieved user
     */
    resetPasswordRequest(user: string) {
        const body = {user: user};
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.post(this.appService.appAddress + '/api/auth/reset-password', body, {headers: headers})
            .map((response: HttpResponse<User>) => {
                //Throw success notification
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.confirmationMailSent + response.obj.email + ".");

                return this.populateUser(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to remove a validation key from the DB
     * @param {string} key Key to be removed
     * @returns User to whom the key belonged
     */
    removeValidationKey(key: string) {
        return this.httpClient.delete(this.appService.appAddress + '/api/auth/validation/' + key)
            .catch((error: HttpErrorResponse) => {
                return Observable.throw(error);
            });
    }

    /**
     * Sends user credentials to the backend to check their validity
     * @param {User} user User to be logged in
     * @param {number} flag Flag used for unsecure login (to login the user without his password)
     * @returns Retrieved user
     */
    login(user: User, flag?: number) {
        //Send some params to the server
        const params = (flag ? '?unsecure=1' : '');

        const body = JSON.stringify(user);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.post(this.appService.appAddress + '/api/auth/login/' + params, body, {headers: headers})
            .map((response: HttpResponse<Project>) => {
                localStorage.setItem('token', response.token); //Store generated token locally
                localStorage.setItem('userId', response.obj._id); //Store user id locally
                localStorage.setItem('userUsername', response.obj.username); //Store user username locally

                return this.populateUser(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Clears stored token and id to logout user
     */
    logout() {
        //Unmap socket and user before logout
        this.appService.unmapUserFromSocket().subscribe(
            (data:any) => {
                localStorage.clear();
                //this.router.navigateByUrl('/');
        });
    }

    /**
     * Checks if user is logged in
     */
    isLoggedIn() {
        const jwtHelper = new JwtHelper();
        return (localStorage.getItem('token') !== null && !jwtHelper.isTokenExpired(localStorage.getItem('token')))
    }

    /**
     * Sends a request to the backend to retrieve user's data
     * @param {string} user User's username or ID
     * @param {string} search 'username' to search for user based on his username, 'id' to search based on his ID, 'key' to search based on a uniquely generated key for
     * @returns Retrieved user
     */
    getUser(user: string, search: string) {
        //Send some params to the server
        const params = '?search=' + search;

        return this.httpClient.get(this.appService.appAddress + '/api/auth/' + user + params)
            .map((response: HttpResponse<Project>) => {
                return this.populateUser(response.obj);
            }).catch((error: HttpErrorResponse) => {
                if(error.status == 404)
                    this.router.navigateByUrl('/');
                return Observable.throw(error);
            });
    }

    /**
     * Sends request to the backend to retrieve all the users
     * @returns Users
     */
    getUsers() {
        return this.httpClient.get(this.appService.appAddress + '/api/auth/')
            .map((response: HttpResponse<User>) => {
                let users: User[] = [];

                for(let user of response.obj)
                    users.push(this.populateUser(user));

                return users;
            }).catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to updated user's data
     * @param {User} user User to be updated
     * @returns Updated user
     */
    updateUserSettings(user: User) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        const body = JSON.stringify(user);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.patch(this.appService.appAddress + '/api/auth/' + params, body, {headers: headers})
            .map((response: HttpResponse<Thread>) => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.settingsUpdated); //Success message

                return this.populateUser(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Populates a user based on the frontend model
     * @param response Backend response from query containing user's data
     * @returns {User} Frontend user
     */
    populateUser(response) {
        var user = new User(
            response.username,
            response.password,
            response.email,
            response._id,
            response.avatar,
            response.level,
            response.biography,
            response.keys,
            new Date(response.registrationDate),
            new Date(response.lastActionDate)
        );

        return user;
    }
}