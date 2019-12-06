const app = getApp();

Page({
  data: {
    nomore: false,
    nodata: true,

    // no region object
    nro: {
      name: '全部',
      code: false
    },

    province: 0,
    city: 0,
    region: 0,

    province_list: [],
    city_list: [],
    region_list: []
  },
  onLoad() {
    this.data.province_list.unshift(this.data.nro);
    this.data.city_list.unshift(this.data.nro);
    this.data.region_list.unshift(this.data.nro);

    this.getProvinceList();
  },
  // 获取省列表
  getProvinceList() {
    app.ajax('api/getProvinceList', null, res => {
      res.unshift(this.data.nro);
      this.setData({ province_list: res })
    });
  },
  // 获取市列表
  getCityList() {
    app.ajax('api/getCityList', {province_code: this.data.province_list[this.data.province].code}, res => {
      res.unshift(this.data.nro);
      this.setData({ city_list: res })
    });
  },
  // 获取区列表
  getRegionList() {
    app.ajax('api/getRegionList', {city_code: this.data.city_list[this.data.city].code}, res => {
      res.unshift(this.data.nro);
      this.setData({ region_list: res })
    });
  },
  area_change(e) {
    console.log(e.currentTarget.dataset.type);
    switch (e.currentTarget.dataset.type) {
      case '1':
        this.setData({
          province: parseInt(e.detail.value),
          city: 0,
          region: 0,
          region_list: [this.data.nro]
        }, () => {
          this.getCityList();
        });
        break;
      case '2':
        this.setData({
          city: parseInt(e.detail.value),
          region: 0
        }, () => {
          this.getRegionList();
        });
        break;
      case '3':
        this.setData({region: parseInt(e.detail.value)});
        break;
    }
  }
});