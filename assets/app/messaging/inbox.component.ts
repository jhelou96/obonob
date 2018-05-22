import {Component, OnInit} from "@angular/core";
import {AppComponent} from "../app.component";
import {AuthService} from "../auth/auth.service";
import {Title} from "@angular/platform-browser";
import {User} from "../auth/user.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable} from "rxjs/Observable";
import {map, startWith} from "rxjs/operators";
import {Thread, ThreadMessage} from "./thread.model";
import {MessagingService} from "./messaging.service";
import {TranslateService} from "@ngx-translate/core";

declare var jquery:any;
declare var $ :any;

@Component({
    selector: 'app-messaging-inbox',
    templateUrl: './inbox.component.html'
})
/**
 * Messaging component for the inbox view
 */
export class InboxComponent implements OnInit {
    /**
     * List of filtered users used to provide the user with an autocompletion list when creating a new thread and specifying a recipient
     */
    filteredUsers: Observable<any[]>;

    /**
     * List of all users registered in the system
     */
    users : User[];

    /**
     * Markdown editor options
     */
    markdownEditorOptions = {
        "hideIcons": ['TogglePreview', 'FullScreen']
    };

    /**
     * Form used to create a new thread
     */
    newThreadForm: FormGroup;

    /**
     * FormControl for the newThreadForm
     */
    recipientsCtrl : FormControl = new FormControl();

    /**
     * List of user's discussion threads
     */
    discussionThreads: Thread[] = [];

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
        private appComponent : AppComponent,
        private authService : AuthService,
        private messagingService : MessagingService,
        private titleService: Title,
        private translateService: TranslateService
    ) {}

    ngOnInit() {
        //Page title
        this.translateService.get('MESSAGING.INBOX').subscribe((res: any) => {
            this.titleService.setTitle(res.inbox + " - " + this.appComponent.appName);
        });

        //Update user's notifications
        this.appComponent.updateUserNotifications();

        //Randomly chosen page image
        this.pageHeaderImage = this.appComponent.randomPageHeaderImage();

        //Retrieve the list of all the usernames for the recipients autocompletion list
        this.authService.getUsers().subscribe(
            (users : User[]) => {
                this.users = users;
                this.filteredUsers = this.recipientsCtrl.valueChanges
                    .pipe(
                        startWith(''),
                        map(user => user ? this.filterUsers(user) : this.users.slice())
                    );
            }
        );

        //Retrieve the user's discussion threads
        this.messagingService.getDiscussionThreads().subscribe(
            (threads : Thread[]) => {
                this.discussionThreads = threads;
            }
        );

        this.newThreadForm = new FormGroup({
            subject: new FormControl(null, Validators.required),
            recipient: this.recipientsCtrl,
            content: new FormControl(null, Validators.required)
        });
    }

    /**
     * Filters users based on their username for the recipient autocompletion field
     * @param {string} username User's username
     * @returns {User[]} Filtered users
     */
    filterUsers(username: string) {
        return this.users.filter(user =>
            user.username.toLowerCase().indexOf(username.toLowerCase()) === 0);
    }

    /**
     * Toggles modal when new discussion thread button is clicked
     */
    onNewThread() {
        $("#messagingModal").fadeIn();
    }

    /**
     * Minimizes/maximizes the new discussion thread modal
     */
    onToggleMessagingModal() {
        //If modal is visible --> Hide it
        if($("#messagingModal .body").is(":visible"))
            $("#messagingModal .body").hide();
        else //Otherwise, show it
            $("#messagingModal .body").show();
    }

    /**
     * Hides the new discussion thread modal when close button is clicked
     */
    onHideMessagingModal() {
        $("#messagingModal").fadeOut();
        this.newThreadForm.reset();
    }

    /**
     * Creates new discussion thread once form is submitted
     */
    newThread() {
        var messages : ThreadMessage[] = [];
        messages.push(new ThreadMessage(this.newThreadForm.value.content));
        var participants : User[] = [];
        participants.push(new User(this.recipientsCtrl.value, ""));
        var thread = new Thread(this.newThreadForm.value.subject, participants, messages);

        this.messagingService.newThread(thread).subscribe(); //Redirects user to thread once created
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
}