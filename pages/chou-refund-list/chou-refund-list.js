const app = getApp();

Page({
  data: {
    full_loading: true,
    order_list: [],
    type: '',
    page: 1,
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad(options) {
    if (options.type) {
      this.setData({ type: options.type });
    }
    this.fundingRefundList(() => {
      this.setData({ full_loading: false });
    });
  },
  tab_change(e) {
    if (!this.data.loading) {
      this.data.loading = true;

      this.data.page = 1;
      this.data.order_list = [];
      this.setData({
        nomore: false,
        nodata: false
      });

      wx.showLoading({
        title: '加载中',
        mask: true
      });
      this.setData({ type: e.currentTarget.dataset.type });
      this.fundingRefundList(() => {
        this.data.loading = false;
        wx.hideLoading();
      });
    }
  },
  // 订单列表
  fundingRefundList(complete) {
    let post = {
      token: app.user_data.token,
      type: this.data.type,
      page: this.data.page
    };

    app.ajax('my/fundingRefundList', post, (res) => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            order_list: [],
            nomore: false,
            nodata: true
          });
        } else {
          this.setData({
            nomore: true,
            nodata: false
          });
        }
      } else {
        for (let i = 0; i < res.length; i++) {
          app.format_img(res[i].pics);
          app.format_img(res[i], 'cover');
          switch (res[i].refund_apply) {
            case 1:
              res[i].type_text = '退款中';
              break;
            case 2:
              res[i].type_text = '已退款';
              break;
          }
        }
        this.setData({ order_list: this.data.order_list.concat(res) });
      }

      this.data.page++;
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;

      this.data.page = 1;
      this.data.order_list = [];
      this.setData({
        nomore: false,
        nodata: false
      });

      wx.showNavigationBarLoading();
      this.fundingRefundList(() => {
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
        this.fundingRefundList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  }
});