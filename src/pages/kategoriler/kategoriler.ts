import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { AngularFire } from 'angularfire2';
import { BaseService } from '../services/baseService';

import { IlanDetayPage } from '../ilan-detay/ilan-detay';

@Component({
  selector: 'page-kategori',
  templateUrl: 'kategoriler.html'
})
export class KategoriPage {
  public kategoriler = [];
  public secilenKat = null;
  public kategoriIlanlari = [];

  public toplamIlan = this.baseService.toplamIlan;
  public toplamIlanArtis = this.baseService.toplamIlanArtis;

  constructor(private navCtrl: NavController, private navParams: NavParams, private baseService: BaseService, private angularFire: AngularFire) {
    var secilenKat = this.navParams.get("item");
    if (secilenKat) {
      this.secilenKat = secilenKat;
      this.kategoriIlanlariListele();
    }
  }

  ionViewDidLoad() {
    this.angularFire.database.list(this.baseService.paths.categories).subscribe(kategoriler => {
      this.kategoriler = kategoriler;
    })
  }

  kategoriDetay(item) {
    this.navCtrl.push(KategoriPage, {
      item: item
    });
  }

  kategoriIlanlariListele() {
    this.angularFire.database.list(this.baseService.paths.lists).map(_ilanlar => {
      var ilanList = [];
      for (let _ilan of _ilanlar.reverse()) {
        _ilan.kategorileri.forEach(_kat => {
          if (_kat == this.secilenKat.$key) {
            this.angularFire.database.object(this.baseService.paths.users + "/" + _ilan.ilaniVerenKullaniciId).map(user => {
              return user;
            }).subscribe(user => {
              _ilan["ilaniVerenKullanici"] = user;
              ilanList.push(_ilan);
            })
          }
        });
      }
      return ilanList;
    }).subscribe(ilanList => {
      this.kategoriIlanlari = ilanList;
    })
  }

  doInfinite(infiniteScroll) {
    this.toplamIlan = this.toplamIlan + this.toplamIlanArtis;
    this.kategoriIlanlariListele();
    setTimeout(() => {
      infiniteScroll.complete();
    }, 500);
  }

  ilanDetay(ilan) {
    this.navCtrl.push(IlanDetayPage, {
      item: ilan
    })
  }

}
