import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { CallNumber } from 'ionic-native';

import { AngularFire } from 'angularfire2';

import { BaseService } from '../services/baseService';

import { ProfildetayPage } from '../profildetay/profildetay';
import { IlanVerPage } from '../ilan-ver/ilan-ver';
import { ImagesShow } from '../components/imagesShow';

@Component({
  selector: 'page-ilan-detay',
  templateUrl: 'ilan-detay.html'
})
export class IlanDetayPage {
  tabBarElement;

  public ilan: any;
  public chats;
  public aktifUid = null;
  public aktifKullaniciChatAcmisMi = false; //her kullanıcı 1 tane chat odası açabilir sonra ordan mesajlaşır
  public favorilereEkliMi = false;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private baseService: BaseService,
    private alertCtrl: AlertController,
    private angularFire: AngularFire,
    private sanitizer: DomSanitizer
  ) {
    this.tabBarElement = document.querySelector('.tabbar');
    this.tabBarElement.style.display = 'none';

    this.ilan = this.navParams.get("item");

    this.angularFire.auth.subscribe(auth => {
      this.aktifUid = auth.uid;
    })
    // Video Ekli ise
    if (this.ilan.youtubeVideoId) {
      this.ilan.youtubeVideoId =
        this.sanitizer.bypassSecurityTrustResourceUrl(
          "https://www.youtube.com/embed/" + this.ilan.youtubeVideoId + "?rel=0&amp;showinfo=0"
        )
    }
  }

  ionViewWillEnter() {
    // CHATS
    let chatsList = this.angularFire.database.list(this.baseService.paths.lists + "/" + this.ilan.$key + "/chats")
      .map(_chats => {
        var list = [];
        var count = 0;
        for (let chat of _chats) {
          this.angularFire.database.list(this.baseService.paths.lists + "/" + this.ilan.$key + "/chats/" + chat.$key + "/messages").subscribe(messages => {
            chat.messages = messages;
          })
          this.angularFire.database.object(this.baseService.paths.users + "/" + chat.olusturanId).subscribe(user => {
            chat.yollayanKullanici = user;
          });
          if (chat.olusturanId == this.aktifUid) count++;
          list.push(chat)
        }
        if (count > 0) this.aktifKullaniciChatAcmisMi = true;
        return list;
      });
    chatsList.subscribe(_chats => {
      this.chats = _chats;
    })
    // FAVORİ KONTROL
    this.favoriKontrol();
    this.yeniMesajGorulduKontrol()
  }

  // TAB GİZLEME
  ionViewWillLeave() {
    this.tabBarElement.style.display = 'flex';
  }

  profilGoruntule(kullanici) {
    let profilDetayModal = this.modalCtrl.create(ProfildetayPage, {
      item: kullanici
    })
    profilDetayModal._cssClass = "profil-detay-modal";
    profilDetayModal.present();
  }

  ilanSahibiniAra() {
    if (this.ilan.ilaniVerenKullanici.telNoPaylasim) {
      var telNo = this.ilan.ilaniVerenKullanici.telNo;
      CallNumber.callNumber(telNo, true)
        .then(() => console.log('Aradı'))
        .catch(() => console.log('Arama İşleminde Hata'));
    } else {
      this.baseService.presentAlert("Kullanıcının Telefon No Kaydı Bulunmamaktadır", "E-Mail Adresi: "+ this.ilan.ilaniVerenKullanici.email);
    }
  }

  ilanDuzenle() {
    let ilanDuzenle = this.modalCtrl.create(IlanVerPage, {
      item: this.ilan
    });
    ilanDuzenle.present();
  }

  ilanSil() {
    let alertSil = this.alertCtrl.create({
      title: 'İlanı silmek istediğinize eminmisiniz ?',
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
            this.angularFire.database.object(this.baseService.paths.lists + "/" + this.ilan.$key + "/durum")
              .set("silindi").then(() => {
                this.navCtrl.pop();
                this.baseService.presentToast("Silme işlemi gerçekleşti");
              })
          }
        }
      ]
    });
    alertSil.present();
  }

  // CHAT İŞLEMLERİ
  chatYolla() {
    let promptMesaj = this.alertCtrl.create({
      title: 'Mesaj Yazınız',
      message: "İlan sahibine soru veya görüş bildirebilirsiniz.",
      inputs: [{ name: 'mesaj', placeholder: 'Mesajınız' }],
      buttons: [{
        text: 'Vazgeç', handler: data => {
          console.log('Sorudan Vazgeçti');
        }
      }, {
        text: 'Gönder', handler: data => {
          var chat = {
            tarihi: new Date().toISOString(),
            olusturanId: this.aktifUid,
            messages: []
          }
          this.angularFire.database.list(this.baseService.paths.lists + "/" + this.ilan.$key + "/chats").push(chat)
            .then(_chat => {
              var message = {
                mesaj: data.mesaj,
                tarihi: new Date().toISOString(),
                yollayanId: this.aktifUid
              }
              this.angularFire.database.list(this.baseService.paths.lists + "/" + this.ilan.$key + "/chats/" + _chat.key + "/messages").push(message)
                .then(_message => {
                  console.log("basarili");
                  this.bildirimYolla(chat, message);
                })
            }).catch(err => {
              console.log(err.message);
            })
        }
      }]
    });
    promptMesaj.present();
  }
  
  mesajYolla(_chat) {
    let promptMesaj = this.alertCtrl.create({
      title: 'Mesaj Yazınız',
      message: "İlan sahibine soru veya görüş bildirebilirsiniz.",
      inputs: [{ name: 'mesaj', placeholder: 'Mesajınız' }],
      buttons: [{
        text: 'Vazgeç', handler: data => {
          console.log('Sorudan Vazgeçti');
        }
      }, {
        text: 'Gönder', handler: data => {
          var message = {
            mesaj: data.mesaj,
            tarihi: new Date().toISOString(),
            yollayanId: this.aktifUid
          }
          this.angularFire.database.list(this.baseService.paths.lists + "/" + this.ilan.$key + "/chats/" + _chat.$key + "/messages")
            .push(message).then(data => {
              console.log("basarili");
              this.bildirimYolla(_chat, message);
            }).catch(err => {
              console.log(err.message);
            })
        }
      }]
    });
    promptMesaj.present();
  }
  
  bildirimYolla(chat, message) {
    if (chat.olusturanId == message.yollayanId) {
      console.log("İLAN SAHİBİNE BİLDİRİM GİTMELİ:uid: " + this.ilan.ilaniVerenKullaniciId)
      // İLAN SAHİBİNE GİDER
      this.angularFire.database.list(this.baseService.paths.users + "/" + this.ilan.ilaniVerenKullaniciId + "/yeniMesajlar")
        .push({
          ilanId: this.ilan.$key,
          mesaj: message.mesaj,
          mesajSahibiId: this.aktifUid
        }).then(() => {
          this.baseService.postNotification(this.ilan.ilaniVerenKullanici.token, this.ilan.baslik, message.mesaj)
        })
    } else {
      console.log("CHAT SAHİBİNE BİLDİRİM GİTMELİ:uid: " + chat.olusturanId)
      // CHATi AÇANA GİDER
      this.angularFire.database.list(this.baseService.paths.users + "/" + chat.olusturanId + "/yeniMesajlar")
        .push({
          ilanId: this.ilan.$key,
          mesaj: message.mesaj,
          mesajSahibiId: this.aktifUid
        }).then(() => {
          this.baseService.postNotification(chat.olusturanId, this.ilan.baslik, message.mesaj)
        })
    }
  }
  
  // FAVORİ İŞLEMLERİ
  favoriKontrol() {
    this.angularFire.database.list(this.baseService.paths.users + "/" + this.aktifUid + "/favorilerim").map(favs => {
      for (let fav of favs) {
        if (fav.$value == this.ilan.$key) {
          return fav.$key;
        }
      }
    }).subscribe(key => {
      if (key) {
        this.favorilereEkliMi = key;
      } else {
        this.favorilereEkliMi = false
      }
    })
  }

  favoriIslem() {
    var _favKey = this.favorilereEkliMi
    if (_favKey) {
      this.angularFire.database.object(this.baseService.paths.users + "/" + this.aktifUid + "/favorilerim/" + _favKey)
        .remove().then(() => {
          this.favorilereEkliMi = false;
          this.baseService.presentToast("Favorilerden Kaldırıldı", 1000, "bottom")
        }).catch(err => {
          alert("Favorilerden Kaldırma İşlemine Hata Oluştu");
          console.log(err);
        })
    } else {
      this.angularFire.database.list(this.baseService.paths.users + "/" + this.aktifUid + "/favorilerim")
        .push(this.ilan.$key).then((fav) => {
          this.favorilereEkliMi = fav.key;
          this.baseService.presentToast("Favorilere Eklendi", 1000, "bottom")
        }).catch((err) => {
          alert("Favorilere Ekleme Sırasında Hata Oluştu");
          console.log(err);
        })
    }
  }

  yeniMesajGorulduKontrol() {
    this.angularFire.database.list(this.baseService.paths.users + "/" + this.aktifUid + "/yeniMesajlar")
      .subscribe(messages => {
        messages.forEach(message => {
          if (this.ilan.$key == message.ilanId) {
            this.angularFire.database.object(this.baseService.paths.users + "/" + this.aktifUid + "/yeniMesajlar/" + message.$key)
              .remove().then(() => {
                console.log("EKSİLDİ")
              });
          }
        });
      })
  }
  
  goImagesShow(allImages, selectIndex) {
    var obj = {
      allImages: allImages,
      selectIndex: selectIndex
    }
    let imagesShowModal = this.modalCtrl.create(ImagesShow, {
      item: obj
    });
    imagesShowModal.present();
  }

}
