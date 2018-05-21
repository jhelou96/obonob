import {NgModule} from "@angular/core";
import {AlertService} from "./alert.service";
import {CommonModule} from "@angular/common";

@NgModule({
    imports: [
        CommonModule,
    ],
    providers: [
        AlertService
    ]
})
/**
 * Alert module package
 */
export class AlertModule {

}