import { Component } from '@angular/core';

import { IlanlarListePage } from '../ilanlar-liste/ilanlar-liste';
import { KategoriPage } from '../kategoriler/kategoriler';
import { GecmisPage } from '../gecmis/gecmis';
import { HesabimPage } from '../hesabim/hesabim';

import { BaseService } from '../services/baseService';
import { AngularFire } from 'angularfire2';

@Component({
    templateUrl: 'tabs.html'
})
export class TabsPage {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    tab1Root: any = IlanlarListePage;
    tab2Root: any = KategoriPage;
    tab3Root: any = GecmisPage;
    tab4Root: any = HesabimPage;

    public yeniMesajOlanlar = [];

    constructor(private baseService: BaseService, private angularFire: AngularFire) {
        this.angularFire.auth.subscribe(auth => {
            if (auth) {
                // YENİ MESAJ SAYISI AYNI İLANA AİT MESAJLARI TEK GÖSTERME
                this.angularFire.database.list(this.baseService.paths.users + "/" + auth.uid + "/yeniMesajlar")
                    .map((messages: any) => {
                        var list = []
                        for (let _mes of messages) {
                            list.push(_mes.ilanId);
                        }
                        var ilanIds = list.filter((elem, index, self) => {
                            return index == self.indexOf(elem);
                        })
                        return ilanIds;
                    }).subscribe(ids => {
                        this.yeniMesajOlanlar = ids;
                    })
            }
        })
    }

}
