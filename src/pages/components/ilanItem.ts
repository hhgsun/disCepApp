import { Component, Input } from '@angular/core';

@Component({
    selector: 'ilanitem',
    templateUrl: 'ilanItem.html'
})
export class IlanItem {
    @Input() public ilan: any;
    constructor() {
    }

}