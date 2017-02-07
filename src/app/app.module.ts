import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { Storage } from '@ionic/storage';

import { IlanVerPage } from '../pages/ilan-ver/ilan-ver';
import { SearchPage } from '../pages/search/search';
import { IlanDetayPage } from '../pages/ilan-detay/ilan-detay';
import { IlanlarListePage } from '../pages/ilanlar-liste/ilanlar-liste';
import { KategoriPage } from '../pages/kategoriler/kategoriler';
import { GecmisPage } from '../pages/gecmis/gecmis';
import { HesabimPage } from '../pages/hesabim/hesabim';
import { ProfildetayPage } from '../pages/profildetay/profildetay';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { IntroPage } from '../pages/intro/intro';

import { IlanItem } from '../pages/components/ilanItem';
import { IlanItemPremium } from '../pages/components/ilanItemPremium';
import { ImagesShow } from '../pages/components/imagesShow';

import { BaseService } from '../pages/services/baseService';
import { AngularFireModule } from 'angularfire2';
export const firebaseConfig = {
  apiKey: 'AIzaSyA1PqCt1NnQFE5J0_5lHIrtmEkAvD71ZH4',
  authDomain: 'discep-c50e3.firebaseapp.com',
  databaseURL: 'https://discep-c50e3.firebaseio.com',
  storageBucket: 'discep-c50e3.appspot.com',
  messagingSenderId: '761445861651'
};


@NgModule({
  declarations: [
    MyApp,
    IlanItem,
    IlanItemPremium,
    ImagesShow,
    IlanVerPage,
    SearchPage,
    IlanDetayPage,
    IlanlarListePage,
    KategoriPage,
    GecmisPage,
    HesabimPage,
    ProfildetayPage,
    LoginPage,
    IntroPage,
    TabsPage
  ],
  imports: [
    IonicModule.forRoot(MyApp,
      {
        // app ayarları
        backButtonText: '', // "Geri" yazılabilir
        //iconMode: 'ios',
        tabbarPlacement: 'bottom',
        //pageTransition: 'ios',
      }),
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    IlanItem,
    IlanItemPremium,
    ImagesShow,
    IlanVerPage,
    SearchPage,
    IlanDetayPage,
    IlanlarListePage,
    KategoriPage,
    GecmisPage,
    HesabimPage,
    ProfildetayPage,
    LoginPage,
    IntroPage,
    TabsPage
  ],
  providers: [BaseService, Storage,{provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule { }
