import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar, Keyboard, Splashscreen } from 'ionic-native';

import { TabsPage } from '../pages/tabs/tabs';
import { IntroPage } from '../pages/intro/intro';

import { AngularFire } from 'angularfire2';

// declare var FCMPlugin: any;

@Component({
    template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class MyApp {
    rootPage;
    constructor(platform: Platform, public angularFire: AngularFire) {
        platform.ready().then(() => {
            StatusBar.styleDefault();
            StatusBar.backgroundColorByHexString('#387ef5'); // native en üst bar rengi

            // Klavye Açıkken ve Kapalıyken Tab Gizleme için
            Keyboard.onKeyboardShow().subscribe(() => {
                document.body.classList.add('keyboard-is-open');
            });
            Keyboard.onKeyboardHide().subscribe(() => {
                document.body.classList.remove('keyboard-is-open');
            });

            //this.rootPage = TabsPage; //önce IntroPage e girileceği için kaldırıldı
            this.angularFire.auth.subscribe(auth => {
                if (auth) {
                    console.log("Kullanıcı girişi var");
                    this.rootPage = TabsPage;
                } else {
                    this.rootPage = IntroPage;
                }
            })
            
            Splashscreen.hide();
        });
    }
}
