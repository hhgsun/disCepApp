import { Component, trigger, state, style, transition, animate, keyframes } from '@angular/core';
import { NavController, ViewController, NavParams } from 'ionic-angular';
import { AngularFire, AuthProviders, AuthMethods } from 'angularfire2';

import { BaseService } from '../services/baseService'
//import { TabsPage } from '../tabs/tabs';

declare var FCMPlugin: any;

@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
    animations: [
        //For the logo
        trigger('flyInBottomSlow', [
            state('in', style({
                transform: 'translate3d(0,0,0)'
            })),
            transition('void => *', [
                style({ transform: 'translate3d(0,2000px,0' }),
                animate('2000ms ease-in-out')
            ])
        ]),
        //For the background detail
        trigger('flyInBottomFast', [
            state('in', style({
                transform: 'translate3d(0,0,0)'
            })),
            transition('void => *', [
                style({ transform: 'translate3d(0,2000px,0)' }),
                animate('1000ms ease-in-out')
            ])
        ]),
        //For the login form
        trigger('bounceInBottom', [
            state('in', style({
                transform: 'translate3d(0,0,0)'
            })),
            transition('void => *', [
                animate('2000ms 200ms ease-in', keyframes([
                    style({ transform: 'translate3d(0,2000px,0)', offset: 0 }),
                    style({ transform: 'translate3d(0,-20px,0)', offset: 0.9 }),
                    style({ transform: 'translate3d(0,0,0)', offset: 1 })
                ]))
            ])
        ]),
        //For login button
        trigger('fadeIn', [
            state('in', style({
                opacity: 1
            })),
            transition('void => *', [
                style({ opacity: 0 }),
                animate('1000ms 2000ms ease-in')
            ])
        ])
    ]
})
export class LoginPage {
    logoState: any = "in";
    cloudState: any = "in";
    loginState: any = "in";
    formState: any = "in";

    public kayitOlPage = null;
    public sifreYenilePage = null;
    public girisYapilmisMi = true;
    public loginData: any = {};
    public registerData: any = {};
    public passResetMail: string;

    constructor(private navCtrl: NavController, private navParams: NavParams, private viewCtrl: ViewController, public angularFire: AngularFire, public baseService: BaseService) {
        // Yeni Sayfada gelen isteğe göre değişkene atama yapıyoruz.
        if (navParams.get("kayitSayfasiTitle")) {
            this.kayitOlPage = navParams.get("kayitSayfasiTitle");
        }
        if (navParams.get("sifreYenileTitle")) {
            this.sifreYenilePage = navParams.get("sifreYenileTitle");
        }
    }

    girisYap() {
        if (this.loginData.email == null || this.loginData.password == null) {
            this.baseService.presentAlert("Hata", "Lütfen Alanları Doldurunuz");
        } else {
            this.baseService.presentLoading("Lütfen Bekleyiniz");
            this.angularFire.auth.login(this.loginData, {
                provider: AuthProviders.Password,
                method: AuthMethods.Password
            }).then(login => {
                // ! TOKEN İŞLEMLERİ
                FCMPlugin.getToken((token) => {
                    this.baseService.tokenKayit(login.uid, token);
                }, (err) => { console.log(' Token Oluşturulmadı ' + err); });
                FCMPlugin.subscribeToTopic('discep',
                    (data: any) => {
                        console.log(data)
                    },
                    (err: any) => {
                        console.log(err);
                    }
                );
                this.baseService.presentLoadingDismiss();
                //this.navCtrl.push(TabsPage);
            }).catch((error: any) => {
                this.baseService.presentLoadingDismiss();
                console.log(error.message)
                switch (error.code) {
                    case "auth/invalid-email":
                        this.baseService.presentAlert("Hata", "E-posta adresi hatalı girilmiş");
                        break;
                    case "auth/user-not-found":
                        this.baseService.presentAlert("Hata", "Girilen Mail adresi ile hesap yok veya silinmiş");
                        break;
                    case "auth/wrong-password":
                        this.baseService.presentAlert("Hata", "Parola geçersiz");
                        break;
                    default:
                        console.log("Bilinmeyen Hata: switch-case default");
                        break;
                }
            })
        }
    }

