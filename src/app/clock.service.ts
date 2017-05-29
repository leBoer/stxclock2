import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { MomentModule } from 'angular2-moment';
import * as moment from 'moment-timezone';

import 'rxjs/add/operator/toPromise'

import { Exchange } from './exchange';
import { HomePageComponent } from './home/home-page/home-page.component';

import { Name } from './name'
import { NAMES } from './names'

@Injectable()
export class ClockService {
    myDate: Date;
    exchanges: Exchange[];
    private exchangesUrl = '/api'; 
    constructor(private http: Http) { }

    fetchExchanges(): Promise<Exchange[]> {
        console.log('Promise fired');
        return this.http.get(this.exchangesUrl)
            .toPromise()
            .then(response => response.json().exchanges.results as Exchange[])
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        return Promise.reject(error.message || error);
    }

    getNames(): Promise<Name[]> {
        return Promise.resolve(NAMES);
    }

    utcTime(exchanges): any {
        this.exchanges = exchanges;
        this.exchangeTimes(exchanges);
        if (typeof exchanges !== 'undefined') {
            for (var i = 0; i < exchanges.length; i++) {
                this.weekBuilder(i);
                this.exchangeOpenStatus(i);
                if (typeof exchanges[i] !== 'undefined') {
                    this.exchanges[i].remaining = this.exchangeRemaining(i);
                }
            }
        }
        return this.exchanges;
    }

    nonUTCTime(timezone): any {
        var local_time = moment().tz(timezone);
        return local_time;
    }

    exchangeTimes(exchanges): any {
        if (typeof exchanges !== 'undefined') {
            for (var i = 0; i < exchanges.length; i++) {
                var exchange = exchanges[i]; // Sets a variable for easier access to individual exchanges
                exchange.time = this.nonUTCTime(exchange.timezone).format("ddd HH:mm:ss");
                exchange.day = this.nonUTCTime(exchange.timezone).format("dddd");
            }
        }
    }

    exchangeOpenStatus(i): any {
        if (typeof this.exchanges !== 'undefined') {
            var format = 'hh:mm:ss';
            var exchange = this.exchanges[i]; // Sets a variable for easier access to individual exchanges
            var time = moment(exchange.time, format),
                beforeTime = moment(exchange.opening_time, format),
                afterTime = moment(exchange.closing_time, format);
            if ((this.exchanges[i].week[0] || this.exchanges[i].week.length == 0) && time.isBetween(beforeTime, afterTime)) {
                exchange.open_status = true;
            } else {
                exchange.open_status = false;
            }
        }
    }

    openRemaining(i): any {
        return Math.floor(this.timeValues(i).afterDur.asHours()) + moment.utc(this.timeValues(i).afterDur.asMilliseconds()).format(":mm:ss");

    }    

    morningClosed(i): boolean {
        if (this.exchanges[i].open_status == false && this.timeValues(i).beforeDiff > 0) {
            return true;
        }
    }

    eveningClosed(i): boolean {
        if (this.exchanges[i].open_status == false && this.timeValues(i).beforeDiff < 0) {
            return true;
        }
    }

    morningRemaining(i): any {
        return Math.floor(this.timeValues(i).beforeDur.asHours()) + moment.utc(this.timeValues(i).beforeDur.asMilliseconds()).format(":mm:ss");

    }

    eveningRemaining(i): any {
        var t, beforeTime, beforeDiff, beforeDur;
        t = this.timeValues(i);
        beforeTime = t.beforeTime.add(1, 'd');
        beforeDiff = beforeTime.diff(t.exchangeTime);
        beforeDur = moment.duration(beforeDiff);
        return Math.floor(beforeDur.asHours()) + moment.utc(beforeDur.asMilliseconds()).format(":mm:ss");
    }

    weekendRemaining(i, d): any {
        var t, beforeTime, beforeDiff, beforeDur;
        t = this.timeValues(i);
        beforeTime = t.beforeTime.add(d, 'd');
        beforeDiff = beforeTime.diff(t.exchangeTime);
        beforeDur = moment.duration(beforeDiff);
        return Math.floor(beforeDur.asHours()) + moment.utc(beforeDur.asMilliseconds()).format(":mm:ss");
    }

