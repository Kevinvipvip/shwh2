const app = getApp();

Page({
  data: {
    id: 0,
    req: {},
    active_tab: 1,
    user_auth: 0,

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
    chou_nodata: false,
  },
  onLoad(options) {
    this.setData({
      id: options.id,
      user_auth: app.user_data.user_auth
    });

    this.getReqDetail();
    this.ideaList();
    this.worksList();
    this.allFundingList();
  },
  // 获取活动详情
  getReqDetail(complete) {
    app.ajax('api/getReqDetail', { req_id: this.data.id }, (res) => {
      app.format_img(res, 'cover');
      app.format_img(res, 'video_url');
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
        for (let i = 0; i < res.length; i++) {
          res[i].flex_pad = app.null_arr(res[i].tags_name.length, 5);
        }

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
        for (let i = 0; i < res.length; i++) {
          app.format_img(res[i].pics);
          if (res[i].pics) {
            res[i].pics = res[i].pics.slice(0, 3);
          }

          res[i].flex_pad = app.null_arr(res[i].pics.length, 3);
        }
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
  },
  // 授权
  auth(e) {
    if (e.detail.userInfo) {
      wx.showLoading({
        title: '授权中',
        mask: true
      });

      let inviter_id = wx.getStorageSync('inviter_id');

      app.userAuth(inviter_id, res => {
        wx.hideLoading();
        if (res) {
          let type = e.currentTarget.dataset.type;
          if (type === 1) {
            // 点击投稿
            let idea_id = e.currentTarget.dataset.idea_id;
            if (app.user_data.role === 2) {
              if (idea_id) {
                wx.navigateTo({ url: '/pages/work-release/work-release?req_id=' + this.data.id + '&idea_id=' + idea_id });
              } else {
                wx.navigateTo({ url: '/pages/work-release/work-release?req_id=' + this.data.id });
              }
            } else {
              app.modal('只有认证设计师可以投稿');
            }
          } else {
            // 点击创意
            wx.navigateTo({ url: '/pages/chuang-publish/chuang-publish?req_id=' + this.data.id });
          }
        }
      });
    }
  },
  // 去投稿
  to_work_release(e) {
    let idea_id = e.currentTarget.dataset.idea_id;

    if (app.user_data.role === 2) {
      if (idea_id) {
        wx.navigateTo({ url: '/pages/work-release/work-release?req_id=' + this.data.id + '&idea_id=' + idea_id });
      } else {
        wx.navigateTo({ url: '/pages/work-release/work-release?req_id=' + this.data.id });
      }
    } else {
      app.modal('只有认证设计师可以投稿');
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
  },
  // 去他人主页
  to_person() {
    app.page_open(() => {
      wx.navigateTo({ url: '/pages/person-page/person-page?uid=' + this.data.req.uid });
    });
  }
});