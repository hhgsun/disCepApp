import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
    selector: 'imagesShow',
    templateUrl: 'imagesShow.html'
})

export class ImagesShow {
    slideOptions: any;
    public gelenResimler = [];
    constructor(private navParams: NavParams, private viewCtrl: ViewController) {
        // gelen item
        //item.selectIndex
        //item.allImages
        var resimlerData = navParams.get("item");
        if (resimlerData) {
            this.gelenResimler = resimlerData.allImages;
        }
    }

    ionViewWillEnter() {
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }
}