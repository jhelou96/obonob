import {Routes, RouterModule} from "@angular/router";
import {IndexComponent} from "./static/index.component";
import {AuthComponent} from "./auth/auth.component";

const APP_ROUTES: Routes = [
    { path: '', component: IndexComponent },
    { path: 'auth', component: AuthComponent, loadChildren: './auth/auth.module#AuthModule' }
];

export const routing = RouterModule.forRoot(APP_ROUTES);