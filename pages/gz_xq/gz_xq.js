// pages/gz_xq/gz_xq.js
var SysConfig = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rowid:"",
    ydtitles:"",
    gzxqdata:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
          rowid:options.id
      })
    SysConfig.SubSystemData.request({
        istoken: true,
        XKLX: "SYRSGL",
        XAction: "GetDataInterface",
        data: {
          "XDLMCID": "1001",
          "XDLMSID": "DYBH201911071313251325204272",
          "XDLMA":options.id
        },
        method: "GET"
    }).then((res)=>{
        const ydzx=res.rows[0]['月度薪资'].split("-")
        this.setData({
           gzxqdata:res.rows[0],
           ydtitles:`${ydzx[0]}年${ydzx[1]}月`,
        })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})