    kayitOl() {
        if (
            this.registerData.ad == null || this.registerData.ad == "" ||
            this.registerData.soyad == null || this.registerData.soyad == "" ||
            this.registerData.email == null || this.registerData.email == "" ||
            this.registerData.password == null || this.registerData.password == ""
        ) {
            this.baseService.presentAlert("Uyarı","Lütfen Alanları Doldurunuz");
        } else {
            if (this.registerData.password == this.registerData.passwordRep) {
                this.baseService.presentLoading("Lütfen Bekleyiniz");
                var credentials = {
                    email: this.registerData.email,
                    password: this.registerData.password
                }
                this.angularFire.auth.createUser(credentials).then((data: any) => {
                    this.angularFire.database.object(this.baseService.paths.users + "/" + data.uid)
                        .set({
                            userId: data.uid,
                            email: this.registerData.email,
                            ad: this.registerData.ad,
                            soyad: this.registerData.soyad,
                            avatar: this.baseService.paths.defaultAvatar,
                            authClass: "normal"
                        }).then((cal: any) => {
                            console.log(cal);
                            FCMPlugin.getToken((token) => {
                                this.baseService.tokenKayit(data.uid, token);
                            }, (err) => { console.log(' Token Oluşturulmadı ' + err); });
                            FCMPlugin.subscribeToTopic('discep',
                                (data: any) => {
                                    console.log(data)
                                },
                                (err: any) => {
                                    console.log(err);
                                }
                            );
                            this.baseService.presentLoadingDismiss();
                        })
                }).catch((error: any) => {
                    this.baseService.presentLoadingDismiss();
                    console.log(error.message);
                    switch (error.code) {
                        case "auth/invalid-email":
                            this.baseService.presentAlert("Hata", "Geçersiz E-mail adresi girdiniz");
                            break;
                        case "auth/email-already-in-use":
                            this.baseService.presentAlert("Hata", "Bu E-mail adresi kullanımda, Lütfen başka bir E-mail adresi deneyiniz");
                            break;
                        case "auth/weak-password":
                            this.baseService.presentAlert("Hata", "Şifre en az 6 karakter olmalıdır");
                            break;
                        default:
                            this.baseService.presentAlert("Hata", "Bilinmeyen bir Hata, Lütfen dikkatli bir şekilde tekrar deneyiniz");
                            break;
                    }
                })
            } else {
                this.baseService.presentAlert("Hata", "Şifre Tekrarı Aynı Olmalıdır");
            }
        }
    }

    sifreYenile() {
        var auth = firebase.auth();
        auth.sendPasswordResetEmail(this.passResetMail).then((data: any) => {
            alert("Mail adresinize şifre yenileme linki gönderildi")
            console.log("Mail adresinize link gönderildi");
        }, (error: any) => {
            console.log(error.message);
            switch (error.code) {
                case "auth/invalid-email":
                    alert("Geçersiz E-mail adresi girdiniz");
                    break;
                default:
                    alert("Bilinmeyen bir Hata, Lütfen dikkatli bir şekilde tekrar deneyiniz");
                    break;
            }
        });
    }

    // Aynı Sayfa içinde yeni sayfa açılıyormuş gibi gözükmesi için neyin push edildiğini görüyoruz.
    kayitOlSayfasiniAc() {
        this.navCtrl.push(LoginPage, {
            kayitSayfasiTitle: "Kayıt Ol"
        });
    }
    sifreYenileSayfasiniAc() {
        this.navCtrl.push(LoginPage, {
            sifreYenileTitle: "Şifre Yenile"
        });
    }
}
