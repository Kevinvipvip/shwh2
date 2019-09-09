const app = getApp();

Page({
  data: {
    full_loading: true,
    designerList: [],
    page: 1,
    nomore: false,
    nodata: false,
    loading: false,
    focus_loading: false
  },
  onLoad: function () {
    this.setData({my_uid: app.user_data.uid});
    this.designerList(() => {
      this.setData({full_loading: false});
    });
  },
  // 获取设计师列表
  designerList(complete) {
    let post = {
      token: app.user_data.token,
      page: this.data.page
    };

    app.ajax('api/designerList', post, (res) => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            designerList: [],
            nodata: true
          });
        } else {
          this.setData({ nomore: true });
        }
      } else {
        for (let i = 0; i < res.length; i++) {
          res[i].sex_text = res[i].sex === 1 ? '男' : '女';
          app.avatar_format(res[i]);
        }
        
        this.setData({ designerList: this.data.designerList.concat(res) });
      }
      this.data.page++;
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  onReachBottom: function () {
    if (!this.data.nomore && !this.data.nodata) {
      if (!this.data.loading) {
        this.data.loading = true;
        wx.showNavigationBarLoading();
        this.designerList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  onPullDownRefresh() {
    this.data.nomore = false;
    this.data.nodata = false;
    this.data.page = 1;
    this.data.designerList = [];

    wx.showNavigationBarLoading();
    this.designerList(() => {
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    });
  },
  // 关注/取消关注
  iFocus(e) {
    if (!this.data.focus_loading) {
      this.data.focus_loading = true;
      let index = e.currentTarget.dataset.index;
      let designer = this.data.designerList[index];

      let post = {
        token: app.user_data.token,
        to_uid: designer.id
      };

      app.ajax('note/iFocus', post, (res) => {
        this.setData({
          ['designerList[' + index + '].if_focus']: res,
          ['designerList[' + index + '].focus']: res ? designer['focus'] + 1 : designer['focus'] - 1
        });
      }, null, () => {
        this.data.focus_loading = false;
      });
    }
  }
})