const app = getApp();

Page({
  data: {
    type: 1,

    loading: false,

    // 博物馆
    museum_list: [],
    museum_page: 1,
    museum_nomore: false,
    museum_nodata: false,

    // 设计师
    designer_list: [],
    designer_page: 1,
    designer_nomore: false,
    designer_nodata: false,

    // 工厂
    factory_list: [],
    factory_page: 1,
    factory_nomore: false,
    factory_nodata: false,
    search: '',
    nro: {
      name: '全部',
      code: false
    },
    province: 0,
    city: 0,
    region: 0,
    province_list: [],
    city_list: [],
    region_list: [],

    uid: 0
  },
  onLoad(options) {
    this.setData({
      type: parseInt(options.type),
      uid: app.user_data.uid
    });
    this.set_title(this.data.type);

    this.bwgList();
    this.designerList();
    this.factoryList();

    this.data.province_list.unshift(this.data.nro);
    this.data.city_list.unshift(this.data.nro);
    this.data.region_list.unshift(this.data.nro);

    this.getProvinceList();
  },
  // 切换tab
  tab_change(e) {
    this.setData({ type: e.currentTarget.dataset.tab }, () => {
      this.set_title(this.data.type);
    });
  },
  // 设置tabbar标题
  set_title(type) {
    switch (type) {
      case 1:
        wx.setNavigationBarTitle({ title: '博物馆列表' });
        break;
      case 2:
        wx.setNavigationBarTitle({ title: '设计师列表' });
        break;
      case 3:
        wx.setNavigationBarTitle({ title: '工厂列表' });
        break;
    }
  },
  // 博物馆列表
  bwgList(complete) {
    let post = {
      page: this.data.museum_page,
      perpage: 10
    };

    app.ajax('api/bwgList', post, res => {
      if (res.length === 0) {
        if (this.data.museum_page === 1) {
          this.setData({
            museum_list: [],
            museum_nodata: true,
            museum_nomore: false
          });
        } else {
          this.setData({
            museum_nomore: true,
            museum_nodata: false
          });
        }
      } else {
        app.format_img(res, 'cover');

        this.setData({ museum_list: this.data.museum_list.concat(res) });
      }
      this.data.museum_page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  },
  // 设计师列表
  designerList(complete) {
    let post = {
      page: this.data.designer_page,
      perpage: 20
    };

    app.ajax('api/designerList', post, res => {
      if (res.length === 0) {
        if (this.data.designer_page === 1) {
          this.setData({
            designer_list: [],
            designer_nodata: true,
            designer_nomore: false
          });
        } else {
          this.setData({
            designer_nomore: true,
            designer_nodata: false
          });
        }
      } else {
        app.avatar_format(res, 'avatar');

        this.setData({ designer_list: this.data.designer_list.concat(res) });
      }
      this.data.designer_page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  },
  // 工厂列表
  factoryList(complete) {
    let post = {
      page: this.data.factory_page,
      perpage: 10
    };

    let search = this.data.search.trim();
    if (search) {
      post.search = search;
    }

    if (this.data.region) {
      post.region_code = this.data.region_list[this.data.region].code;
    } else if (this.data.city) {
      post.city_code = this.data.city_list[this.data.city].code;
    } else if (this.data.province) {
      post.province_code = this.data.province_list[this.data.province].code;
    }

    app.ajax('api/factoryList', post, res => {
      if (res.length === 0) {
        if (this.data.factory_page === 1) {
          this.setData({
            factory_list: [],
            factory_nodata: true,
            factory_nomore: false
          });
        } else {
          this.setData({
            factory_nomore: true,
            factory_nodata: false
          });
        }
      } else {
        app.format_img(res, 'cover');

        this.setData({ factory_list: this.data.factory_list.concat(res) });
      }
      this.data.factory_page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;

      // 重置列表数据
      this.reset(this.data.type);

      wx.showNavigationBarLoading();
      switch (this.data.type) {
        case 1:
          this.bwgList(() => {
            this._refresh_after();
          });
          break;
        case 2:
          this.designerList(() => {
            this._refresh_after();
          });
          break;
        case 3:
          this.factoryList(() => {
            this._refresh_after();
          });
          break;
      }
    }
  },
  // 下拉刷新后
  _refresh_after() {
    this.data.loading = false;
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
  // 上拉加载
  onReachBottom() {
    if (!this.data.nomore && !this.data.nodata) {
      if (!this.data.loading) {
        this.data.loading = true;
        wx.showNavigationBarLoading();

        switch (this.data.type) {
          case 1:
            this.bwgList(() => {
              this._reach_after();
            });
            break;
          case 2:
            this.designerList(() => {
              this._reach_after();
            });
            break;
          case 3:
            this.factoryList(() => {
              this._reach_after();
            });
            break;
        }
      }
    }
  },
  // 上拉加载后
  _reach_after() {
    wx.hideNavigationBarLoading();
    this.data.loading = false;
  },
  // 重置（博物馆/设计师/工厂）
  reset(type) {
    switch (type) {
      // 博物馆
      case 1:
        this.data.museum_page = 1;
        this.data.museum_list = [];
        this.setData({
          museum_nomore: false,
          museum_nodata: false
        });
        break;
      // 设计师
      case 2:
        this.data.designer_page = 1;
        this.data.designer_list = [];
        this.setData({
          designer_nomore: false,
          designer_nodata: false
        });
        break;
      // 工厂
      case 3:
        this.data.factory_page = 1;
        this.data.factory_list = [];
        this.setData({
          factory_nomore: false,
          factory_nodata: false
        });
        break;
    }
  },
  // 关注/取消关注
  iFocus(e) {
    if (!this.data.loading) {
      this.data.loading = true;

      let index = e.currentTarget.dataset.index;
      let designer = this.data.designer_list[index];
      app.ajax('note/iFocus', { to_uid: designer.id }, res => {
        designer.if_focus = res;
        res ? designer.focus++ : designer.focus--;
        this.setData({ [`designer_list[${index}]`]: designer });
      }, null, () => {
        this.data.loading = false;
      });
    }
  },
  // 去他人主页
  to_person_page(e) {
    app.page_open(() => {
      wx.navigateTo({ url: '/pages/person-page/person-page?uid=' + e.currentTarget.dataset.id });
    });
  },

  bind_input(e) {
    app.bind_input(e, this);
  },
  search_factory() {
    this.reset(3);
    this.factoryList();
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
  // 选择 省/市/区 时
  area_change(e) {
    this.reset(3);

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

    this.factoryList();
  }
});