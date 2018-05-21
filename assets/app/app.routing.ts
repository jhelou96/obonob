import {Routes, RouterModule} from "@angular/router";
import {IndexComponent} from "./static/index.component";
import {AuthComponent} from "./auth/auth.component";
import {ProjectsComponent} from "./projects/projects.component";
import {MessagingComponent} from "./messaging/messaging.component";
import {NotificationsComponent} from "./notifications/notifications.component";
import {PresentationComponent} from "./static/presentation.component";
import {AboutComponent} from "./static/about.component";

/**
 * General app routing
 */
const APP_ROUTES: Routes = [
    { path: '', component: IndexComponent },
    { path: 'auth', component: AuthComponent, loadChildren: './auth/auth.module#AuthModule' },
    { path: 'projects', component: ProjectsComponent, loadChildren: './projects/projects.module#ProjectsModule' },
    { path: 'messaging', component: MessagingComponent, loadChildren: './messaging/messaging.module#MessagingModule' },
    { path: 'notifications', component: NotificationsComponent },
    { path: 'presentation', component: PresentationComponent },
    { path: 'about', component: AboutComponent }
];

export const routing = RouterModule.forRoot(APP_ROUTES);