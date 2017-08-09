import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { ClockService } from '../../clock.service';
import { Name } from '../../name';
import { Exchange } from '../../exchange';

import { Observable } from 'rxjs/rx'
import 'rxjs/add/operator/switchMap';

@Component({
    selector: 'app-exchange-page',
    templateUrl: './exchange-page.component.html',
    styleUrls: ['./exchange-page.component.scss']
})
export class ExchangePageComponent implements OnInit {
    @Input() name: Name;
    exchange: Exchange;
    exchangeArray: Exchange[];

    constructor(
        @Inject(PLATFORM_ID) private platformId: string,
        private clockService: ClockService,
        private route: ActivatedRoute,
    ) {
        let checkIfBrowser = isPlatformBrowser(platformId);
        console.log('Check If Browser', checkIfBrowser)
    }

    ngOnInit(): void {
        console.log('Starting ngOnInit from ExchangePageComponent')
        this.route.params
            .switchMap((params: Params) => this.clockService.getName(params['ticker']))
            .subscribe(name => this.name = name);
        
        if (isPlatformBrowser(this.platformId)) {
            // console.log('This is a Browser')
            this.startInitiation();
            
            setInterval(() => {
                if (typeof this.exchange !== 'undefined') {
                    this.exchangeArray = [];
                    this.exchangeArray.push(this.exchange);
                    this.exchangeArray = this.clockService.utcTime(this.exchangeArray) ;
                    this.exchange = this.exchangeArray[0];
                    // console.log(this.clockService.evaluateHolidays(this.exchange).future);
                }
            }, 300);
        }
    }

    getExchange(): void {
        this.clockService.getExchange(this.name.ticker)
            .then(res => this.exchange = res)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    };

    waitThenTry(): void {
        // console.log('Gotta wait and try again');
        setTimeout(() => {
            this.startInitiation();
        }, 300);
    }
    
    startInitiation(): void {
        if (typeof this.name !== 'undefined') {
            this.getExchange();
        } else {
            this.waitThenTry();
        }
    }
}