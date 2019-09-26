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

    uid: 0
  },
  onLoad() {
    this.setData({ uid: app.user_data.uid });

    this.bwgList();
    this.designerList();
    this.factoryList();
  },
  // 切换tab
  tab_change(e) {
    this.setData({ type: e.currentTarget.dataset.tab }, () => {
      this.set_title(this.data.type);
    });
  },
  // 博物馆列表
  bwgList(complete) {
    let post = {
      page: this.data.museum_page,
      perpage: 10,
      type: 1
    };

    app.ajax('my/myFocusList', post, res => {
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
      perpage: 20,
      type: 2
    };

    app.ajax('my/myFocusList', post, res => {
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
        for (let i = 0; i < res.length; i++) {
          res[i].if_focus = true;
        }

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
      perpage: 10,
      type: 3
    };

    app.ajax('my/myFocusList', post, res => {
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
  }
});