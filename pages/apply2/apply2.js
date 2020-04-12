const app = getApp();

Page({
  data: {
    role: '1',  // 1.文旅机构 2.工厂
    org: '',  // 组织结构
    name: '',  // 法人代表
    identity: '',  // 身份证号
    id_front: '',  // 身份证正面照片
    id_back: '',  // 身份证反面照片
    license: '',  // 资质证书
    busine: '',  // 经营范围

    role_check: 0,  // 0.未认证 1.审核中 2.已认证 3.审核拒绝
    reason: '',
    loading: true,
    apply_loading: false,

    is_ios: ''
  },
  onLoad(options) {
    this.setData({ is_ios: app.is_ios });

    if (options.role) {
      // 从选择申请角色进来
      let role_text = '';
      switch (options.role) {
        case '1':
          role_text = '文旅机构';
          break;
        case '2':
          role_text = '工厂';
          break;
      }
      this.setData({
        role: options.role,
        loading: false
      });
      wx.setNavigationBarTitle({ title: '申请成为' + role_text });
    } else {
      // 从我的页面进来（申请中）
      this.applyInfo(() => {
        this.setData({ loading: false });
      });
    }

    // this.applyStatus(() => {
    //   if (this.data.role_check === 3) {
    //     this.applyInfo(() => {
    //       this.setData({ loading: false });
    //     });
    //   } else {
    //     this.setData({ loading: false });
    //   }
    // });

    app.qiniu_init();
  },
  apply(e) {
    if (!this.data.apply_loading) {
      let data = this.data, post = {};

      if (!data.org.trim()) {
        app.toast('请填写机构名称');
      } else if (!data.name.trim()) {
        app.toast('请填写法人代表');
      } else if (!data.identity.trim()) {
        app.toast('请填写身份证号');
      } else if (!data.id_front) {
        app.toast('请上传身份证正面');
      } else if (!data.id_back) {
        app.toast('请上传身份证反面');
      } else if (!this.data.license) {
        app.toast('请上传资质证书');
      } else if (!data.busine.trim()) {
        app.toast('请填写经营范围');
      } else {
        app.collectFormid(e.detail.formId);

        this.setData({ apply_loading: true });

        post.role = data.role;
        post.org = data.org;
        post.name = data.name;
        post.identity = data.identity;
        post.identity = data.identity;
        post.busine = this.format_up_img(data.busine);
        post.id_front = this.format_up_img(data.id_front);
        post.id_back = this.format_up_img(data.id_back);
        post.license = this.format_up_img(data.license);

        app.ajax('my/roleApply', post, () => {
          // this.applyInfo(() => {
            this.setData({ apply_loading: false });
          // });
        }, null, () => {
          this.setData({ apply_loading: false });
        });
      }
    }
  },
  // 格式化上传图片路径
  format_up_img(url) {
    return url.replace(app.my_config.qiniu_base + '/', '');
  },
  img_upload(e) {
    let field = e.currentTarget.dataset.name;

    app.choose_img(1, res => {
      if (res) {
        wx.showLoading({
          title: '上传中',
          mask: true
        });
        let tname = app.qiniu_tname() + res[0].ext;
        app.qiniu_upload(res[0].path, tname, () => {
          this.setData({ [field]: app.format_img(tname) });
        }, () => {
          wx.hideLoading();
        });
      }
    }, 1048576);
  },
  img_remove(e) {
    this.setData({ [e.currentTarget.dataset.name]: '' });
  },
  bind_input(e) {
    this.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
  },
  // 获取申请信息
  applyInfo(complete) {
    app.ajax('my/applyInfo', null, res => {
      app.format_img(res, 'id_front');
      app.format_img(res, 'id_back');
      app.format_img(res, 'license');

      let data = {
        role: res.role + '',
        org: res.org || '',
        name: res.name,
        identity: res.identity,
        busine: res.busine || '',
        reason: res.reason,
        id_front: res.id_front,
        id_back: res.id_back,
        license: res.license,

        role_check: res.role_check
      };

      switch (res.role) {
        case 1:
          data.role_text = '文旅机构';
          break;
        case 2:
          data.role_text = '工厂';
          break;
      }

      wx.setNavigationBarTitle({ title: '申请成为' + data.role_text });

      this.setData(data);
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading();
    this.applyInfo(() => {
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    });
  },
  switch_my() {
    wx.switchTab({ url: '/pages/my/my' });
  }
});