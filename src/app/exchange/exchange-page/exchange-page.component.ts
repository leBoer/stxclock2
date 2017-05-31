import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

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
        private clockService: ClockService,
        private route: ActivatedRoute,
        private location: Location
    ) { }

    ngOnInit(): void {
        this.route.params
            .switchMap((params: Params) => this.clockService.getName(params['ticker']))
            .subscribe(name => this.name = name);

        this.startInitiation();
         
        setInterval(() => {
            if (typeof this.exchange !== 'undefined') {
                this.exchangeArray = [];
                this.exchangeArray.push(this.exchange);
                this.exchangeArray = this.clockService.utcTime(this.exchangeArray) ;
                this.exchange = this.exchangeArray[0];
            }
        }, 300);

        setTimeout(() => {
            console.log(this.exchange);
        }, 3000);
    }

    getExchange(): void {
        this.clockService.getExchange(this.name.ticker)
            .then(res => this.exchange = res);
    }

    waitThenTry(): void {
        setTimeout(() => {
            this.startInitiation();
        }, 300)
    }
    
    startInitiation(): void {
        if (typeof this.name !== 'undefined') {
            this.getExchange();
        } else {
            this.waitThenTry();
        }
    }
}