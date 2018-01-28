import {Component, OnInit} from "@angular/core";
import {AlertService} from "./alert.service";
import {Alert} from "./alert.model";
import {Observable} from 'rxjs/RX';

declare var jquery:any;
declare var $ :any;

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html'
})
/**
 * Alert component for the notifications system
 */
export class AlertComponent implements OnInit {
    alert: Alert; //Alert object containing the type and message of the alert

    constructor(private alertService: AlertService) {}

    /**
     * Method executed on initialization
     */
    ngOnInit() {
        //Checks if an alert has been thrown
        this.alertService.alertToggled.subscribe(
            (alert: Alert) => {
                this.alert = alert;
                $(".alert-notification").fadeIn();

                //Auto-dismiss alert after 5 sec
                var autoDismiss = Observable.interval(5000).subscribe(x => {
                    $(".alert-notification").fadeOut();
                    autoDismiss.unsubscribe();
                });
            }
        );
    }

    /**
     * Dismisses alert when the dismiss button is clicked
     */
    dismissAlert() {
        $(".alert-notification").fadeOut();
    }
}