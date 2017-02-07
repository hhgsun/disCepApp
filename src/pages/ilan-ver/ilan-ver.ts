import { Component } from '@angular/core';
import { ViewController, NavParams, AlertController } from 'ionic-angular';
import { Camera } from 'ionic-native';

import { AngularFire } from 'angularfire2';
import { BaseService } from '../services/baseService';

//import { TabsPage } from '../tabs/tabs';

@Component({
  selector: 'page-ilanver',
  templateUrl: 'ilan-ver.html'
})
export class IlanVerPage {
  public authClass: string = 'normal';
  public authClassPremiumFinish: boolean;

  public updateData;
  public tumKategoriler;

  public secilenResimler = [];
  public silinecekResimler = [];

  public ilanVerData: {
    baslik?: string,
    aciklama?: string,
    adres?: string,
    kategorileri?: JSON,
    eklemeTarihi?: string,
    guncellemeTarihi?: string,
    resimler?: any,
    ilaniVerenKullaniciId?: any,
    durum?: any,
    youtubeVideoId?: string,
    premium?: boolean
  } = {};

  constructor(
    private viewCtrl: ViewController,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private angularFire: AngularFire,
    private baseService: BaseService
  ) {

    this.updateData = this.navParams.get("item");
    if (this.updateData) {
      this.ilanVerData.baslik = this.updateData["baslik"] || null;
      this.ilanVerData.aciklama = this.updateData["aciklama"] || null;
      this.ilanVerData.adres = this.updateData["adres"] || null;
      this.ilanVerData.kategorileri = this.updateData["kategorileri"] || null;
      this.secilenResimler = this.updateData["resimler"] || []
    }

  }

  ionViewWillEnter() {
    this.angularFire.database.list(this.baseService.paths.categories).subscribe(kategoriler => {
      this.tumKategoriler = kategoriler;
    })
    this.baseService.aktifKullanici().then((user: any) => {
      this.ilanVerData.ilaniVerenKullaniciId = user.userId;
      this.authClass = user.authClass; // ilan verenin statüsü
      if (user.authClass == "premium") {
        this.authClassPremiumFinish = this.baseService.authClassPremiumFinishCtrl(user);
        console.log(this.authClassPremiumFinish)
      }
    })
  }

  dismiss() {// modal kapatır
    this.viewCtrl.dismiss();
  }

  resimSecInput(event) {
    console.log(event.srcElement.files)
    this.secilenResimler = event.srcElement.files;
  }

  resimSec() {
    Camera.getPicture({
      destinationType: Camera.DestinationType.NATIVE_URI, // 0
      mediaType: 0,
      sourceType: 0,//burası telefon içi kütüphaneyi açıyor resimler klasörü...
      targetWidth: 800,
      targetHeight: 800
    }).then((imageData) => {
      // var base64Image = "data:image/jpeg;base64," + imageData;
      var resimData = {
        downloadUrl: imageData,
        name: "local"
      }
      this.secilenResimler.push(resimData);
    }, (err) => {
      console.log(err);
    });
  }

  resimDetay(secilenRes) {
    var index = this.secilenResimler.indexOf(secilenRes);

    let alertA = this.alertCtrl.create(
      {
        title: "Seçilen Resmi Kaldır",
        subTitle: "<img src='" + secilenRes.downloadUrl + "' style='width:90%;'>",
        buttons: [
          {
            text: 'Vazgeç', handler: (data) => { }
          },
          {
            text: "Kaldır",
            handler: (data) => {
              this.secilenResimler.splice(index, 1);
              //veritabınından kaldırmak için
              if (this.updateData) {
                if (secilenRes.name != "local") {
                  this.silinecekResimler.push(secilenRes)
                }
              }
            }
          }
        ]
      });
    alertA.present();
  }

