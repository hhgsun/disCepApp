import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AngularFire } from 'angularfire2';
import { BaseService } from '../services/baseService';

import { IlanDetayPage } from '../ilan-detay/ilan-detay';

@Component({
  selector: 'page-gecmis',
  templateUrl: 'gecmis.html'
})
export class GecmisPage {
  public segment = 'messages';
  public mesajAtilanIlanlar = [];
  public yeniMesajOlanlar = [];
  public favoriIlanlar = [];
  public aktifUid = null;

  public toplamIlan = this.baseService.toplamIlan;
  public toplamIlanArtis = this.baseService.toplamIlanArtis;

  constructor(private navCtrl: NavController, private baseService: BaseService, private angularFire: AngularFire) {
    this.angularFire.auth.subscribe(auth => {
      this.aktifUid = auth.uid;
    })
  }

  ionViewWillEnter() {
    this.yeniGelenMesajlar()
    this.mesajlariYukle()
    this.favorileriYukle()
  }

  mesajlariYukle() {
    this.angularFire.database.list(this.baseService.paths.lists).map(_ilanlar => {
      var list = [];
      for (let _ilan of _ilanlar.reverse()) {
        this.angularFire.database.list(this.baseService.paths.lists + "/" + _ilan.$key + "/chats").map(_chats => {
          var count = 0;
          for (let _chat of _chats) {
            if (_chat.olusturanId == this.aktifUid) { count++ }
          } return count;
        }).subscribe(_count => {
          if (_count > 0) {
            this.angularFire.database.object(this.baseService.paths.users + "/" + _ilan.ilaniVerenKullaniciId).map(user => {
              return user
            }).subscribe(_user => {
              _ilan["ilaniVerenKullanici"] = _user;
              list.push(_ilan)
            });
          }
        })
      } return list;
    }).subscribe(_ilanList => {
      this.mesajAtilanIlanlar = _ilanList
    });
  }

  favorileriYukle() {
    this.angularFire.database.list(this.baseService.paths.users + "/" + this.aktifUid + "/favorilerim")
      .map(favorilerim => {
        var favIlanlar = [];
        for (let fav of favorilerim.reverse()) {
          this.angularFire.database.object(this.baseService.paths.lists + "/" + fav.$value).map(ilan => ilan)
            .subscribe(ilan => {
              if (ilan.baslik) {
                this.angularFire.database.object(this.baseService.paths.users + "/" + ilan.ilaniVerenKullaniciId).map(user => user)
                  .subscribe(user => {
                    ilan["ilaniVerenKullanici"] = user;
                    favIlanlar.push(ilan);
                  })
              }
            })
        }
        return favIlanlar;
      }).subscribe(favIlanlar => {
        this.favoriIlanlar = favIlanlar;
      })
  }

  yeniGelenMesajlar() {
    // YENİ MESAJ SAYISI - AYNI İLANA AİT MESAJLARI TEK GÖSTERME
    this.angularFire.database.list(this.baseService.paths.users + "/" + this.aktifUid + "/yeniMesajlar")
      .map((messages: any) => {
        var list = []
        for (let _mes of messages) {
          list.push(_mes.ilanId);
        }
        var ilanIds = list.filter((elem, index, self) => {
          return index == self.indexOf(elem);
        })
        var yeniMesajOlanlar = [];
        ilanIds.forEach(id => {
          this.angularFire.database.object(this.baseService.paths.lists + "/" + id).subscribe(ilan => {
            this.angularFire.database.object(this.baseService.paths.users + "/" + ilan.ilaniVerenKullaniciId).subscribe(user => {
              ilan["ilaniVerenKullanici"] = user;
              yeniMesajOlanlar.push(ilan);
            })
          })
        });
        return yeniMesajOlanlar;
      }).subscribe(ilanlar => {
        this.yeniMesajOlanlar = ilanlar
      })
  }

  ilanDetay(ilan) {
    this.navCtrl.push(IlanDetayPage, {
      item: ilan
    })
  }

  doInfiniteMessages(infiniteScroll) {
    this.toplamIlan = this.toplamIlan + this.toplamIlanArtis;
    setTimeout(() => {
      infiniteScroll.complete();
    }, 500);
  }

  compressionToMessageItem(index, mesajIlan) {
    // *ngFor="let ilan of mesajAtilanIlanlar; let i = index; trackBy: compressionToMessageItem"
    //mesajIlan["manipule"] = index + " Bu Kısım trackBy fonksiyonu ile eklenmiştir"
    return mesajIlan;
  }

  doInfiniteFavs(infiniteScroll) {
    this.toplamIlan = this.toplamIlan + this.toplamIlanArtis;
    setTimeout(() => {
      infiniteScroll.complete();
    }, 500);
  }

}
