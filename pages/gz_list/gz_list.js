// pages/gz_list/gz_list.js
var SysConfig = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gzdata:[],
    mUserID:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    SysConfig.UserInfo.GetUserID().then((res) => {
      this.setData({
          mUserID: res.data
      })
      return SysConfig.SubSystemData.request({
        istoken: true,
        XKLX: "SYRSGL",
        XAction: "GetDataInterface",
        data: {
          "XDLMCID": "1001",
          "XDLMSID": "DYBH201911071313251325192271",
          "XDLME":"是",
          "QueryType": "用户id",
          "QueryKey": this.data.mUserID
        },
        method: "GET"
      })
    }).then((res)=>{
        console.log(res.rows)
        this.setData({
          gzdata:res.rows
        })
    })
  },

  gzxq(e){
    console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/gz_xq/gz_xq?id='+e.currentTarget.dataset.id
    })
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