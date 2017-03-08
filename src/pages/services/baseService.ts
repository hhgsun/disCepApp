import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
// import { File, FileReader } from 'ionic-native';
import { ToastController, LoadingController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http, Headers } from '@angular/http';

import { AngularFire } from 'angularfire2';
import * as firebase from "firebase";

//declare var firebase: any;
declare var window: any;
//declare var cordova: any;

@Injectable()
export class BaseService {

    // APP BASE SETTİNG /////////////////////////////////////////////////////////////////
    // Uygulamanın her yerinde bu bilgiler dağıtıldı ____________________________________
    public toplamIlan: number = 100;
    public toplamIlanArtis: number = 100;

    public paths = {
        lists: "ilanlar",
        users: "users",
        categories: "kategoriler",
        notifications: "bildirimler",
        storagePats: {
            lists: "IlanResimleri",
            users: "AvatarResimleri",
            categories: "KategoriResimleri",
            imagePrefix: "time---" + new Date().toISOString()
        },
        defaultAvatar: {
            downloadUrl: "assets/images/avatareklenmemis.jpg",
            fbPath: "local",
            name: "avatareklenmemis.jpg"
        },
        defaultImages: {
            downloadUrl: "assets/images/resimeklenmemis.jpg"
        },
        logs: "loglar",
        gcmServerKey: "AAAAsUm1yRM:APA91bGp6oO75q48qvu7Sy5vA7x7aFQTeSEhUL9MNWkHn_fTofb5tl6MLj9c6HpqTQvqaz44CipJ5We_zX4tYuTMAPaal5AH1opFwMAmGNTpn5IySf3wGcr2NCXEjSidFOzSpTrePe55-FOLaxSE91ugAHhLwvdHig"
    }
    // ///////////////////////////////////////////////////////////////// APP BASE SETTİNG

    private loading;

    constructor(
        private angularFire: AngularFire,
        private storage: Storage,
        private toastCtrl: ToastController,
        private loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        private http: Http
    ) {

    }

    addLog(logKonu: string, obj: any) {
        var logData = { konu: logKonu, params: obj }
        this.angularFire.database.list(this.paths.logs).push(logData);
    }

    presentLoading(text: string) {
        this.loading = this.loadingCtrl.create({
            content: text
        });
        this.loading.present()
    }

    presentLoadingDismiss() {
        this.loading.dismiss()
    }

    presentToast(message: string, duration?: number, position?: string) {
        let toast = this.toastCtrl.create({
            message: message,
            duration: duration ? duration : 2000,
            position: position ? position : "bottom"
        });
        toast.present();
    }

    presentAlert(_title: string, _subtitle: string, _buttonText?: string) {
        var buttonText = _buttonText ? _buttonText : "Tamam";
        console.log(buttonText)
        let alert = this.alertCtrl.create({
            title: _title,
            subTitle: _subtitle,
            buttons: [buttonText]
        });
        alert.present();
    }

    aktifKullanici() {
        return new Promise((success, reject) => {
            this.angularFire.auth.subscribe(auth => {
                if (auth) {
                    this.angularFire.database.object(this.paths.users + "/" + auth.uid)
                        .subscribe(userData => {
                            success(userData);
                        })
                } else {
                    reject(null);
                }
            })
        })
    }

    aktifKullaniciId() {
        return new Promise((success, reject) => {
            this.angularFire.auth.subscribe(auth => {
                if (auth) {
                    success(auth.uid);
                } else {
                    reject(null);
                }
            })
        })
    }

