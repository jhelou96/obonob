import {Component, OnInit} from "@angular/core";
import {AlertService} from "./alert.service";
import {Alert} from "./alert.model";
import {Observable} from 'rxjs/RX';
import {Router} from "@angular/router";
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    animations: [
        trigger('slideInOut', [
            transition(':enter', [
                style({transform: 'translateX(100%)'}),
                animate('200ms ease-in', style({transform: 'translateX(0%)'}))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({transform: 'translateX(100%)'}))
            ])
        ])
    ]
})
/**
 * Alert component for the push notifications system
 */
export class AlertComponent implements OnInit {
    alert: Alert; //Alert object containing the type and message of the alert
    visible: boolean = false;

    constructor(private alertService: AlertService, private router: Router) {
        //Listen for route change and automatically dismiss alert if route changed
        this.router.events.subscribe((event) => {
            this.dismissAlert();
        });
    }

    ngOnInit() {
        //Checks if an alert has been thrown
        this.alertService.alertToggled.subscribe(
            (alert: Alert) => {
                this.alert = alert;
                this.visible = true;

                //Auto-dismiss alert after 5 sec
                var autoDismiss = Observable.interval(5000).subscribe(x => {
                    this.visible = false;
                    autoDismiss.unsubscribe();
                });
            }
        );
    }

    /**
     * Dismisses alert when the dismiss button is clicked
     */
    dismissAlert() {
        this.visible = false;
    }
}