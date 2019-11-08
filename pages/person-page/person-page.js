const app = getApp();

Page({
  data: {
    full_loading: true,
    tel_show: false,
    uid: 0,
    role: 0,
    role_text: '',  // 博物馆/设计师/工厂/普通用户
    type: 0,
    person: {},
    loading: false,

    // 活动列表
    req_list: [],
    req_page: 1,
    req_nomore: false,
    req_nodata: false,

    // 作品列表
    work_list: [],
    work_page: 1,
    work_nomore: false,
    work_nodata: false,
    work_order: 1,  // 1.时间 2.热度

    // 展示作品列表
    show_list: [],
    show_page: 1,
    show_nomore: false,
    show_nodata: false,

    // 接单列表
    bid_list: [],
    bid_page: 1,
    bid_nomore: false,
    bid_nodata: false,

    // 创意列表
    idea_list: [],
    idea_page: 1,
    idea_nomore: false,
    idea_nodata: false,
    idea_order: 1,  // 1.时间 2.热度

    // 商品列表
    goods_list: [],
    goods_page: 1,
    goods_nomore: false,
    goods_nodata: false,

    video: {},
    my_uid: 0,  // 用户自己的uid
    my_role: 0  // 用户自己的role
  },
  onLoad(options) {
    this.data.uid = options.uid;
    this.setData({
      tel_show: !!options.tel,
      uid: options.uid,
      my_uid: app.user_data.uid,
      my_role: app.user_data.role
    });
    this.home(null, () => {
      if (this.data.role !== 0) {
        switch (this.data.role) {
          case 1:  // 博物馆
            this.reqList();
            break;
          case 2:  // 设计师
            this.homeVideo();
            this.worksList();
            this.showList();
            break;
          case 3:  // 工厂
            this.biddingList();
            break;
        }
        this.goodsList();
      }
      this.ideaList();
      this.setData({ full_loading: false });
    });
  },
  // 他人主页
  home(complete, after_succ) {
    app.ajax('Home/home', { uid: this.data.uid }, res => {
      app.avatar_format(res);
      app.format_img(res, 'cover');
      this.setData({
        person: res,
        role: res.role_check === 2 ? res.role : 0
      }, () => {
        // this.setData({ type: this.data.role });
        this.setData({ type: this.data.role === 0 ? 0 : 5 });
        switch (this.data.role) {
          case 0:
            this.setData({ role_text: '普通用户' });
            break;
          case 1:
            this.setData({ role_text: '博物馆' });
            break;
          case 2:
            this.setData({ role_text: '设计师' });
            break;
          case 3:
            this.setData({ role_text: '工厂' });
            break;
        }
        if (this.data.role === 0) {
          this.setData({
            type: 4,
            ['person.cover']: '/images/person-default-cover.png'
          })
        }
      });
      wx.setNavigationBarTitle({ title: this.data.role == 0 || this.data.role == 2 ? res.nickname : res.org });
      after_succ();
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 切换tab
  tab_change(e) {
    this.setData({ type: e.currentTarget.dataset.tab });
  },
  // 排序点击
  order_tap(e) {
    let type = e.currentTarget.dataset.type;
    let order = e.currentTarget.dataset.order;

    this.reset(type);
    switch (type) {
      // 作品
      case 2:
        this.setData({ work_order: order });
        this.worksList();
        break;
      // 创意
      case 4:
        this.setData({ idea_order: order });
        this.ideaList();
        break;
    }
  },
  // 活动列表
  reqList(complete) {
    let post = {
      uid: this.data.uid,
      page: this.data.req_page,
      perpage: 10
    };

    app.ajax('home/reqList', post, res => {
      if (res.length === 0) {
        if (this.data.req_page === 1) {
          this.setData({
            req_list: [],
            req_nomore: false,
            req_nodata: true
          });
        } else {
          this.setData({
            req_nomore: true,
            req_nodata: false
          });
        }
      } else {
        app.format_img(res, 'cover');
        app.time_format(res, 'start_time');
        app.time_format(res, 'end_time');
        this.setData({ req_list: this.data.req_list.concat(res) });
      }
      this.data.req_page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  },
  // 作品列表
  worksList(complete) {
    let post = {
      uid: this.data.uid,
      order: this.data.work_order,
      page: this.data.work_page,
      perpage: 10
    };

    app.ajax('home/worksList', post, res => {
      if (res.length === 0) {
        if (this.data.work_page === 1) {
          this.setData({
            work_list: [],
            work_nomore: false,
            work_nodata: true
          });
        } else {
          this.setData({
            work_nomore: true,
            work_nodata: false
          });
        }
      } else {
        for (let i = 0; i < res.length; i++) {
          res[i].out3 = res[i].pics.length - 3;
          res[i].pics = res[i].pics.slice(0, 3);

          app.format_img(res[i].pics);
          res[i].flex_pad = app.null_arr(res[i].pics.length, 3);
        }
        app.time_format(res, 'create_time', 'yyyy-MM-dd');
        this.setData({ work_list: this.data.work_list.concat(res) });
      }
      this.data.work_page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  },
  // 展示作品列表
  showList(complete) {
    let post = {
      uid: this.data.uid,
      page: this.data.show_page,
      perpage: 10
    };

    app.ajax('home/showWorksList', post, res => {
      if (res.length === 0) {
        if (this.data.show_page === 1) {
          this.setData({
            show_list: [],
            show_nomore: false,
            show_nodata: true
          });
        } else {
          this.setData({
            show_nomore: true,
            show_nodata: false
          });
        }
      } else {
        for (let i = 0; i < res.length; i++) {
          res[i].out3 = res[i].pics.length - 3;
          res[i].pics = res[i].pics.slice(0, 3);

          app.format_img(res[i].pics);
          res[i].flex_pad = app.null_arr(res[i].pics.length, 3);
        }
        app.time_format(res, 'create_time', 'yyyy-MM-dd');
        this.setData({ show_list: this.data.show_list.concat(res) });
      }
      this.data.show_page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  },
  // 接单列表
  biddingList(complete) {
    let post = {
      uid: this.data.uid,
      page: this.data.bid_page,
      perpage: 10
    };

    app.ajax('home/biddingList', post, res => {
      if (res.length === 0) {
        if (this.data.bid_page === 1) {
          this.setData({
            bid_list: [],
            bid_nomore: false,
            bid_nodata: true
          });
        } else {
          this.setData({
            bid_nomore: true,
            bid_nodata: false
          });
        }
      } else {
        for (let i = 0; i < res.length; i++) {
          res[i].out3 = res[i].pics.length - 3;
          res[i].pics = res[i].pics.slice(0, 3);

          app.format_img(res[i].pics);
          res[i].flex_pad = app.null_arr(res[i].pics.length, 3);
        }
        app.time_format(res, 'create_time', 'yyyy-MM-dd');
        this.setData({ bid_list: this.data.bid_list.concat(res) });
      }
      this.data.bid_page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  },
  // 创意列表
  ideaList(complete) {
    let post = {
      uid: this.data.uid,
      order: this.data.idea_order,
      page: this.data.idea_page,
      perpage: 20
    };

    app.ajax('home/ideaList', post, res => {
      if (res.length === 0) {
        if (this.data.idea_page === 1) {
          this.setData({
            idea_list: [],
            idea_nomore: false,
            idea_nodata: true
          });
        } else {
          this.setData({
            idea_nomore: true,
            idea_nodata: false
          });
        }
      } else {
        app.time_format(res, 'create_time', 'yyyy-MM-dd');
        for (let i = 0; i < res.length; i++) {
          res[i].flex_pad = app.null_arr(res[i].tags_name.length, 5);
        }

        this.setData({ idea_list: this.data.idea_list.concat(res) });
      }
      this.data.idea_page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  },
  // 商品列表
  goodsList(complete) {
    let post = {
      shop_id: this.data.uid,
      page: this.data.goods_page,
      perpage: 10
    };

    app.ajax('home/goodsList', post, res => {
      if (res.length === 0) {
        if (this.data.goods_page === 1) {
          this.setData({
            goods_list: [],
            goods_nomore: false,
            goods_nodata: true
          });
        } else {
          this.setData({
            goods_nomore: true,
            goods_nodata: false
          });
        }
      } else {
        app.format_img(res);
        this.setData({ goods_list: this.data.goods_list.concat(res) });
      }
      this.data.goods_page++;
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
      this.reset(1);
      this.reset(2);
      this.reset(3);
      this.reset(4);
      this.reset(5);
      this.reset(6);

      wx.showNavigationBarLoading();
      this.home(() => {
        this._refresh_after();
      });
    }
  },
  // 下拉刷新后
  _refresh_after() {
    this.data.loading = false;
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();

    this.ideaList();
    if (this.data.role !== 0) {
      switch (this.data.role) {
        case 1:
          this.reqList();
          break;
        case 2:
          this.worksList();
          break;
        case 3:
          this.biddingList();
          break;
        case 6:
          this.showList();
          break;
      }
      this.goodsList();
    }
  },
  // 上拉加载
  onReachBottom() {
    if (!this.data.nomore && !this.data.nodata) {
      if (!this.data.loading) {
        this.data.loading = true;
        wx.showNavigationBarLoading();

        switch (this.data.type) {
          case 1:
            this.reqList(() => {
              this._reach_after();
            });
            break;
          case 2:
            this.worksList(() => {
              this._reach_after();
            });
            break;
          case 3:
            this.biddingList(() => {
              this._reach_after();
            });
            break;
          case 4:
            this.ideaList(() => {
              this._reach_after();
            });
            break;
          case 5:
            this.goodsList(() => {
              this._reach_after();
            });
            break;
          case 6:
            this.showList(() => {
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
  // 重置 1.活动 2.作品 3.接单 4.创意 5.商品
  reset(type) {
    switch (type) {
      // 活动
      case 1:
        this.data.req_page = 1;
        this.data.req_list = [];
        this.setData({
          req_nomore: false,
          req_nodata: false
        });
        break;
      // 作品
      case 2:
        this.data.work_page = 1;
        this.data.work_list = [];
        this.setData({
          work_nomore: false,
          work_nodata: false
        });
        break;
      // 接单
      case 3:
        this.data.bid_page = 1;
        this.data.bid_list = [];
        this.setData({
          bid_nomore: false,
          bid_nodata: false
        });
        break;
      // 创意
      case 4:
        this.data.idea_page = 1;
        this.data.idea_list = [];
        this.setData({
          idea_nomore: false,
          idea_nodata: false
        });
        break;
      // 商品
      case 5:
        this.data.goods_page = 1;
        this.data.goods_list = [];
        this.setData({
          goods_nomore: false,
          goods_nodata: false
        });
        break;
      // 展示作品
      case 6:
        this.data.show_page = 1;
        this.data.show_list = [];
        this.setData({
          show_nomore: false,
          show_nodata: false
        });
        break;
    }
  },
  // 跳转详情页
  jump(e) {
    app.page_open(() => {
      let id = e.currentTarget.dataset.id;

      switch (this.data.type) {
        case 1:  // 活动
          wx.navigateTo({ url: '/pages/activity-detail/activity-detail?id=' + id });
          break;
        case 2:  // 作品
          wx.navigateTo({ url: '/pages/work-detail/work-detail?id=' + id });
          break;
        case 3:  // 接单（作品）
          wx.navigateTo({ url: '/pages/work-detail/work-detail?id=' + id });
          break;
        case 4:  // 创意
          wx.navigateTo({ url: '/pages/chuang-detail/chuang-detail?idea_id=' + id });
          break;
        case 5:  // 商品
          wx.navigateTo({ url: '/pages/shop-detail/shop-detail?id=' + id });
          break;
        case 6:  // 展示作品 TODO 要改
          wx.navigateTo({ url: '/pages/show-detail/show-detail?id=' + id });
          break;
      }
    });
  },
  // 他人主页视频
  homeVideo() {
    app.ajax('home/homeVideo', { uid: this.data.uid }, res => {
      app.format_img(res, 'poster');
      app.format_img(res, 'video_url');
      this.setData({ video: res });
    });
  },
  // 关注/取消关注
  iFocus() {
    if (!this.data.loading) {
      this.data.loading = true;

      let person = this.data.person;
      app.ajax('note/iFocus', { to_uid: person.id }, res => {
        person.if_focus = res;
        res ? person.focus++ : person.focus--;
        this.setData({ person });
      }, null, () => {
        this.data.loading = false;
      });
    }
  },
  // 打电话
  phone_call() {
    wx.makePhoneCall({
      phoneNumber: this.data.person.role_tel
    })
  },
  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  }
});