import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {NotificationsService} from "./notifications.service";
import {NotificationsComponent} from "./notifications.component";
import {RouterModule} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {NgxPaginationModule} from "ngx-pagination";
import {MomentModule} from "angular2-moment";

@NgModule({
    declarations: [
        NotificationsComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        TranslateModule.forChild(),
        MomentModule,
        NgxPaginationModule
    ],
    providers: [
        NotificationsService
    ]
})
/**
 * Notifications module package
 */
export class NotificationsModule {

}