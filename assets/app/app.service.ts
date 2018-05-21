import {Injectable} from "@angular/core";
import * as io from 'socket.io-client';
import {Notification} from "./notifications/notification.model";
import {Observable} from "rxjs/Observable";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from "@angular/common/http";
import {Project} from "./projects/project.model";
import {User} from "./auth/user.model";

@Injectable()
/**
 * Main service for the app
 */
export class AppService {
    /**
     * App address used for the API calls
     */
    appAddress = "http://localhost:3000";

    /**
     * Server socket ID used to map a user to a server socket
     */
    socketId = "";

    /**
     * Client socket
     */
    socket: SocketIOClient.Socket;

    constructor(private httpClient: HttpClient) {
        this.socket = io.connect();
    }

    /**
     * Sends request to backend server to retrieve the list of projects
     * Method is used here and not in projects module because projects module is lazy loaded
     * @returns List of projects
     */
    getProjects() {
        return this.httpClient.get(this.appAddress + '/api/projects')
            .map((response: HttpResponse<Project>) => {
                let projects: Project[] = [];
                for(let project of response.obj) {
                    projects.push(project);
                }

                return projects;
            }).catch((error: HttpErrorResponse) => {
                return Observable.throw(error);
            });
    }

    /**
     * Gets notification sent from the server in real time through socket.io
     * @returns Received notification
     */
    getNotification() {
        return Observable.create(observer => {
            this.socket.on('notification', (data: any) => {
                var notification = new Notification(
                    new User(data.user.username, data.user.password, data.user.email, data.user._id, data.user.avatar),
                    new User(data.sender.username, data.sender.password, data.sender.email, data.sender._id, data.sender.avatar),
                    data.type,
                    data.data,
                    data.date,
                    data.isRead
                );

                observer.next(notification);
            });
        });
    }

    /**
     * Gets server socket ID once socket connection is established with the backend
     * @returns Returned socket ID
     */
    getSocketId() {
        return Observable.create(observer => {
            this.socket.on('socketId', (data: any) => {
                this.socketId = data;

                observer.next(data);
            });
        });
    }

    /**
     * Maps a logged in user to a socket ID in order to be able to communicate with specific users
     */
    mapUserToSocket() {
        //Send to server the socket ID and the user token so it can map the socket to the user
        const params = '?socketId=' + this.socketId + (localStorage.getItem('token') ? '&token=' + localStorage.getItem('token') : '');

        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.post(this.appAddress + '/api/socket/' + params, null, {headers: headers});
    }

    /**
     * Deletes user/socket mapping on user logout
     */
    unmapUserFromSocket() {
        //Send to server the socket ID and the user token so it can map the socket to the user
        const params = '?socketId=' + this.socketId + (localStorage.getItem('token') ? '&token=' + localStorage.getItem('token') : '');

        return this.httpClient.delete(this.appAddress + '/api/socket/' + params);
    }
}