    authClassPremiumFinishCtrl(user) { //premium üyelik tarihi bittimi
        if (user.authClassPremiumFinishDate) {
            var datenow = new Date().toISOString(); //2017-12-31 formatında olmalı
            if (user.authClassPremiumFinishDate < datenow) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }


    /* Bildirim Yollama Ve Token ****************************************************/
    tokenKayit(userId: any, token: any) {
        var _storeageStr = 'disCepApp@@@@' + userId + '@@@@token';
        this.angularFire.database.object(this.paths.users + "/" + userId).subscribe(user => {
            this.storage.get(_storeageStr).then(getToken => {
                if (getToken == null || user.token != getToken) {
                    this.angularFire.database.object(this.paths.users + "/" + userId + "/token")
                        .set(token).then(() => {
                            this.storage.set(_storeageStr, token);
                        }).catch(err => {
                            console.log("Token Kaydında Hata")
                        })
                }
            })
        })
    }

    postNotification(token: string, baslik: string, mesaj: string) {
        return new Promise((resolve, reject) => {
            if (token) {
                var pushData = {
                    "notification": {
                        "title": baslik,
                        "body": mesaj,
                        "sound": "default",
                        "icon": "fcm_push_icon",
                        "text": "5 to 1",
                        "content_available": 1,
                        "volume" : "3.21.15"
                    },
                    "to": token,
                    "priority": "high"
                };
                var headers = new Headers();
                headers.append('Content-Type', 'application/json');
                headers.append('Authorization', 'key=' + this.paths.gcmServerKey);
                return this.http.post('https://gcm-http.googleapis.com/gcm/send',
                    pushData, { headers: headers }).map(res => res.json())
                    .subscribe(data => {
                        resolve(data); //callback
                    },
                    error => reject(error),
                    () => {
                        console.log("Bildirim Gönderildi");
                    });
            } else {
                console.log("Size ait bir token yok-oluşturulmamış -yeniden giriş yapınız");
            }
        });
    }


    /* BLOB a çevirme Ve Firebase e Image Upload****************************************************/
    // http://stackoverflow.com/questions/39018980/firebase-storage-v3-returning-multipart-body-does-not-contain-2-or-3-parts-on
    imgUpload(_images: any) {
        return new Observable((observer) => {
            var pathStr = this.paths.storagePats.lists;
            var yuklenenData = [];
            var yukluData = [];
            var count = 0;
            for (let image of _images) {
                count++;
                if (image.name == "local") {
                    this.uploadImageSync(image.downloadUrl, pathStr)
                        .subscribe((data: any) => {
                            yuklenenData.push(data)
                            if (count == _images.length) {
                                var listBirlestir = yuklenenData.concat(yukluData);
                                console.log(listBirlestir.length)
                                observer.next(listBirlestir);
                            }
                        })
                } else {
                    yukluData.push(image)
                    if (count == _images.length) {
                        var listBirlestir = yuklenenData.concat(yukluData);
                        observer.next(listBirlestir);
                    }
                }
            }
            if (_images.length == 0) { observer.next([]); }
        });
    }

    avatarUpload(_imageData, imagePrefix?: string) {
        return new Observable(observer => {
            this.uploadImageSync(_imageData, this.paths.storagePats.users, imagePrefix)
                .subscribe(data => {
                    observer.next(data);
                })
        });
    }

    private blobFormataCevir(fileReaderData, mimeString) {
        try {
            var blob = new Blob([fileReaderData], {
                type: mimeString
            });
            console.log(blob);
            return blob;
        } catch (err) {
            var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
            var bb = new BlobBuilder();
            bb.append(fileReaderData);
            return bb.getBlob(mimeString);
        }
    };

    private uploadImageSync(localImageFileUrl, uploadPath, imagePrefix?: string) {
        // Observable ile dönen datayı .map ile okursan Sync .subscribe ile okursan Async olur
        return new Observable(observer => {
            // local file okuma
            window.resolveLocalFileSystemURL(localImageFileUrl, (fileEntry) => {
                fileEntry.file((file) => {
                    var reader = new FileReader();
                    reader.onloadend = (fileReaderData: any) => {
                        try {
                            // Bloba çevirme
                            var imageBlob = this.blobFormataCevir(fileReaderData.target.result, 'image/jpeg');
                            var metadata = { contentType: 'image/jpeg' };

                            // Kök referanslar
                            imagePrefix = imagePrefix ? imagePrefix + "@@@@" : "";
                            var fileName = imagePrefix + this.paths.storagePats.imagePrefix + "@@@@" + file.name;
                            var storageRef = firebase.storage().ref(uploadPath);
                            var fileRef = storageRef.child(fileName);

                            //Upload Blob
                            var uploadTask = fileRef.put(imageBlob, metadata);
                            uploadTask.on('state_changed', (snapshot) => {
                                // Observe state change events such as progress, pause, and resume
                            }, (error: any) => {
                                console.log(error);
                                observer.error("Upload Hata: " + error.code + ": " + error.message);
                            }, () => {
                                var downloadURL = uploadTask.snapshot.downloadURL;
                                observer.next({
                                    fbPath: fileRef.toString(),
                                    name: fileName,
                                    downloadUrl: downloadURL
                                });
                            });
                        } catch (err) { observer.error("Upload Hata: " + err.message) }
                    };
                    try { reader.readAsArrayBuffer(file) } catch (err) { observer.error("readAsArrayBuffer hata: " + err) }
                }, fileFailure => { observer.error("Dosya nesnesi oluşturulamadı") });
            }, fileEntryFailure => { observer.error("Resim için fileEntry bulunamadı") });
        })
    }

    removeStorage(removeBasePath: string, storageObj: any) {
        return new Promise((resolve, reject) => {
            try {
                var storageRef = firebase.storage().ref(removeBasePath);
                var removeRef = storageRef.child(storageObj.name);
                removeRef.delete().then(() => {
                    console.log("Eski Resim Silme Basarili")
                }).catch((error) => {
                    reject(error)
                });
            } catch (error) {
                console.log(error.value.serverResponse.error.message)
            }
        });
    }
}