  // GÖNDER - GÜNCELLE :publishType
  ilaniGonder(publishType: string) {
    if (this.ilanVerData["baslik"] === undefined || this.ilanVerData["baslik"] === "") {
      this.baseService.presentAlert("Uyarı", "Başlık Giriniz")
    } else if (this.ilanVerData["aciklama"] === undefined || this.ilanVerData["aciklama"] === "") {
      this.baseService.presentAlert("Uyarı", "Lütfen Açıklama Giriniz")
    } else if (this.ilanVerData["adres"] === undefined || this.ilanVerData["aciklama"] === "") {
      this.baseService.presentAlert("Uyarı", "Lütfen Adres Giriniz")
    } else if (this.ilanVerData["kategorileri"] === undefined || this.ilanVerData["kategorileri"] === null) {
      this.baseService.presentAlert("Uyarı", "Lütfen Kategori Belirleyiniz")
    } else {

      if (publishType == "gonder") {
        this.ilanVerData.durum = "beklemede";
        if (this.secilenResimler.length > 0) {
          this.ilaniGonder_Resimli();
        } else {
          this.ilaniGonder_Normal();
        }
      } else {
        var eskiResimler = this.updateData["resimler"] ? this.updateData["resimler"] : [];
        if (eskiResimler.length > 0 || this.secilenResimler.length > 0) {
          this.ilaniGuncelle_Resimli();
        } else {
          this.ilaniGuncelle_Normal();
        }
      }

    }
  }
  //GONDER
  private ilaniGonder_Resimli() {
    this.baseService.presentLoading("Lütfen Bekleyiniz")
    this.baseService.imgUpload(this.secilenResimler)
      .subscribe((upRes: any) => {
        if (upRes.length == this.secilenResimler.length) {
          this.ilanVerData.resimler = upRes;
          this.angularFire.database.list(this.baseService.paths.lists).push(this.ilanVerData).then(() => {
            this.baseService.presentLoadingDismiss()
            this.baseService.presentToast("İlanınız Başarıyla Verildi");
            this.viewCtrl.dismiss();
          }).catch(err => {
            this.baseService.presentLoadingDismiss()
          });
        }
      });
  }

  private ilaniGonder_Normal() {
    this.baseService.presentLoading("Lütfen Bekleyiniz")
    this.angularFire.database.list(this.baseService.paths.lists).push(this.ilanVerData).then(data => {
      this.baseService.presentLoadingDismiss()
      this.baseService.presentToast("İlanınız Başarıyla Verildi");
      this.viewCtrl.dismiss();
    }).catch(err => {
      this.baseService.presentLoadingDismiss()
    });
  }

  //GÜNCELLE
  private ilaniGuncelle_Resimli() {
    this.baseService.presentLoading("Lütfen Bekleyiniz")
    this.baseService.imgUpload(this.secilenResimler)
      .subscribe((upRes: any) => {
        if (upRes.length == this.secilenResimler.length) {
          this.ilanVerData.resimler = upRes;
          this.angularFire.database.object(this.baseService.paths.lists + "/" + this.updateData.$key)
            .update(this.ilanVerData).then(() => {
              this.silinecekResimleriVeritabanındaSil();
              this.baseService.presentLoadingDismiss()
              this.baseService.presentToast("İlanınız Başarıyla Güncellendi");
              this.viewCtrl.dismiss();
            }).catch(err => {
              this.baseService.presentLoadingDismiss()
            });
        }
      })
  }

  private ilaniGuncelle_Normal() {
    this.baseService.presentLoading("Lütfen Bekleyiniz")
    this.angularFire.database.object(this.baseService.paths.lists + "/" + this.updateData.$key)
      .update(this.ilanVerData).then(() => {
        this.baseService.presentLoadingDismiss()
        this.baseService.presentToast("İlanınız Başarıyla Güncellendi");
        this.viewCtrl.dismiss();
      }).catch(err => {
        this.baseService.presentLoadingDismiss()
      });
  }

  private silinecekResimleriVeritabanındaSil() {
    if (this.silinecekResimler.length > 0) {
      this.silinecekResimler.forEach(silObj => {
        this.baseService.removeStorage(this.baseService.paths.storagePats.lists, silObj).then(() => {
          console.log("storageden istenmeyen resim silindi")
        }).catch(err => {
          console.log("istenmeyen resim silinirken hata: " + err)
        })
      });
    }
  }
}