import {Component, OnInit} from "@angular/core";
import {MessagingService} from "./messaging.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Thread, ThreadMessage} from "./thread.model";
import {Title} from "@angular/platform-browser";
import {AppComponent} from "../app.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {User} from "../auth/user.model";
import {AuthService} from "../auth/auth.service";
import {Observable} from "rxjs/Observable";
import {map, startWith} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";
import {NotificationsService} from "../notifications/notifications.service";

declare var jquery:any;
declare var $ :any;

@Component({
    selector: 'app-messaging-thread',
    templateUrl: './thread.component.html'
})
/**
 * Messaging component for the discussion threads
 */
export class ThreadComponent implements OnInit {
    /**
     * List of filtered users used to provide the user with an autocompletion list when creating a new thread and specifying a recipient
     */
    filteredUsers: Observable<any[]>;

    /**
     * List of all users registered in the system
     */
    users : User[];

    /**
     * Thread data retrieved from its ID
     */
    thread: Thread;

    /**
     * Form used to submit a new reply to the thread
     */
    newThreadMessageForm: FormGroup;

    /**
     * Form used to add a new participant to the thread
     */
    addParticipantForm: FormGroup;

    /**
     * FormControl for the addParticipantForm
     */
    participantsCtrl : FormControl = new FormControl();

    /**
     * Markdown editor options
     */
    markdownEditorOptions = {
        "hideIcons": ['TogglePreview', 'FullScreen']
    };

    /**
     * Checks if user is the thread author
     */
    isAuthor : boolean;

    /**
     * Current page
     * @type {number}
     */
    page = 1;

    /**
     * Random image picked from public/images/mascot folder
     */
    pageHeaderImage;

    constructor(
        private messagingService : MessagingService,
        private route : ActivatedRoute,
        private titleService : Title,
        private appComponent : AppComponent,
        private router : Router,
        private authService: AuthService,
        private translateService: TranslateService,
        private notificationsService: NotificationsService
    ) {}

    ngOnInit() {
        //Retrieve thread ID from URL
        this.route.params.subscribe(params => {
            //Retrieve the thread from its ID
            this.messagingService.getThread(params['id']).subscribe(
                (thread : Thread) => {
                    this.thread = thread;

                    //Page title
                    this.translateService.get('MESSAGING.THREAD').subscribe((res: string) => {
                        this.titleService.setTitle(thread.subject + " - " + res.privateMessaging + " - " + this.appComponent.appName);
                    });

                    //Randomly chosen page image
                    this.pageHeaderImage = this.appComponent.randomPageHeaderImage();

                    //Check if user is the thread author
                    this.isAuthor = (this.thread.author.username == this.appComponent.user.username);

                    //Update user's last seen on thread
                    this.messagingService.updateUserLastSeen(this.thread).subscribe();

                    //Mark notifications concerning the thread as read and update user's notifications
                    this.notificationsService.markNotificationsAsRead([0], thread.id).subscribe(data => { this.appComponent.updateUserNotifications(); });
                }
            );

            //Retrieve the list of all the usernames for the participants autocompletion list
            this.authService.getUsers().subscribe(
                (users : User[]) => {
                    this.users = users;
                    this.filteredUsers = this.participantsCtrl.valueChanges
                        .pipe(
                            startWith(''),
                            map(user => user ? this.filterUsers(user) : this.users.slice())
                        );
                }
            );

            //Form for adding a new reply
            this.newThreadMessageForm = new FormGroup({
                content: new FormControl(null, Validators.required)
            });

            //Form for adding a new participant
            this.addParticipantForm = new FormGroup({
                participant: this.participantsCtrl
            });
        });
    }

    /**
     * Filters users based on their username for the participants autocompletion list
     * @param {string} username User's username
     * @returns {User[]} Filtered users
     */
    filterUsers(username: string) {
        return this.users.filter(user =>
            user.username.toLowerCase().indexOf(username.toLowerCase()) === 0);
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
     * Displays new thread reply modal when new message button is clicked
     */
    onNewThreadMessage() {
        $("#messagingModal").fadeIn();
    }

    /**
     * Minimizes/Maximizes the new thread reply modal
     */
    onToggleMessagingModal() {
        //If modal is visible --> Hide it
        if($("#messagingModal .body").is(":visible"))
            $("#messagingModal .body").hide();
        else //Otherwise, show it
            $("#messagingModal .body").show();
    }

    /**
     * Hides the new thread reply modal when close button is clicked
     */
    onHideMessagingModal() {
        $("#messagingModal").fadeOut();
        this.newThreadMessageForm.reset();
    }

    /**
     * Adds a new message to the thread once form is submitted
     */
    newThreadMessage() {
        var message = new ThreadMessage(this.newThreadMessageForm.value.content);

        this.messagingService.newThreadMessage(this.thread, message).subscribe(
            (thread: Thread) => {
                this.thread = thread;

                this.onHideMessagingModal();
            }
        )
    }

    /**
     * Adds a participant to the thread once form is submitted
     */
    addParticipant() {
        this.messagingService.addParticipant(this.thread, this.addParticipantForm.value.participant).subscribe(
            (thread: Thread) => {
                this.thread = thread;

                this.addParticipantForm.reset();
            }
        )
    }

    /**
     * Allows user to leave the thread
     */
    leaveThread() {
        this.translateService.get('MESSAGING.ALERT.CONFIRMATION').subscribe((res: string) => {
            if(confirm(res.leaveThread)) {
                this.messagingService.removeParticipant(this.thread).subscribe();
            }
        });
    }
}