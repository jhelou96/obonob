import {RouterModule, Routes} from "@angular/router";
import {MyProjectsComponent} from "./myProjects.component";

/**
 *  Routing system for the projects module
 */
const PROJECTS_ROUTES: Routes = [
    { path: 'my-projects', component: MyProjectsComponent }
];

export const projectsRouting = RouterModule.forChild(PROJECTS_ROUTES);