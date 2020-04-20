const app = getApp();

Page({
  data: {
    full_loading: true,

    slide_list: [],  // 轮播图

    factory_list: [],  // 推荐工厂
    factory_flex: [],

    page: 1,
    xuqiu_list: [],  // 需求列表
    nomore: false,
    nodata: false,
    loading: false,

    role: 0,  // 用户角色

    bind_tel_show: false
  },
  onLoad() {
    // 页面初始化
    this.init(() => {
      this.setData({ full_loading: false });
    });
  },
  init(complete) {
    this.setData({role: app.user_data.role});

    // 轮播
    let promise1 = new Promise(resolve => {
      this.slideList(() => {
        resolve();
      });
    });

    // 推荐工厂
    let promise2 = new Promise(resolve => {
      this.factoryList(() => {
        resolve();
      });
    });

    // 需求列表
    let promise3 = new Promise(resolve => {
      this.xuqiuList(() => {
        resolve();
      });
    });

    Promise.all([
      promise1, promise2, promise3
    ]).then(() => {
      if (complete) {
        complete();
      }
    });
  },
  // 轮播图
  slideList(complete) {
    app.ajax('xuqiu/slideList', null, res => {
      app.format_img(res);
      this.setData({ slide_list: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 轮播跳页
  jump(e) {
    if (e.currentTarget.dataset.url) {
      app.jump(e);
    }
  },
  // 推荐工厂
  factoryList(complete) {
    app.ajax('xuqiu/factoryList', { recommend: 1 }, res => {
      app.format_img(res, 'logo');
      this.setData({
        factory_list: res,
        factory_flex: app.null_arr(res.length, 3)
      });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 需求列表
  xuqiuList(complete) {
    let post = {
      page: this.data.page
    };

    app.ajax('xuqiu/xuqiuList', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            xuqiu_list: [],
            nodata: true,
            nomore: false
          });
        } else {
          this.setData({
            nodata: false,
            nomore: true
          });
        }
      } else {
        this.setData({ xuqiu_list: this.data.xuqiu_list.concat(res) });
      }
      this.data.page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  },
  reset() {
    this.data.page = 1;
    this.data.xuqiu_list = [];
    this.setData({
      nomore: false,
      nodata: false
    });
  },
  // 打电话
  phone_call(e) {
    let tel = e.currentTarget.dataset.tel;
    wx.makePhoneCall({ phoneNumber: tel })
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;

      wx.showNavigationBarLoading();

      this.reset();
      this.init(() => {
        this.data.loading = false;
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      });
    }
  },
  // 上拉加载
  onReachBottom() {
    if (!this.data.nomore && !this.data.nodata) {
      if (!this.data.loading) {
        this.data.loading = true;
        wx.showNavigationBarLoading();
        this.xuqiuList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 去采购页
  to_caigou() {
    if (!app.user_data.uid) {
      this.setData({ bind_tel_show: true });
    } else {
      wx.navigateTo({ url: '../purchase-publish/purchase-publish' });
    }
  }
});