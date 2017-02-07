import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { LoginPage } from '../login/login';

@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html'
})
export class IntroPage {
  slides = [
    {
      title: "DişCep!",
      description: "Uygulama içi ilan paylaşımı, alım satım, dental dünyası ile iletişim kurmanızı sağlayan uygulama",
      image: "assets/images/intro-1.png",
    },
    {
      title: "Diş Dünyası",
      description: "<b>DişCep</b> uygulaması size heryerde ulaşmanızı sağlar, yeter ki bir mobil cihazınız olsun",
      image: "assets/images/intro-2.png",
    },
    {
      title: "Dental Market?",
      description: "<b>DişCep</b> tüm satıcıları aynı platformda birleştiriyor, Tek yapmanız gereken giriş yaparak bize katılmak",
      image: "assets/images/intro-3.png",
    }
  ];

  constructor(public navCtrl: NavController) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad IntroPage');
  }

  devamEt() {
    this.navCtrl.setRoot(LoginPage);
  }

}
