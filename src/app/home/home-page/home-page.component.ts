import { Component, OnInit } from '@angular/core';


import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

import { Exchange } from '../../exchange';
import { ExchangeService } from '../../exchange.service';
import { ClockService } from "../../clock.service";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  exchanges: Exchange[] = [];
  myDate: Date;
  meCheck: boolean = false;

  constructor( @Inject(PLATFORM_ID) private platformId: string,
    private exchangeService: ExchangeService,
    private clockService: ClockService
  ) {

    let checkIfBrowser = isPlatformBrowser(platformId);
    console.log('Check If Browser', checkIfBrowser)

  }

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)) {
      console.log('This is a Browser')


      this.exchangeService.getExchanges()
        .then(exchanges => this.exchanges = exchanges);
      
      this.clockService.utcTime(this.exchanges);
      setInterval(() => {
        this.myDate = this.clockService.utcTime(this.exchanges)[0];
        this.exchanges = this.clockService.utcTime(this.exchanges)[1];
      }, 1000);

      this.clockService.fetchExchanges();
    }
  }

  buttonTest(): any {
    this.clockService.testingfunction();
  }
}