import { ModuleWithProviders } from '@angular/core';

import { Routes, 
         CanLoad,
         CanActivate,
         CanActivateChild,
         CanDeactivate,
         RouterModule  } from '@angular/router';

import { ExchangeMainComponent } from './exchangeMain.component';
import { ExchangePageComponent } from './exchange-page/exchange-page.component';

export const exchangeRoutes: Routes = [
  { path: '',
     component: ExchangeMainComponent,
     children: [
         {  path: '',
            children:[
                { path: '', component: ExchangePageComponent},
            ]
         }
     ]
     },
];

export const exchangeRouting: ModuleWithProviders = RouterModule.forChild(exchangeRoutes)
