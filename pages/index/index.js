const app = getApp();

Page({
  data: {
    slide_list: [],  // 轮播图
    req_list: [],  // 需求列表（投石）
    work_list: [], // 作品排行
    idea_list: [],  // 创意排行
    first_funding: {},  // 第一个众筹
    funding_list: [],  // 众筹列表
    active_rank: 1
  },
  onLoad() {
    this.slideList();
    this.getReqList();
    this.worksList();
    this.ideaList();
    this.fundingList();
  },
  // 获取首页轮播图
  slideList() {
    app.ajax('api/slideList', null, (res) => {
      app.format_img(res);
      this.setData({slide_list: res});
    });
  },
  // 点击排行
  rank_tap(e) {
    this.setData({ active_rank: e.currentTarget.dataset.rank });
  },
  // 获取需求列表（投石）
  getReqList() {
    app.ajax('api/getReqList', null, res => {
      app.format_img(res, 'cover');
      app.time_format(res, 'start_time');
      app.time_format(res, 'end_time');
      this.setData({req_list: res});
    });
  },
  // 获取参赛作品列表（作品排行）
  worksList() {
    let post = {
      page: 1,
      perpage: 4,
      order: 2
    };

    app.ajax('api/worksList', post, res => {
      for (let i = 0; i < res.length; i++) {
        app.format_img(res[i].pics);
      }

      app.avatar_format(res, 'avatar');

      this.setData({work_list: res});
    });
  },
  // 创意列表（创意排行）
  ideaList() {
    let post = {
      page: 1,
      perpage: 7,
      order: 2
    };

    app.ajax('api/ideaList', post, res => {
      app.avatar_format(res, 'avatar');

      this.setData({idea_list: res});
    });
  },
  // 众筹列表
  fundingList() {
    let post = {
      page: 1,
      perpage: 5
    };

    app.ajax('api/fundingList', post, res => {
      app.format_img(res, 'cover');
      app.qian_format(res, 'curr_money');
      app.qian_format(res, 'need_money');

      this.setData({first_funding: res.shift()});
      this.setData({funding_list: res});
    });
  },
  // 跳页
  jump(e) {
    app.jump(e);
  }
});