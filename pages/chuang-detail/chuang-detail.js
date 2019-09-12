const app = getApp();

Page({
  data: {
    idea_id: 0,
    idea: {},

    // 作品列表
    page: 1,
    work_list: [],
    nomore: false,
    nodata: false,
    loading: false,

    uid: 0  // 用户自己的id
  },
  onLoad(options) {
    this.data.idea_id = options.idea_id;
    this.ideaDetail();
    this.worksList();

    this.setData({uid: app.user_data.uid});
  },
  // 创意详情
  ideaDetail() {
    app.ajax('api/ideaDetail', { idea_id: this.data.idea_id }, res => {
      app.avatar_format(res);
      app.format_img(res, 'cover');
      app.time_format(res, 'create_time', 'yyyy-MM-dd');

      this.setData({ idea: res });
    });
  },
  // 作品列表
  worksList(complete) {
    let post = {
      idea_id: this.data.idea_id,
      page: this.data.page,
      perpage: 10
    };

    app.ajax('api/worksList', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            work_list: [],
            nodata: true,
            nomore: false
          })
        } else {
          this.setData({
            nomore: true,
            nodata: false
          })
        }
      } else {
        for (let i = 0; i < res.length; i++) {
          app.format_img(res[i].pics);
        }
        app.avatar_format(res);
        
        this.setData({ work_list: this.data.work_list.concat(res) });
      }
      this.data.page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    })
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;

      this.data.page = 1;
      this.data.work_list = [];
      this.setData({
        nomore: false,
        nodata: false
      });

      wx.showNavigationBarLoading();
      this.worksList(() => {
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
        this.worksList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  },
  // 创意投票
  ideaVote() {
    let idea = this.data.idea;
    if (!idea.if_vote) {
      if (!this.data.loading) {
        this.data.loading = true;
        app.ajax('api/ideaVote', { idea_id: idea.id }, res => {
          if (res) {
            idea.if_vote = true;
            idea.vote++;
            this.setData({ idea });
          }
        }, null, () => {
          this.data.loading = false;
        });
      }
    } else {
      app.toast('您已为该创意点赞');
    }
  },
  // 关注/取关
  iFocus() {
    let idea = this.data.idea;
    if (!this.data.loading) {
      this.data.loading = true;

      let post = {

      };
      app.ajax('note/iFocus', {to_uid: idea.uid}, res => {
        this.setData({ ['idea.ifocus']: res});
      }, null, () => {
        this.data.loading = false;
      });
    }
  }
});