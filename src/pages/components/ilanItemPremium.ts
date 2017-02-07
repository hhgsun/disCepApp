import { Component, Input } from '@angular/core';

@Component({
    selector: 'ilanitempremium',
    templateUrl: 'ilanItemPremium.html'
})
export class IlanItemPremium {
    @Input() public ilan: any;
    constructor() {
    }

}