const app = getApp();

Page({
  data: {
    active_tab: 1,
    id: 0,
    req: {}
  },
  onLoad: function (options) {
    this.data.id = options.id;
    this.getReqDetail();
  },
  tab_change(e) {
    this.setData({active_tab: e.currentTarget.dataset.tab});
  },
  getReqDetail() {
    let post = {
      token: app.user_data.token,
      id: this.data.id
    };

    app.ajax(app.my_config.api + 'api/getReqDetail', post, (res) => {
      if (res.cover) {
        res.cover = app.my_config.base_url + '/' + res.cover;
      } else {
        res.cover = app.my_config.default_img;
      }
      res.start_time = res.start_time.substr(0, 10);
      res.deadline = res.deadline.substr(0, 10);
      res.vote_time = res.vote_time.substr(0, 10);
      res.end_time = res.end_time.substr(0, 10);

      wx.setNavigationBarTitle({ title: res.title });
      this.setData({req: res});
    });
  },
  // 我要参赛（判断是否能参加比赛）
  takePartIn(callback) {
    let post = {
      token: app.user_data.token,
      req_id: this.data.id
    };

    app.ajax(app.my_config.api + 'api/takePartIn', post, (res) => {
      callback();
    });
  },
  // 参赛
  in_match() {
    this.takePartIn(() => {
      wx.navigateTo({ url: '/pages/take-part-in/take-part-in?req_id=' + this.data.req.id + '&req_title=' + encodeURI(this.data.req.title)});
    });
  },
  // 投票
  vote() {
    wx.navigateTo({ url: '/pages/vote-list/vote-list?req_id=' + this.data.id + '&origin=1'});
  },
  // 竞标
  bidding() {
    wx.navigateTo({ url: '/pages/vote-list/vote-list?req_id=' + this.data.id + '&origin=2'});
  }
})