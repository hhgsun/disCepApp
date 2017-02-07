# DisCepApp

Google Firebase'i uygulamanıza ekleyin

// Initialize Firebase var config = { ... };

Firebase den Cloud Messaging jetonu key= kısmına ekleyin

// headers.append('Authorization', 'key=AAAAsUm1yRM:APA91bGp...'

----

1- Java, Android sdk tools install - node install

   // https://github.com/fechanique/cordova-plugin-fcm FCM eklentisi için gerekli sdk lar kurulmalı

   // google-services.json dosyasını firebaseden indirip platform/android içine atın

   // ios için gerekli gerekli dosyaya fcm git adresinden bakın

2- npm install

3- ionic state reset

   // ionic serve (bu öncelikle yapmalıyız ki www klasörünü oluştursun yoksa cordova projesi tanımlanmaz)

4- ionic resources

5- ionic platform add android

   // config.xml de com.ionicframework.discepapp633444 tarzındaki isim firebase deki genel ayarlardan uygulamalarımda paket adı ile aynı olmalı değilse yeni uygulama ekle denmeli ve paket adını config.xml deki ismi girilmeli

6- ionic build android