const app = getApp();

Page({
  data: {
    full_loading: true,

    slide_list: [],  // 轮播图
    req_list: [],  // 需求列表（投石）
    work_list: [], // 作品排行
    idea_list: [],  // 创意排行
    first_funding: {},  // 第一个众筹
    funding_list: [],  // 众筹列表
    active_rank: 1,

    xuqiu_list: [],  // 需求列表

    loading: false
  },
  onLoad() {
    this.slideList(() => {
      this.getReqList(() => {
        this.homeXuqiuList(() => {
          this.setData({ full_loading: false });
        });
      });
    });
    this.worksList();
    this.ideaList();
    this.fundingList();
  },
  // 获取首页轮播图
  slideList(complete) {
    app.ajax('api/slideList', null, (res) => {
      app.format_img(res);
      this.setData({ slide_list: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 首页需求列表
  homeXuqiuList(complete) {
    app.ajax('xuqiu/homeXuqiuList', null, res => {
      app.avatar_format(res);
      this.setData({ xuqiu_list: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 点击排行
  rank_tap(e) {
    this.setData({ active_rank: e.currentTarget.dataset.rank });
  },
  // 获取需求列表（投石）
  getReqList(complete) {
    app.ajax('api/getReqList', null, res => {
      app.format_img(res, 'cover');
      app.time_format(res, 'start_time');
      app.time_format(res, 'end_time');
      this.setData({ req_list: res });
    }, null, () => {
      complete();
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

      this.setData({ work_list: res });
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
      for (let i = 0; i < res.length; i++) {
        res[i].flex_pad = app.null_arr(res[i].tags_name.length, 5);
      }

      this.setData({ idea_list: res });
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

      this.setData({ first_funding: res.shift() });
      this.setData({ funding_list: res });
    });
  },
  // 跳页
  jump(e) {
    app.jump(e);
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;

      wx.showNavigationBarLoading();
      this.slideList(() => {
        this.data.loading = false;
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();

        this.getReqList();
        this.worksList();
        this.ideaList();
        this.fundingList();
        this.homeXuqiuList();
      });
    }
  },
  // 作品投票
  worksVote(e) {
    let index = e.currentTarget.dataset.index;
    let work = this.data.work_list[index];
    if (!work.if_vote) {
      if (!this.data.loading) {
        wx.showModal({
          title: '提示',
          content: '确定投票？',
          success: res => {
            if (res.confirm) {
              this.data.loading = true;
              app.ajax('api/worksVote', { work_id: work.id }, res => {
                if (res) {
                  work.if_vote = true;
                  work.vote++;
                  this.setData({ [`work_list[${index}]`]: work });
                }
              }, null, () => {
                this.data.loading = false;
              });
            }
          }
        });
      }
    } else {
      app.toast('您已投票给该作品');
    }
  },
  // 创意投票
  ideaVote(e) {
    let index = e.currentTarget.dataset.index;
    let idea = this.data.idea_list[index];
    if (!idea.if_vote) {
      if (!this.data.loading) {
        this.data.loading = true;
        app.ajax('api/ideaVote', { idea_id: idea.id }, res => {
          if (res) {
            idea.if_vote = true;
            idea.vote++;
            this.setData({ [`idea_list[${index}]`]: idea });
          }
        }, null, () => {
          this.data.loading = false;
        });
      }
    } else {
      app.toast('您已为该创意点赞');
    }
  }
});