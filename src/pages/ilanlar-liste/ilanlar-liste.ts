import { Component } from '@angular/core';
import { AppVersion } from 'ionic-native';
import { NavController, NavParams, ModalController, Platform } from 'ionic-angular';
import { AngularFire } from 'angularfire2';

import { IlanDetayPage } from '../ilan-detay/ilan-detay';
import { IlanVerPage } from '../ilan-ver/ilan-ver';
import { SearchPage } from '../search/search';
import { BaseService } from '../services/baseService';

@Component({
  selector: 'page-ilanlar-liste',
  templateUrl: 'ilanlar-liste.html'
})
export class IlanlarListePage {
  public appVersion;
  public premiumIlanlar = [];
  public ilanlar = [];
  toplamIlan = this.baseService.toplamIlan;
  toplamIlanArtis = this.baseService.toplamIlanArtis;
  burayaKadarBox = false;
  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private angularFire: AngularFire,
    private modalCtrl: ModalController,
    private baseService: BaseService,
    private platform: Platform
  ) {
    platform.ready().then(() => {
      AppVersion.getVersionNumber().then(vn => {
        this.appVersion = vn;
      });
    })
  }

  ionViewDidEnter() {
    this.ilanlar = [];
    this.premiumIlanlar = [];
    this.angularFire.database.list(this.baseService.paths.lists, {
      query: {
        limitToLast: this.toplamIlan,
        orderByChild: 'durum',
        equalTo: 'aktif'
      }
    }).map(ilanlar => {
      var list = [];
      for (let ilan of ilanlar.reverse()) {
          this.angularFire.database.object(this.baseService.paths.users + "/" + ilan.ilaniVerenKullaniciId)
            .map(user => {
              return user;
            }).subscribe(user => {
              ilan["ilaniVerenKullanici"] = user;
              list.push(ilan);
            });
      }
      return list;
    }).subscribe(ilanlar => {
      this.ilanlar = [];
      this.ilanlar = ilanlar;
      this.premiumIlanlariYukle()
    })
  }

  premiumIlanlariYukle() {
    this.angularFire.database.list(this.baseService.paths.lists, {
      query: [{
        limitToLast: 10,
        orderByChild: 'premium',
        equalTo: true
      }]
    }).map(ilanlar => {
      var list = [];
      this.premiumIlanlar = [];
      for (let ilan of ilanlar.reverse()) {
        if (ilan.durum == 'aktif' && ilan.premium) {
          this.angularFire.database.object(this.baseService.paths.users + "/" + ilan.ilaniVerenKullaniciId)
            .map(user => {
              return user;
            }).subscribe(user => {
              ilan["ilaniVerenKullanici"] = user;
              list.push(ilan);
            });
        }
      }
      return list;
    }).subscribe(ilanlar => {
      this.premiumIlanlar = [];
      this.premiumIlanlar = ilanlar;
    })
  }

  ilanDetay(ilan) {
    this.navCtrl.push(IlanDetayPage, {
      item: ilan
    })
  }

  ilanVer() {
    let ilanVerModal = this.modalCtrl.create(IlanVerPage);
    ilanVerModal.present();
  }

  searchAc() {
    let searchModal = this.modalCtrl.create(SearchPage);
    searchModal.present();
  }

  logoAc() {
    this.baseService.presentAlert("DişCep Uygulaması", "Dental sektöründekilerin iletişim kurmalarını sağlar <br>v" + this.appVersion)
  }

  doInfinite(infiniteScroll) {
    if (this.ilanlar.length == this.toplamIlan) {
      this.toplamIlan = this.toplamIlan + this.toplamIlanArtis;
    } else {
      this.burayaKadarBox = true
    }
    this.ionViewDidEnter();
    setTimeout(() => {
      infiniteScroll.complete();
    }, 500);
  }

}
