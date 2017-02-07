import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
declare var window: any;

import { AngularFire } from 'angularfire2';

import { BaseService } from '../services/baseService'
import { IlanDetayPage } from '../ilan-detay/ilan-detay';


@Component({
  selector: 'page-profildetay',
  templateUrl: 'profildetay.html'
})
export class ProfildetayPage {
  public kullanici;
  public ilanlar = [];
  public aktifUid = null;
  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private angularFire: AngularFire,
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private baseService: BaseService
  ) {
    this.kullanici = this.navParams.get("item");
    this.angularFire.auth.subscribe(auth => {
      this.aktifUid = auth.uid;
    })
  }

  ionViewDidLoad() {
    this.angularFire.database.list(this.baseService.paths.lists, {
      query: {
        orderByChild: "ilaniVerenKullaniciId",
        equalTo: this.kullanici.userId
      }
    }).subscribe(ilanlar => {
      this.ilanlar = ilanlar;
    })
  }

  telAra() {
    /* 
    CallNumber.callNumber("05344580930", true)
      .then(() => console.log('Aradın !')).catch(() => console.log('Arayamadın !'));
    */
    var telNum = encodeURIComponent(this.kullanici.telNo);
    window.location = "tel:" + telNum;
  }

  ilanDetay(ilan) {
    ilan["ilaniVerenKullanici"] = this.kullanici;
    this.navCtrl.push(IlanDetayPage, {
      item: ilan
    }).then(() => {
      this.viewCtrl.dismiss().then();
    })
  }

  avatarOnizleme(avatar) {
    if (!avatar) {
      avatar = this.baseService.paths.defaultAvatar;
    }
    let alertB = this.alertCtrl.create(
      {
        title: "Profil Resmi",
        subTitle: "<img src='" + avatar.downloadUrl + "' style='width:90%;'>",
        buttons: [
          {
            text: 'Kapat', handler: (data) => { }
          }
        ]
      });
    alertB.present();
  }

  dissmis() {
    this.viewCtrl.dismiss();
  }

}
