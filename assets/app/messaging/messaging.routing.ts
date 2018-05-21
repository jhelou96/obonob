import {RouterModule, Routes} from "@angular/router";
import {InboxComponent} from "./inbox.component";
import {ThreadComponent} from "./thread.component";

/**
 *  Routing system for the authentication module
 */
const MESSAGING_ROUTES: Routes = [
    { path: '', component: InboxComponent },
    { path: ':id', component: ThreadComponent }
];

export const messagingRouting = RouterModule.forChild(MESSAGING_ROUTES);