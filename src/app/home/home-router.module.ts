//src/app/home/home-router.ts

import { ModuleWithProviders } from '@angular/core';

import { Routes, 
         CanLoad,
         CanActivate,
         CanActivateChild,
         CanDeactivate,
         RouterModule  } from '@angular/router';

import { HomeMainComponent } from './homeMain.component';
import { HomePageComponent } from './home-page/home-page.component';

export const homeRoutes: Routes = [
  { path: '',
     component: HomeMainComponent,
     children: [
         {  path: '',
            children:[
                { path: '', component: HomePageComponent},
            ]
         }
     ]
     },
];

export const homeRouting: ModuleWithProviders = RouterModule.forChild(homeRoutes)
