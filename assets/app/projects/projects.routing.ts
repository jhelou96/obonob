import {RouterModule, Routes} from "@angular/router";
import {MyProjectsComponent} from "./myProjects.component";
import {ProjectComponent} from "./project.component";
import {ActivityComponent} from "./activity.component";
import {SubscriptionsComponent} from "./subscriptions.component";
import {UserProjectsComponent} from "./userProjects.component";
import {AllProjectsComponent} from "./allProjects.component";

/**
 *  Routing system for the projects module
 */
const PROJECTS_ROUTES: Routes = [
    { path: '', component: AllProjectsComponent },
    { path: 'my-projects', component: MyProjectsComponent },
    { path: 'users/:user/activity', component: ActivityComponent },
    { path: 'users/:user/subscriptions', component: SubscriptionsComponent },
    { path: 'users/:user', component: UserProjectsComponent },
    { path: ':project', component: ProjectComponent }
];

export const projectsRouting = RouterModule.forChild(PROJECTS_ROUTES);