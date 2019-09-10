const app = getApp();

Page({
  data: {
    id: 0,
    req: {},
    active_tab: 1,

    loading: false,

    // 创意
    idea_list: [],
    chuang_page: 1,
    chuang_nomore: false,
    chuang_nodata: false,
    chuang_order: 1,  // 1.时间 2.热度

    // 作品
    work_list: [],
    work_page: 1,
    work_nomore: false,
    work_nodata: false,
    work_order: 1,  // 1.时间 2.热度

    // 众筹
    funding_list: [],
    funding_page: 1,
    chou_nomore: false,
    chou_nodata: true,
  },
  onLoad(options) {
    this.setData({ id: options.id });
    this.getReqDetail();
    this.ideaList();
    this.worksList();
    this.allFundingList();
  },
  // 获取活动详情
  getReqDetail(complete) {
    app.ajax('api/getReqDetail', { id: this.data.id }, (res) => {
      app.format_img(res, 'cover');
      app.avatar_format(res);
      app.time_format(res, 'start_time');
      app.time_format(res, 'deadline');
      app.time_format(res, 'vote_time');
      app.time_format(res, 'end_time');

      this.setData({ req: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 切换tab
  tab_change(e) {
    this.setData({ active_tab: e.currentTarget.dataset.tab });
  },
  // 排序点击
  order_tap(e) {
    let type = e.currentTarget.dataset.type;
    let order = e.currentTarget.dataset.order;

    switch (type) {
      // 创意
      case 1:
        this.reset(1);
        this.setData({ chuang_order: order });
        this.ideaList();
        break;
      // 作品
      case 2:
        this.reset(2);
        this.setData({ work_order: order });
        this.worksList();
        break;
    }
  },
  // 创意列表
  ideaList(complete) {
    let post = {
      req_id: this.data.id,
      order: this.data.chuang_order,
      page: this.data.chuang_page,
      perpage: 20
    };

    app.ajax('api/ideaList', post, res => {
      if (res.length === 0) {
        if (this.data.chuang_page === 1) {
          this.setData({
            idea_list: [],
            chuang_nodata: true,
            chuang_nomore: false
          })
        } else {
          this.setData({
            chuang_nomore: true,
            chuang_nodata: false
          })
        }
      } else {
        app.avatar_format(res);
        app.time_format(res, 'create_time', 'yyyy-MM-dd hh:mm');

        this.setData({ idea_list: this.data.idea_list.concat(res) });
      }
      this.data.chuang_page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  },
  // 作品列表
  worksList(complete) {
    let post = {
      req_id: this.data.id,
      order: this.data.work_order,
      page: this.data.work_page,
      perpage: 10
    };

    app.ajax('api/worksList', post, res => {
      if (res.length === 0) {
        if (this.data.work_page === 1) {
          this.setData({
            work_list: [],
            work_nodata: true,
            work_nomore: false
          })
        } else {
          this.setData({
            work_nomore: true,
            work_nodata: false
          })
        }
      } else {
        app.avatar_format(res);
        app.format_img(res, 'cover');
        app.time_format(res, 'create_time', 'yyyy-MM-dd hh:mm');

        this.setData({ work_list: this.data.work_list.concat(res) });
      }
      this.data.work_page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  },
  // 众筹列表
  allFundingList(complete) {
    let post = {
      req_id: this.data.id,
      page: this.data.funding_page,
      perpage: 10
    };

    app.ajax('api/allFundingList', post, res => {
      if (res.length === 0) {
        if (this.data.funding_page === 1) {
          this.setData({
            funding_list: [],
            chou_nodata: true,
            chou_nomore: false
          })
        } else {
          this.setData({
            chou_nomore: true,
            chou_nodata: false
          })
        }
      } else {
        app.avatar_format(res);
        app.format_img(res, 'cover');
        app.time_format(res, 'start_time');
        app.time_format(res, 'end_time');
        app.qian_format(res, 'curr_money');
        app.qian_format(res, 'need_money');
        
        console.log(res, 'chou');

        this.setData({ funding_list: this.data.funding_list.concat(res) });
      }
      this.data.funding_page++;
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

      wx.showNavigationBarLoading();
      this.getReqDetail(() => {
        this.data.loading = false;
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();

        this.ideaList();
        this.worksList();
        this.allFundingList();
      });
    }
  },
  // 上拉加载
  onReachBottom() {
    if (!this.data.nomore && !this.data.nodata) {
      if (!this.data.loading) {
        this.data.loading = true;
        wx.showNavigationBarLoading();

        switch (this.data.active_tab) {
          case 1:
            this.ideaList(() => {
              wx.hideNavigationBarLoading();
              this.data.loading = false;
            });
            break;
          case 2:
            this.worksList(() => {
              wx.hideNavigationBarLoading();
              this.data.loading = false;
            });
            break;
          case 3:
            this.allFundingList(() => {
              wx.hideNavigationBarLoading();
              this.data.loading = false;
            });
            break;
        }
      }
    }
  },
  // 重置（创意/作品/众筹）
  reset(type) {
    switch (type) {
      // 创意
      case 1:
        this.data.chuang_page = 1;
        this.data.idea_list = [];
        this.setData({
          chuang_nomore: false,
          chuang_nodata: false
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
      // 众筹
      case 3:
        this.data.funding_page = 1;
        this.data.funding_list = [];
        this.setData({
          chou_nomore: false,
          chou_nodata: false
        });
        break;
    }
  }
});