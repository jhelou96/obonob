import {Notification} from "./notification.model";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {AppService} from "../app.service";
import {Router} from "@angular/router";
import {Injectable} from "@angular/core";
import {User} from "../auth/user.model";

/**
 * Service for the notifications module
 */
@Injectable()
export class NotificationsService {
    constructor(
        private httpClient: HttpClient,
        private router: Router,
        private appService: AppService
    ) {}

    /**
     * Sends a request to the backend to retrieve user's list of notifications
     * @param {string} status Notifications status (read, unread or all)
     * @returns Retrieved notifications
     */
    getNotifications(status: string) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        return this.httpClient.get<Notification>(this.appService.appAddress + '/api/notifications/' + status + params)
            .map((response: any) => {
                const notifications = response.obj;
                let formattedNotifications: Notification[] = [];

                for(let notification of notifications)
                    formattedNotifications.push(
                        new Notification(
                            new User(notification.user.username, notification.user.password, notification.user.email, notification.user._id, notification.user.avatar),
                            new User(notification.sender.username, notification.sender.password, notification.sender.email, notification.sender._id, notification.sender.avatar),
                            notification.type,
                            notification.data,
                            notification.date,
                            notification.isRead
                        )
                    );

                return formattedNotifications;
            }).catch((error: HttpErrorResponse) => {
                return Observable.throw(error);
            });
    }

    /**
     * Marks notifications as read
     * @param {[number]} type Array of notification types
     * @param {string} data Notifications data that identifies the resource concerned with the notifications (Project address, thread ID)
     */
    markNotificationsAsRead(type: number[], data: string) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        const body = {type: type, data: data};
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.patch(this.appService.appAddress + '/api/notifications/' + params, body, {headers: headers})
            .catch((error: HttpErrorResponse) => {
                return Observable.throw(error);
            });
    }
}