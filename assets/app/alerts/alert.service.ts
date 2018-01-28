import {EventEmitter} from "@angular/core";
import {Alert} from "./alert.model";

/**
 * Service for the alert module
 */
export class AlertService {
    alertToggled = new EventEmitter<Alert>(); //Alert emitter

    /**
     * Creates a new alert and emits it when catched
     * @param {string} type Alert type (error, success, warning)
     * @param {string} message Alert message
     */
    handleAlert(type: string, message: string) {
        const alertData = new Alert(type, message);
        this.alertToggled.emit(alertData);
    }
}