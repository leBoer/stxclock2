import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'matchesTicker'
})
export class TickerPipe implements PipeTransform {
    transform(items: Array<any>, ticker: string): Array<any> {
        return items.filter(item => item.ticker === ticker);
    }
}