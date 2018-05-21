import {Component, OnInit} from "@angular/core";
import {AppComponent} from "../app.component";
import {Router} from "@angular/router";

@Component({
    selector: 'app-messaging',
    template: '<router-outlet></router-outlet>'
})
/**
 * Main component for the messaging module
 */
export class MessagingComponent implements OnInit {
    constructor(
        private appComponent: AppComponent,
        private router: Router
    ) {}

    ngOnInit() {
        //If user is not logged in, module can't be accessed
        if(!this.appComponent.isLoggedIn())
            this.router.navigateByUrl('/');
    }
}