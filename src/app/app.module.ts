import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, PreloadAllModules } from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { TitleComponent } from './title.component';
import { MetaDescriptionComponent } from './meta-description.component';
import { NavbarComponent } from './navbar/navbar.component';
// import { SortPipe } from "./sort.pipe";
import { HttpModule } from '@angular/http';

import { ClockService } from './clock.service';

export { AppComponent, TitleComponent, MetaDescriptionComponent };

@NgModule({
  imports: [
    HttpModule,
    NgbModule.forRoot(),
    BrowserModule.withServerTransition({ appId: 'cli-universal-demo' }),
    RouterModule.forRoot([
      { path: '', loadChildren: './home/home.module#HomeModule' },
      { path: 'about', loadChildren: './about/about.module#AboutModule' },
      { path: 'contact', loadChildren: './contact/contact.module#ContactModule'},
      { path: 'exchange', loadChildren: './exchange/exchange.module#ExchangeModule'},
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ], { preloadingStrategy: PreloadAllModules })
  ],
  providers: [ClockService],
  declarations: [
    AppComponent,
    NavbarComponent,
    TitleComponent,
    MetaDescriptionComponent
  ],
  bootstrap: [AppComponent, TitleComponent, MetaDescriptionComponent]
})
export class AppModule { }
