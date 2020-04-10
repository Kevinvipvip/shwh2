Component({
  properties: {
    show: Boolean
  },
  data: {},
  methods: {
    // 隐藏绑定手机号modal
    hide_modal() {
      this.setData({show: false});
    },
    // 去绑定手机号页面
    to_bind() {
      wx.navigateTo({url: '/pages/bind-tel/bind-tel'});
      setTimeout(() => {
        this.hide_modal();
      }, 1000)
    }
  }
});