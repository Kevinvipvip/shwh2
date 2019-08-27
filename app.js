App({
  onLaunch: function () {
    let that = this;
    wx.getSystemInfo({
      success(res) {
        that.my_config.statusBarHeight = res.statusBarHeight;
        if (res.model.indexOf('iPhone') !== -1) {
          that.my_config.topBarHeight = 44;
        } else {
          that.my_config.topBarHeight = 48;
        }
      }
    });
  },
  my_config: {
    base_url: 'https://caves.wcip.net',  // 正式
    api: 'https://caves.wcip.net/api/',  // 正式
    default_img: '/images/default.png',
    reg: { 
      tel: /^1\d{10}$/,
      phone: /\d{3,4}-\d{7,8}/,
      email: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/,
      natural: /^([1-9]\d*|0)$/
    },
    statusBarHeight: 0,
    topBarHeight: 0
  },
  user_data: {
    token: '',
    uid: 0,
    role: 0
  },
  mp_update() {
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      console.log(res.hasUpdate);  // 是否有更新
    });
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否马上重启小程序？',
        success: function (res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    });
    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
    })
  },
  toast(title, duration, icon = 'none') {
    let dura = duration || 2000;
    wx.showToast({
      title: String(title),
      icon: icon,
      duration: dura
    })
  },
  modal(content, callback) {
    wx.showModal({
      title: '提示',
      content: content,
      showCancel: false,
      success() {
        if (callback) {
          callback();
        }
      }
    });
  },
  ajax(path, data, succ, err, complete) {
    let that = this;
    wx.request({
      url: path,
      method: 'POST',
      dataType: 'json',
      data: data,
      success(res) {
        if (res.data.code !== 1) {
          if (err) {
            err(res.data);
          } else {
            switch (res.data.code) {
              case -3:  // token失效
              case -5:  // token未传
                let current_pages = getCurrentPages();
                let current_page = current_pages[current_pages.length - 1];
                wx.redirectTo({ url: '/pages/login/login?route=' + encodeURIComponent(current_page.route + that.obj2query(current_page.options)) });
                break;
              case 49:
                  that.toast(res.data.data);
                break;
              default:
                if (res.data.message) {
                  that.toast(res.data.message);
                } else {
                  that.toast('网络异常');
                }
                break;
            }
          }
        } else {
          if (succ) {
            succ(res.data.data);
          }
        }
      },
      fail() {
        // that.toast('网络异常');
      },
      complete() {
        if (complete) {
          complete();
        }
      }
    });
  },
  // 获取打开的页面
  get_page(page_name) {
    let pages = getCurrentPages();
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].route === page_name) {
        return pages[i];
      }
    }
    return false;
  },
  // 用户是否授权获取用户信息
  get_auth(callback) {
    wx.getSetting({
      success(res) {
        callback(res.authSetting['scope.userInfo']);
      }
    })
  },
  get_code(callback) {
    wx.login({
      success(login) {
        callback(login.code);
      }
    });
  },
  // 小程序登录获取token
  login(callback) {
    this.get_code((code) => {
      let post = {
        code: code
      };

      this.ajax(this.my_config.api + 'login/login', post, (res) => {
        callback(res);
      });
    })
  },
  // 授权获取用户信息
  userAuth(inviter_id, callback) {
    let that = this;
    wx.getUserInfo({
      success(user) {
        let post = {
          token: that.user_data.token,
          iv: user.iv,
          encryptedData: user.encryptedData
        };
        if (inviter_id) {
          post.inviter_id = inviter_id;
        }
        that.ajax(that.my_config.api + 'login/userAuth', post, () => {
          callback(true);
        }, () => {
          callback(false);
        });
      }
    });
  },
  // 用户是否授权（后端）
  checkUserAuth(callback) {
    let post = {
      token: this.user_data.token
    };
    this.ajax(this.my_config.api + 'login/checkUserAuth', post, (res) => {
      callback(res);
    });
  },
  // 返回处理过的分享路径
  share_path() {
    let current_pages = getCurrentPages();
    let current_page = current_pages[current_pages.length - 1];
    return '/pages/auth/auth?route=' + encodeURIComponent(current_page.route + this.obj2query(current_page.options));
  },
  // 如果不存在route，跳转到首页，否则根据是否是tabbar页进行跳转
  redirect_or_switch_or_index(route) {
    if (!route) {
        wx.switchTab({ url: '/pages/index/index' });
    } else {
      switch (route) {
        case 'pages/index/index':
        case 'pages/shop/shop':
        case 'pages/notes/notes':
        case 'pages/my/my':
          wx.switchTab({ url: '/' + route });
          break;
        default:
          wx.redirectTo({ url: '/' + route });
          break;
      }
    }
  },
  /* 内部方法 */
  // 对象转query字符串
  obj2query(obj) {
    let query = '';
    for (let key in obj) {
      query += key + '=' + obj[key] + '&';
    }
    if (!query) {
      return '';
    } else {
      return '?' + query.substr(0, query.length - 1);
    }
  },
  // 处理图像路径（详情）
  format_img(obj, img_field = 'pic') {
    if (obj[img_field]) {
      obj[img_field] = this.my_config.base_url + '/' + obj[img_field];
    } else {
      obj[img_field] = this.my_config.default_img;
    }
  },
  // 处理图像路径（列表）
  format_img_arr(list, img_field = 'pic') {
    for (let i = 0; i < list.length; i++) {
      if (list[i][img_field]) {
        list[i][img_field] = this.my_config.base_url + '/' + list[i][img_field];
      } else {
        list[i][img_field] = this.my_config.default_img;
      }
    }
  },
  // 头像处理
  avatar_format(obj) {
    if (!obj.avatar) {
      obj.avatar = '';
    } else {
      obj.avatar = obj.avatar.indexOf('https') === 0 ? obj.avatar : this.my_config.base_url + '/' + obj.avatar;
    }
  },
  // 获取七牛云上传TOKEN
  getUpToken(callback) {
    this.ajax(this.my_config.api + 'qiniu/getUpToken', post, res => {
      callback(res);
    });
  }
});