import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {AlertService} from "../alerts/alert.service";
import {Router} from "@angular/router";
import {Thread, ThreadMessage} from "./thread.model";
import {AppService} from "../app.service";
import {TranslateService} from "@ngx-translate/core";
import {User} from "../auth/user.model";

@Injectable()
/**
 * Service for the authentication module
 */
export class MessagingService {
    /**
     * Translator for success and error messages received from backend server
     */
    translate;

    constructor(
        private httpClient: HttpClient,
        private appService: AppService,
        private alertService: AlertService,
        private router: Router,
        private translateService: TranslateService
    ) {
        this.translateService.get('MESSAGING').subscribe((res: string) => {
            this.translate = res;
        });
    }

    /**
     * Sends a request to the backend to create a new thread
     * @param {Thread} thread Thread to be created
     * @returns Added thread
     */
    newThread(thread: Thread) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        const body = JSON.stringify(thread);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.post(this.appService.appAddress + '/api/messaging/' + params, body, {headers: headers})
            .map((response: HttpResponse<Thread>) => {
                this.router.navigateByUrl('/messaging/' + response.obj._id); //Redirect user to thread
            }).catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to add a new message to a thread
     * @param {Thread} thread Thread to which message is added
     * @param {ThreadMessage} message Message to be added
     * @returns Updated thread
     */
    newThreadMessage(thread: Thread, message: ThreadMessage) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        const body = JSON.stringify(message);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.post(this.appService.appAddress + '/api/messaging/' + thread.id + params, body, {headers: headers})
            .map((response: HttpResponse<Thread>) => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.newMessagePosted); //Throw success notification

                thread = this.populateThread(response.obj);
                return thread;
            }).catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to add a new participant to the thread
     * @param {Thread} thread Thread to be updated
     * @param {string} participant Username of the participant to be added to the thread
     * @returns Updated thread
     */
    addParticipant(thread: Thread, participant: string) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        const body = '{"participant": "' + participant + '"}';
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.post(this.appService.appAddress + '/api/messaging/' + thread.id + '/participants/' + params, body, {headers: headers})
            .map((response: HttpResponse<Thread>) => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.newParticipantAdded); //Throw success notification

                thread = this.populateThread(response.obj);
                return thread;
            }).catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to remove a user from the thread's list of participants
     * @param {Thread} thread Thread to be updated
     * @returns Updated thread
     */
    removeParticipant(thread: Thread) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        return this.httpClient.delete(this.appService.appAddress + '/api/messaging/' + thread.id + '/participants/' + params)
            .map((response: HttpResponse<Thread>) => {
                this.router.navigateByUrl('/messaging');
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends request to the backend to retrieve user's discussion threads
     * @returns User's discussion threads
     */
    getDiscussionThreads() {
        //Send to server the socket ID and the user token so it can map the socket to the user
        const params = '?socketId=' + this.appService.socketId + (localStorage.getItem('token') ? '&token=' + localStorage.getItem('token') : '');

        return this.httpClient.get(this.appService.appAddress + '/api/messaging/' + params)
            .map((response: HttpResponse<Thread>) => {
                let threads : Thread[] = [];
                for(let thread of response.obj) {
                    thread = this.populateThread(thread);
                    threads.push(thread);
                }

                return threads;
            }).catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to retrieve user's specific thread
     * @param {string} id ID of the thread to be retrieved
     * @returns Retrieved thread
     */
    getThread(id: string) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        return this.httpClient.get(this.appService.appAddress + '/api/messaging/' + id + params)
            .map((response: HttpResponse<Thread>) => {
                return this.populateThread(response.obj);
            }).catch((error: HttpErrorResponse) => {
                this.router.navigateByUrl('/messaging');
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to update user's last seen on specific thread
     * @param {Thread} thread Thread to be updated
     * @returns Updated thread
     */
    updateUserLastSeen(thread: Thread) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.patch(this.appService.appAddress + '/api/messaging/' + thread.id + '/lastseen/' + params, null, {headers: headers})
            .map((response: HttpResponse<Thread>) => {
                return this.populateThread(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Populates a thread based on the frontend model
     * @param response Backend response
     * @returns {Thread} Frontend model thread
     */
    populateThread(response) {
        var participants = []; //List of participants
        var isRead = true; //If user has seen the thread since the last update
        for(let participant of response.participants) {
            participants.push(new User(participant.user.username, participant.user.password, participant.user.email, participant.user._id, participant.user.avatar);

            //Check if user has seen the message since the last message was posted
            if(participant.user._id == localStorage.getItem('userId')) {
                var lastSeen = new Date(participant.lastSeen);
                var lastMsg = new Date(response.messages[0].date);
                if(lastSeen.getTime() < lastMsg.getTime())
                    isRead = false;
            }
        }

        //List of messages
        var messages : ThreadMessage[] = [];
        for(let message of response.messages)
            messages.push(new ThreadMessage(message.content, new User(message.author.username, message.author.password, message.author.email, message.author._id, message.author.avatar), message.date));

        var thread = new Thread(
            response.subject,
            participants,
            messages,
            new User(response.author.username, response.author.password, response.author.email, response.author._id, response.author.avatar),
            response._id,
            isRead
        );

        return thread;
    }
}