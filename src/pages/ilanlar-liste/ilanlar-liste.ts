import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
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
    private baseService: BaseService
  ) {
  }

  ionViewDidLoad() {
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
        if (ilan.durum == 'aktif') {
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
    this.baseService.presentAlert("DişCep Uygulaması","Dental sektöründekilerin iletişim kurmalarını sağlar")
  }

  doInfinite(infiniteScroll) {
    if (this.ilanlar.length == this.toplamIlan) {
      this.toplamIlan = this.toplamIlan + this.toplamIlanArtis;
    } else {
      this.burayaKadarBox = true
    }
    this.ionViewDidLoad()
    setTimeout(() => {
      infiniteScroll.complete();
    }, 500);
  }

}
