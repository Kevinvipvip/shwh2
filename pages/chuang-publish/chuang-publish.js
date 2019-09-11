const app = getApp();

Page({
  data: {
    textarea_padding: '15rpx',
    req_id: 0,
    title: '',  // 创意标题
    content: '',  // 创意内容
    content_count: 0
  },
  onLoad(options) {
    let phone = wx.getSystemInfoSync();
    if (phone.platform === 'ios') {
      this.setData({ textarea_padding: '0rpx 5rpx' })
    }

    this.data.req_id = options.req_id;
  },
  bind_input(e) {
    app.bind_input(e, this);
    if (e.currentTarget.dataset.name === 'content') {
      this.setData({content_count: this.data.content.length});
    }
  },
  // 提出创意
  createIdea() {
    let data = this.data;
    if (!data.title.trim()) {
      app.toast('清输入标题');
    } else if (!data.content.trim()) {
      app.toast('清输入创意内容');
    } else {
      let post = {
        req_id: data.req_id,
        title: data.title,
        content: data.content
      };

      wx.showLoading({ mask: true });
      app.ajax('api/createIdea', post, () => {
        app.modal('创意发布成功', () => {
          wx.redirectTo({ url: '/pages/my-chuang/my-chuang' });
        });
      }, null, () => {
        wx.hideLoading();
      });
    }
  }
});