    timeValues(i): any {
        var format, exchangeTime, afterTime, afterDiff, afterDur, beforeTime, beforeDiff, beforeDur;
        format = 'hh:mm:ss';
        exchangeTime = moment(this.exchanges[i].time, format);
        beforeTime = moment(this.exchanges[i].opening_time, format);
        beforeDiff = beforeTime.diff(exchangeTime);
        beforeDur = moment.duration(beforeDiff);
        afterTime = moment(this.exchanges[i].closing_time, format);
        afterDiff = afterTime.diff(exchangeTime);
        afterDur = moment.duration(afterDiff);
        return {exchangeTime: exchangeTime, afterDur: afterDur, beforeTime, beforeDur, beforeDiff: beforeDiff};
    }

    exchangeRemaining(i): any {
        if (typeof this.exchanges[i] !== 'undefined') {
            var w = this.exchanges[i].week; // For easier access
            if (this.exchanges[i].open_status == true) {
                return this.openRemaining(i);
            } else {
                if (this.morningClosed(i) && w.length == 0) { // Open today, but before opening time
                    // console.log(this.exchanges[i].name);
                    return this.morningRemaining(i);
                } else if (this.eveningClosed(i) && w.length == 1) { // After closing time, but open today and tomorrow
                    // console.log(this.exchanges[i].name);
                    return this.eveningRemaining(i);
                } else if (this.eveningClosed(i) && w[0] && !w[1] && w.length >=2) { // After closing, open today, but not tomorrow
                    // console.log(this.exchanges[i].name);
                    return this.weekendRemaining(i, w.length);
                } else if (!w[0] && !w[1] && w.length >=2) { // today is closed and tomorrow is also closed...
                    // console.log(this.exchanges[i].name);
                    return this.weekendRemaining(i, w.length);
                } else if (!w[0] && w.length == 1) { // closed today, open tomorrow
                    // console.log(this.exchanges[i].name);
                    return this.eveningRemaining(i);
                }
            }
        }
    }

    // Checks if a given day is a holiday h = 0 means today, h = 1 means tomorrow
    checkHoliday(i, h): boolean {
        var currentTimeObject = this.nonUTCTime(this.exchanges[i].timezone).add(h, 'day');
        var formattedCurrentTime = currentTimeObject.format('MMMM DD, YYYY');
        var holidayMoment = moment(this.exchanges[i].holidays[h], 'MMMM DD, YYYY');
        var formattedHoliday = holidayMoment.format('MMMM DD, YYYY');
        if (formattedCurrentTime == formattedHoliday ||
            this.exchanges[i].holidays.includes(formattedCurrentTime) ||
            this.exchanges[i].weekend.includes(currentTimeObject.format('dddd'))) {
            return true;
        } else {
            return false;
        }
    }

    // Builds an array for the upcoming non-trading days
    // False = Closed, True = Open
    weekBuilder(i): void {
        if (typeof this.exchanges !== 'undefined') {
            this.exchanges[i].week = [];
            for (var h = 0; h < this.exchanges[i].holidays.length + 14; h++) {
                if (this.checkHoliday(i, h)) {
                    this.exchanges[i].week.push(false);
                } else if (this.eveningClosed(i) && h == 0) {
                    this.exchanges[i].week.push(true);
                } else {
                    return;
                }
            }
        }
    }

    // Checks if a holiday is in the future, and less than 30 days away
    checkFutureHoliday(exchange, day): boolean {
        var exchangeDate = this.nonUTCTime(this.exchanges[exchange].timezone);
        var holiday = moment(day, 'MMMM DD, YYYY');
        var diffDays = holiday.diff(exchangeDate, 'days');
        if (diffDays < 0) {
            return false;
        } else if (diffDays >= 0 && diffDays <= 30) {
            return true;
        }
    }

    // Builds an array for the 30-day holiday calendar
    holidayBuilder(): void {
        if (typeof this != 'undefined' && typeof this.exchanges !== 'undefined' && this.exchanges.length > 5) {
            for (var e = 0; e < this.exchanges.length; e++) {
                this.exchanges[e].thirty =[];
                for (var h = 0; h < this.exchanges[e].holidays.length; h++) {
                    if (this.checkFutureHoliday(e, this.exchanges[e].holidays[h])) {
                        this.exchanges[e].thirty.push(this.exchanges[e].holidays[h]);
                    }
                }
            }
        }
    }

    testingfunction(): any {
        console.log('test');
        console.log(this.exchanges);
        // console.log(this.exchanges[0].week);
        // console.log(this.exchanges);
        // for (var i = 0; i < this.exchanges.length; i++) {
        //     console.log(this.exchanges[i].week);
        // }
    }
}
