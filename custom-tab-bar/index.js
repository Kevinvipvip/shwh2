Component({
  data: {
    selected: 0,
    color: "#555",
    selectedColor: "#ff4544",
    list: [{
      pagePath: "/pages/index/index",
      iconPath: "/icons/home.png",
      selectedIconPath: "/icons/home-active.png",
      text: "首页"
    }, {
      pagePath: "/pages/notes/notes",
      iconPath: "/icons/note.png",
      selectedIconPath: "/icons/note-active.png",
      text: "笔记"
    }, {
      pagePath: "/pages/my/my",
      iconPath: "/icons/my.png",
      selectedIconPath: "/icons/my-active.png",
      text: "我的"
    }]
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({ url })
    }
  }
})