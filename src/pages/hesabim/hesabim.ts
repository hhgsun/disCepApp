import { Component } from '@angular/core';

import { NavController, Platform, AlertController, NavParams, ViewController, ToastController, ModalController } from 'ionic-angular';
import { Camera } from 'ionic-native';

import { AngularFire } from 'angularfire2';
import { BaseService } from '../services/baseService';
import { IlanDetayPage } from '../ilan-detay/ilan-detay';
import { LoginPage } from '../login/login';
import { ProfildetayPage } from '../profildetay/profildetay';

import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-hesabim',
  templateUrl: 'hesabim.html'
})
export class HesabimPage {
  public kullanici: {
    userId?: string,
    ad?: string,
    soyad?: string,
    email?: string,
    yeniSifre?: string,
    meslek?: string,
    telNo?: string,
    telNoPaylasim?: boolean,
    avatar?: any,
    authClass?: any
  } = {};

  constructor(
    private viewCtrl: ViewController,
    private navCtrl: NavController,
    private navParams: NavParams,
    private baseService: BaseService,
    private platform: Platform,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private storage: Storage,
    private angularFire: AngularFire,
    private modalCtrl: ModalController
  ) {

  }

  ionViewDidLoad() {
    this.baseService.aktifKullanici().then((userData: any) => {
      this.kullanici = userData;
    })
  }

  cikisYap() {
    let alertCikis = this.alertCtrl.create({
      title: 'Çıkış yapmak istediğinize eminmisiniz ?',
      // message: 'alt mesaj',
      buttons: [
        {
          text: 'Vazgeç',
          role: 'cancel',
          handler: () => {
            console.log("Çıkıştan Vazgeçtin");
          }
        },
        {
          text: 'Çıkış Yap',
          handler: () => {
            console.log('Uygulamadan Çıkış Yapıldı');
            this.storage.clear();
            this.angularFire.auth.logout();
            this.navCtrl.setRoot(LoginPage);
            this.platform.exitApp();
          }
        }
      ]
    });
    alertCikis.present();
  }

  profilGoruntule(kullanici) {
    let profilDetayModal = this.modalCtrl.create(ProfildetayPage, {
      item: kullanici
    });
    profilDetayModal._cssClass = "profil-detay-modal";
    profilDetayModal.present();
  }

  profilGuncelle() {
    var updateData = {
      ad: (this.kullanici.ad == undefined) ? null : this.kullanici.ad,
      soyad: (this.kullanici.soyad == undefined) ? null : this.kullanici.soyad,
      meslek: (this.kullanici.meslek == undefined) ? null : this.kullanici.meslek,
      telNo: (this.kullanici.telNo == undefined) ? null : this.kullanici.telNo,
      telNoPaylasim: (this.kullanici.telNoPaylasim == undefined) ? null : this.kullanici.telNoPaylasim
    }
    var user = this.angularFire.database.object(this.baseService.paths.users + "/" + this.kullanici.userId);
    user.update(updateData).then(data => {
      this.baseService.presentToast("Güncelleme Yapıldı");
    }).catch(err => {
      console.log("HATA: " + err.message);
    })
  }

  ilanDetay(ilan) {
    this.navCtrl.push(IlanDetayPage, {
      item: ilan
    })
  }

  avatarDetay(avatar) {
    if (!avatar) {
      avatar = this.baseService.paths.defaultAvatar;
    }
    let alertA = this.alertCtrl.create(
      {
        title: "Profil Resmini Düzenle",
        subTitle: "<img src='" + avatar.downloadUrl + "' style='width:90%;'>",
        buttons: [
          {
            text: 'Kapat', handler: (data) => { }
          },
          {
            text: 'Değiştir', handler: (data) => {
              this.avatarDegistir();
            }
          },
          {
            text: 'Sil', handler: (data) => {
              this.avatarSil(avatar);
            }
          }
        ]
      });
    alertA.present();
  }

  avatarSil(secilenRes) {
    let alert = this.alertCtrl.create({
      title: 'Profil resminizi silmek istediğinize eminmisiniz ?',
      // message: 'alt mesaj',
      buttons: [
        {
          text: 'Vazgeç',
          role: 'cancel',
          handler: () => {
            console.log("Vazgeçtin");
          }
        },
        {
          text: 'Sil',
          handler: () => {
            var eskiAvatar = this.kullanici.avatar;
            var yeniAvatar = this.baseService.paths.defaultAvatar;
            this.angularFire.database.object(this.baseService.paths.users + "/" + this.kullanici.userId + "/avatar")
              .update(yeniAvatar)
              .then(data => {
                this.kullanici.avatar = this.baseService.paths.defaultAvatar;
                this.baseService.presentToast("Profil Resminiz Silindi")
                this.baseService.removeStorage(this.baseService.paths.storagePats.users, eskiAvatar);
              })
          }
        }
      ]
    });
    alert.present();
  }

  avatarDegistir() {
    Camera.getPicture({
      destinationType: Camera.DestinationType.NATIVE_URI, // 0
      mediaType: 0,
      sourceType: 0,//burası telefon içi kütüphaneyi açıyor resimler klasörü...
      targetWidth: 400,
      targetHeight: 400
    }).then((imageData) => {
      // var base64Image = "data:image/jpeg;base64," + imageData;
      if (imageData) {
        try {
          // önceden eklenmemiş ise direk upload eder
          if (this.kullanici.avatar["downloadUrl"] == this.baseService.paths.defaultAvatar.downloadUrl || this.kullanici.avatar == undefined || this.kullanici.avatar == null) {
            this.baseService.avatarUpload(imageData, this.kullanici.userId).subscribe((uploadData: any) => {
              this.angularFire.database.object(this.baseService.paths.users + "/" + this.kullanici.userId + "/avatar")
                .set(uploadData)
                .then(() => { this.baseService.presentToast("Profil Resminiz Değiştirildi") })
            })
          } else {
            //önceden upload edilmiş ise eski uploadı siler.
            var eskiAvatar = this.kullanici.avatar;
            this.baseService.avatarUpload(imageData, this.kullanici.userId).subscribe((uploadData: any) => {
              this.angularFire.database.object(this.baseService.paths.users + "/" + this.kullanici.userId + "/avatar")
                .set(uploadData)
                .then(data => {
                  this.baseService.presentToast("Profil Resminiz Değiştirildi");
                  this.baseService.removeStorage(this.baseService.paths.storagePats.users, eskiAvatar);
                })
              this.kullanici.avatar = uploadData;
            })
          }
        } catch (error) {
          console.log(error)
        }


      } else {
        console.log("Değiştirme işlemi resim seçilmediği için gerçekleşmedi");
      }
    }, (err) => {
      console.log(err);
    });
  }
}
