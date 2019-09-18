const app = getApp();

Page({
  data: {
    is_ios: false,
    nickname: '',
    realname: '',
    sign: '',

    field_name: ''
  },
  onLoad(options) {
    this.setData({
      field_name: options.field_name,
      [options.field_name]: decodeURIComponent(options.value)
    });

    switch (options.field_name) {
      case 'nickname':
        wx.setNavigationBarTitle({ title: '编辑昵称' });
        break;
      case 'realname':
        wx.setNavigationBarTitle({ title: '编辑姓名' });
        break;
      case 'sign':
        wx.setNavigationBarTitle({ title: '编辑个人备注' });
        break;
    }
  },
  // 保存
  save() {
    let cmd;
    let post = {};
    let valid = false;

    switch (this.data.field_name) {
      case 'nickname':
        if (!this.data.nickname.trim()) {
          app.toast('请输入昵称');
        } else {
          cmd = 'my/modNickname';
          post.nickname = this.data.nickname;
          valid = true;
        }
        break;
      case 'realname':
        if (!this.data.realname.trim()) {
          app.toast('请输入真实姓名');
        } else {
          cmd = 'my/modRealname';
          post.realname = this.data.realname;
          valid = true;
        }
        break;
      case 'sign':
        cmd = 'my/modDesc';
        post.sign = this.data.sign;
        valid = true;
        break;
    }

    if (valid) {
      app.ajax(cmd, post, () => {
        app.modal('修改成功', () => {
          let page = app.get_page('pages/my-edit/my-edit');
          if (page) {
            page.mydetail(() => {
              wx.navigateBack({ delta: 1 });
            });
          }
        });
      });
    }
  },
  bind_input(e) {
    app.bind_input(e, this);
  }
});