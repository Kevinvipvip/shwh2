const app = getApp();

Page({
  data: {
    is_ios: false,

    tag_list: [],

    req_id: 0,
    title: '',  // 创意标题
    content: '',  // 创意内容
    content_count: 0
  },
  onLoad(options) {
    this.setData({ is_ios: app.is_ios });
    this.data.req_id = options.req_id;
    this.ideaTagsList();
  },
  // 创意标签列表
  ideaTagsList() {
    app.ajax('api/ideaTagsList', null, res => {
      for (let i = 0; i < res.length; i++) {
        res[i].flex_pad = app.null_arr(res[i].child.length, 5);
        for (let j = 0; j < res[i].child; j++) {
          res[i].child[j].selected = false;
        }
      }
      this.setData({ tag_list: res });
    });
  },
  // 选择标签
  tag_choose(e) {
    let index = e.currentTarget.dataset.index;
    let sub_index = e.currentTarget.dataset.sub_index;

    if (this.get_tags().length >= 5 && !this.data.tag_list[index].child[sub_index].selected) {
      app.toast('标签最多选择5个');
    } else {
      this.setData({ [`tag_list[${index}].child[${sub_index}].selected`]: !this.data.tag_list[index].child[sub_index].selected });
    }
  },
  // 获得选中标签id列表
  get_tags() {
    let tags = [];
    for (let i = 0; i < this.data.tag_list.length; i++) {
      for (let j = 0; j < this.data.tag_list[i].child.length; j++) {
        if (this.data.tag_list[i].child[j].selected) {
          tags.push(this.data.tag_list[i].child[j].id);
        }
      }
    }
    return tags;
  },
  bind_input(e) {
    app.bind_input(e, this);
    if (e.currentTarget.dataset.name === 'content') {
      this.setData({ content_count: this.data.content.length });
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
        content: data.content,
        tags: this.get_tags().toString()
      };

      wx.showLoading({ mask: true });
      app.ajax('api/createIdea', post, () => {
        app.modal('创意发布成功', () => {
          wx.redirectTo({ url: '/pages/my-chuang/my-chuang' });
        });
      }, err => {
        app.modal(err.message);
      }, () => {
        wx.hideLoading();
      });
    }
  }
});