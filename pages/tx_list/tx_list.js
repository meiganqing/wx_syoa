// pages/vactionDetail/vactionDetail.js
var SysConfig = require("../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  tiaoUrl: function (e) {
    var gzr = e.currentTarget.dataset.gzr
    var txstyle = e.currentTarget.dataset.txstyle
  console.log(txstyle)
    if(txstyle == "已过期"){
      wx.showToast({
        title: "已过期不可调休",
        icon: 'none',
        duration: 2000
      })
    }else{
      wx.navigateTo({
        url: '../tx_add/tx_add?gzr='+gzr
      })
    }
  
  },



    /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {

    SysConfig.UserInfo.GetUserID().then((res) => {
      this.setData({
        mUserID: res.data
      })
  
   
    SysConfig.SubSystemData.request({
      istoken: true,
      method: "GET",
      XKLX: "SYBGGL",
      XAction: "GetDataInterface",
      data: {
        "XDLMCID": "1001",
        "XDLMSID": "DYBH201908231020302030191181",
        "XDLMA":"加班",
        "XDLMJ":"未调休",
        "XDLMC": this.data.mUserID,
        "XDLME":"已完成"
      }
    }).then((res) => {
      console.log(res)
      if(res.rows!=""){
        var txaRR=[]
      for(var i=0; i<res.rows.length;i++){
        console.log(i)
        txaRR.push({
          creator:res.rows[i].creator,
          fqsj:res.rows[i].fqsj,
          depart:res.rows[i].depart,
          leaveType:res.rows[i].leaveType,
          leavenum:res.rows[i].leavenum,
          txstyle:isOverdue(res.rows[i].endTime)

        } )
    }
          this.setData({
            txData:txaRR
          })
      }else{
        wx.showToast({
          title: "暂时还没有可调休的数据",
          icon: 'none',
          duration: 2000,
          success:()=>{
            setTimeout(()=>{
              wx.navigateBack({delta:1})
            },2000)
          }
        })
      }
     
  })
  })
  }
})

// function isOverdue(jb_endTime){
//   var jb_d = new Date(jb_endTime).getTime();
//   var first_d = getDates().first_day;
//   var last_d = getDates().last_day;
//   // 若当次加班结束时间大于当月第一天，并且小于当月最后一天时

//   if(jb_d >= new Date(first_d).getTime() && jb_d < new Date(last_d).getTime() ){
  
//       return "可调休"; //可调休
//   }else {
//       return "已过期";  //过期
//   }

// }
function isOverdue(jb_endTime) {
  var jb_d = new Date(jb_endTime).getTime();
  var this_d = new Date().getTime();
  var last_d = getDates(jb_endTime).last_day;
  // 当前日期小于加班结束月份的次月最后一天，并且大于等于加班结束日期当天，为可调休
  if ((this_d < new Date(last_d).getTime()) && (this_d >= jb_d)) {
      return "可调休"; //可调休
  } else {
      return "已过期"; //过期
  }
}


// // 获取当前月的第一天和最后一天
// function getDates(){
//   var now = new Date();
//   var month = now.getMonth() + 1;  //获取到的是月份是 0-11 所以要加1
//   if(month <= 9){
//       month = "0" + month;
//   }
//   var year = now.getFullYear();
//   var nextMonthFirstDay = new Date([year,parseInt(month) + 1,1].join('-')).getTime();
//   if(nextMonthFirstDay <= 9){
//       nextMonthFirstDay = "0" + nextMonthFirstDay;
//   }
//   var oneDay = 1000 * 24 * 60 * 60;
//   var monthLast = new Date(parseInt(nextMonthFirstDay) - oneDay).getDate()
//   return {"first_day": [year, month, "01"].join('-') + " 00:00:00", "last_day": [year, month, monthLast].join('-') + " 23:59:59"};
// }
// 不大于加班月份的次月的最后一天
function getDates(jbend) {
  let year = parseInt(jbend.split('/')[0]),
      nextMonth = parseInt(jbend.split('/')[1]) + 1;
  if (nextMonth > 12) {
      nextMonth = nextMonth - 12;
      year = year + 1;
  }
  var lastday = nextMonthDay(year, nextMonth);
  return { "last_day": [year, nextMonth, lastday].join('-') + " 23:59:59" };
}

function nextMonthDay(year, month) { //判断每月多少天
  var day31 = [1, 3, 5, 7, 8, 10, 12];
  var day30 = [4, 6, 9, 11];
  if (day31.indexOf(month) > -1) {
      return 31;
  } else if (day30.indexOf(month) > -1) {
      return 30;
  } else {
      if (isLeapYear(year)) {
          return 29;
      } else {
          return 28;
      }
  }
}

function isLeapYear(year) { //判断是否为闰年
  return (year % 4 == 0) && (year % 100 != 0 || year % 400 == 0);
}


