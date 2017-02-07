import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController, Searchbar } from 'ionic-angular';

import { AngularFire } from 'angularfire2';

import { BaseService } from '../services/baseService'
import { IlanDetayPage } from '../ilan-detay/ilan-detay'

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {
  @ViewChild('searchbar') searchbar: Searchbar;
  public ilanlar = [];
  public ilanlarList = [];
  public searchText = null;
  toplamIlan = this.baseService.toplamIlan;
  toplamIlanArtis = this.baseService.toplamIlanArtis;
  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private angularFire: AngularFire,
    private viewCtrl: ViewController,
    private baseService: BaseService
  ) { }

  ionViewDidLoad() {
    this.items();
  }

  ionViewDidEnter() {
    this.searchbar.setFocus();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  items() {
    this.angularFire.database.list(this.baseService.paths.lists).map(list => {
      var _list = [];
      for (let item of list) {
        this.angularFire.database.object(this.baseService.paths.users + "/" + item["ilaniVerenKullaniciId"]).map(_user => {
          return _user;
        }).subscribe(_user => {
          item["ilaniVerenKullanici"] = _user;
          _list.push(item);
        })
      }
      return _list;
    }).subscribe(_list => {
      this.ilanlarList = _list;
    })
  }

  searchGet(event) {
    // Reset items back to all of the items
    this.ilanlar = this.ilanlarList;

    // set val to the value of the ev target
    var val = event.target.value;
    this.searchText = val;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.ilanlar = this.ilanlar.filter((item) => {
        return (item.baslik.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    } else {
      this.ilanlar = [];
    }
  }

  ilanDetay(ilan) {
    this.navCtrl.push(IlanDetayPage, {
      item: ilan
    });
  }

  doInfinite(event) {
    this.toplamIlan = this.toplamIlan + this.toplamIlanArtis;
    setTimeout(() => {
      event.complete();
    }, 500);

  }

}
