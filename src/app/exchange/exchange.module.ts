import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ExchangeMainComponent } from './exchangeMain.component';
import { ExchangePageComponent } from './exchange-page/exchange-page.component';
import { exchangeRoutes } from './exchange-router.module';


import { ClockService } from '../clock.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(exchangeRoutes),
  ],
  declarations: [
    ExchangeMainComponent,
    ExchangePageComponent,
  ],
  providers: [ClockService]
})
export class ExchangeModule { }