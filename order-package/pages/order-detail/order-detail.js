const app = getApp()

Page({
  data: {
    full_loading: true,
    id: 0,
    order: {},

    active_odi: 0,  // 当前评论商品的 order_detail_id，用于商品评价
    show_comment_box: false,
    comment: ''
  },
  onLoad(options) {
    this.data.id = options.id;
    this.orderDetail(() => {
      this.setData({ full_loading: false });
    });
  },
  orderDetail(complete) {
    app.ajax('my/orderDetail', { order_id: this.data.id }, (res) => {
      app.format_img_arr(res.child, 'cover');
      let amount = 0;
      for (let i = 0; i < res.child.length; i++) {
        amount += res.child[i].num;
      }
      res.amount = amount;
      switch (res.status) {
        case 0:
          res.status_text = '待付款';
          break;
        case 1:
          res.status_text = '待发货';
          break;
        case 2:
          res.status_text = '待收货';
          break;
        case 3:
          res.status_text = '已完成';
          break;
      }
      this.setData({ order: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  copy() {
    let that = this;
    wx.setClipboardData({
      data: that.data.order.pay_order_sn,
      success() {
        app.toast('已复制到剪贴板');
      }
    })
  },
  bind_input(e) {
    app.bind_input(e, this);
  },
  // 显示评论框
  show_comment(e) {
    this.data.active_odi = e.currentTarget.dataset.active_odi;
    this.setData({
      show_comment_box: true,
      comment: ''
    });
  },
  // 隐藏评论框
  hide_comment() {
    this.setData({ show_comment_box: false });
  },  // 订单评价
  orderEvaluate() {
    if (!this.data.comment.trim()) {
      app.toast('评论不能为空');
    } else {
      wx.showLoading({
        title: '评论提交中...',
        mask: true
      });

      let post = {
        order_detail_id: this.data.active_odi,
        comment: this.data.comment
      };

      app.ajax('my/orderEvaluate', post, () => {
        this.setData({
          comment: '',
          show_comment_box: false
        }, () => {
          this.orderDetail();
        });
      }, null, () => {
        wx.hideLoading();
      });
    }
  }
});