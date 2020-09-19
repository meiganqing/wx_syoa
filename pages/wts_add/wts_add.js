
var SysConfig = require('../../utils/util.js');

Page({
  data: {
    onlynum:"",
    creator: "",//姓名
    creatorId: "",//userid
    // depart: "",//部门
    sDate: "",//开始时间
    eDate: "",//结束时间
    sDate_data: "",
    eDate_data:"",
    showEnd: false,//结束时间弹框
    showStart: false,//开始时间弹框
    leaveReason: "",//申请事由
    idcard:"",//身份证
    rowiddata: {
      rowid: ""
    },
    bsqr:"",//被授权人
    bsqrshow:false,
    mainActiveIndex: 0,//左侧选中项的索引
    activeId:null,// 右侧选中项的 id，支持传入数组
    sxpeople: [],
    filearray: [],//附件数组
    fileid: "18526F2C-D7E4-44EC-AD03-CD2D4903727A",//文件关联id
  },

  onLoad: function (options) {
    if (!options.id) {
      this.setData({
        judge_id: ""
      })
    } else {
      this.setData({
        judge_id: options.id
      })
    }
     //获取选择部门
     SysConfig.SubSystemData.request({
      istoken: true, //是否使用token
      XKLX: "SYYHGL", //接口XKLX参数
      XAction: "GetDataInterface", //接口XAction参数
      data: { //接口body体内参数
        "XDLMCID": "1001",
        "XDLMSID": "DYBH20190823102601261218191",
      },
      method: "GET"
    }).then((bmData) => {
      let depArr = []
      if (bmData.success) {
        for (var i = 0; i < bmData.rows.length; i++) {
          depArr.push(bmData.rows[i].DepartName)
        }
      }
      this.setData({
        depxuanze: depArr
      })
      return SysConfig.SubSystemData.request({
        istoken: true, //是否使用token
        XKLX: "SYYHGL", //接口XKLX参数
        XAction: "GetDataInterface", //接口XAction参数
        data: { //接口body体内参数
          "XDLMCID": "1001",
          "XDLMSID": "DYBH20190823102601261253201",
          "XDLMK":"副院长"
        },
        method: "GET"   //请求方式  目前接口先暂时全部使用get方式
      })
    }).then((res) => {
      //  let rynamearr = ["孙周勇", "王继源", "王小蒙", "赵西晨", "种建荣"]
      const { depxuanze } = this.data;
      let peoplearr = [];
      if (res.rows && res.rows.length > 0 && depxuanze.length > 0) {
        for (let i = 0; i < depxuanze.length; i++) {
           let ispeople=false
          let _children = []
          for (let j = 0; j < res.rows.length; j++) {
            if (depxuanze[i] == res.rows[j].mDepart) {
                // if(rynamearr.includes(res.rows[j].mUserName)){
                    ispeople=true
                  _children.push({
                    text: res.rows[j].mUserName,
                    id: res.rows[j].mUserID,
                    user_bm: res.rows[j].mDepart,
                    sfzh:res.rows[j].sfzh
                  })
                // }
            }
          }
          if(ispeople){
             peoplearr.push({
              text: depxuanze[i],
              disabled: false,
              children: _children
            })
          }
        }
      }
  
      this.setData({
        sxpeople: peoplearr
      });
    })
    if (options.id){
      // 单体数据
      SysConfig.SubSystemData.request({
        istoken: true, //是否使用token
        XKLX: "SYBGGL", //接口XKLX参数
        XAction: "GetDataInterface", //接口XAction参数
        data: { //接口body体内参数
          "XDLMCID": "1001",
          "XDLMSID": "DYBH202009111652395239125572",
          "XDLMA": options.id
        },
        method: "GET"   //请求方式  目前接口先暂时全部使用get方式
      }).then((res)=>{
        this.setData({
          rowiddata: {
            rowid: options.id
          },
          creator: res.rows[0].creator,
          bsqr:res.rows[0].被授权人,
          // activeId:res.rows[0].creator_id,
          creatorId: res.rows[0].creator_id,
          idcard: res.rows[0].身份证号,
          sDate: res.rows[0].授权开始日期.split(" ")[0],
          sDate_data: new Date(res.rows[0].授权开始日期).getTime(),
          eDate: res.rows[0].授权结束日期.split(" ")[0],
          eDate_data: new Date(res.rows[0].授权结束日期).getTime(),
          leaveReason: res.rows[0].事件,
          onlynum: res.rows[0].onlynum,
        })
        return SysConfig.SubSystemData.request({//附件
          istoken: true, //是否使用token
          XKLX: "SYBGGL", //接口XKLX参数
          XAction: "GetDataInterface", //接口XAction参数
          data: { //接口body体内参数
            "XDLMCID": "1001",
            "XDLMSID": "DYBH20200218104720472064331",
            "XDLMB": res.rows[0].onlynum
          },
          method: "GET"
        })
      }).then((res) => {
        let rowidfiledata = [];
        for (let i = 0; i < res.rows.length; i++) {
          rowidfiledata.push({
            rowid: res.rows[i].id,
            name: res.rows[i].文件名,
            path: res.rows[i].文件地址
          })
        }
        this.setData({
          filearray: rowidfiledata
        })
      })
    }else{
      this.setData({
        onlynum: SysConfig.ToolBox.getTimeAndRandom(),
        // sDate: SysConfig.ToolBox.CurrentDate() + " " + "18:00:00",//开始时间
        // eDate: SysConfig.ToolBox.CurrentDate() + " " + "23:00:00",//结束时间
        sDate_data: new Date(SysConfig.ToolBox.CurrentDate()).getTime(),
        eDate_data: new Date(SysConfig.ToolBox.CurrentDate()).getTime(),
      })
      // 获取人名
      SysConfig.UserInfo.GetUserName().then((res) => {
        this.setData({
          creator: res.data
        })
      })
      // 获取人员id
      SysConfig.UserInfo.GetUserID().then((res) => {
        this.setData({
          creatorId: res.data
        })
      })
      // 获取部门
      SysConfig.UserInfo.GetUserDepart().then((res) => {
        this.setData({
          depart: res.data
        })
      })
  }
  },  
  // 开始时间弹出层
  showPopupstartTime() {
    this.setData({
      showStart: true
    });
  },
  cancel_sDate() {//开始时间取消
    this.setData({
      showStart: false
    });
  },
  confirm_sDate(e) {//开始时间确定
      this.setData({
        sDate_data: e.detail,
        showStart: false,
        sDate: SysConfig.ToolBox.transTime(e.detail, false),
      });
    
  },
  // 结束时间弹出层
  showPopupendTime() {
    this.setData({
      showEnd: true
    });
  },
  cancel_eDate() {//结束时间取消
    this.setData({
      showEnd: false
    });
  },
  confirm_eDate(e) {//结束时间确定
      this.setData({
        eDate_data: e.detail,
        showEnd: false,
        eDate: SysConfig.ToolBox.transTime(e.detail, false),
      });
  },
  //请假事由
  onChangeReason(event) {
    this.setData({
      leaveReason: event.detail
    })
  },
  onChangeidcard(event){
    this.setData({
      idcard: event.detail
    })
  },
  tiaoUrl() {
    wx.navigateTo({
      url: '/pages/wts_list/wts_list'
    })
   
  },
  bsqrcilck(){
    this.setData({
      bsqrshow:true
    })
  },
  bsqr_close(){
    this.setData({
      bsqrshow:false
    })
  },
  onClickNav({ detail = {} }) {
    this.setData({
      mainActiveIndex: detail.index || 0
    })
  },
  onClickItem({ detail = {} }) {
    let { activeId } = this.data;
    console.log(detail)
    activeId=detail.id
    this.setData({
      bsqr:detail.text,
      idcard:detail.sfzh,
      activeId
    });

  },
  // 提交表单
  submitTijiao() {
   
    var that = this
    let dataparams={}
    if (!that.data.idcard) {
      wx.showToast({
        title: "请填写身份证号",
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (!that.data.sDate) {
      wx.showToast({
        title: "请填写开始日期",
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (!that.data.eDate) {
      wx.showToast({
        title: "请填写结束日期",
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (!that.data.leaveReason) {
      wx.showToast({
        title: "请填写事件",
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (that.data.rowiddata.rowid){
      dataparams={
        "XDLMCID": "6000",
        "XDLMSID": "DYBH202009111652395239106575",
        "XDLMID": that.data.rowiddata.rowid,
        "XDLM被授权人": that.data.bsqr,
        "XDLM身份证号": that.data.idcard,
        "XDLM授权开始日期": that.data.sDate,
        "XDLM授权结束日期": that.data.eDate,
        "XDLM事件": that.data.leaveReason,
      }
    }else{
      dataparams={
        "XDLMCID": "5000",
        "XDLMSID": "DYBH20200911165239523986573",
        "XDLMonlynum": that.data.onlynum,
        "XDLMshzt": "待提交",
        "XDLM身份证号": that.data.idcard,
        "XDLM授权开始日期": that.data.sDate,
        "XDLM授权结束日期": that.data.eDate,
        "XDLM添加时间": SysConfig.ToolBox.CurrentDate() + " " + SysConfig.ToolBox.CurrentTime(),
        "XDLMcreator_id": that.data.creatorId,
        "XDLM被授权人": that.data.bsqr,
        "XDLMcreator": that.data.creator,
        "XDLMtitle": that.data.creator + '发起的授权委托申请',
        "XDLM事件": that.data.leaveReason
      }
    }
    SysConfig.SubSystemData.request({
      istoken: true, //是否使用token
      XKLX: "SYBGGL", //接口XKLX参数
      XAction: "GetDataInterface", //接口XAction参数
      data: dataparams,
      method: "GET"   //请求方式  目前接口先暂时全部使用get方式
    }).then((data) => {
      console.log(that.data.filearray)
      let file_data = that.data.filearray
      let file_data_obj = []
      for (let i in file_data) {
        if (!file_data[i].rowid) {
          file_data_obj.push({
            "XDLM库内编号": SysConfig.ToolBox.getTimeAndRandom(),
            "XDLM关联编号": that.data.onlynum,
            "XDLM文件名": file_data[i].name,
            "XDLM原文件名": file_data[i].name,
            "XDLM文件地址": file_data[i].path,
            "XDLM类型": that.data.fileid,
            "XDLM添加人": that.data.creator
          })
        }
      }
      if(file_data_obj.length>0){
        SysConfig.SubSystemData.request({
          istoken: true,
          XKLX: "SYBGGL",
          XAction: "GetDataInterface",
          data: {
            "XDLMCID": '5001',
            "XDLMSID": 'DYBH2020032619111906955409',
            "datalist": JSON.stringify({ "key": file_data_obj })
          },
          method: "GET"
        })
      }
      if(that.data.bsqr=="种建荣"){
          return SysConfig.WorkflowManage.create(that.data.onlynum, '授权委托_种建荣')
      }else if (that.data.bsqr=="赵西晨") {
        return SysConfig.WorkflowManage.create(that.data.onlynum, '授权委托_赵西晨')
      }else if(that.data.bsqr=="王小蒙"){
        return SysConfig.WorkflowManage.create(that.data.onlynum, '授权委托_王小蒙')
      }else if(that.data.bsqr=="王继源"){
        return SysConfig.WorkflowManage.create(that.data.onlynum, '授权委托_王继源')
      }
        // return SysConfig.WorkflowManage.create(that.data.onlynum, '授权委托_王继源')
    }).then((shlc) => {
        console.log(shlc)
        let icon;
        if (shlc.success) {
          icon = 'success';
        } else {
          icon = 'none';
        }
        wx.showToast({
          title: shlc.message,
          icon: 'success',
          duration: 2000,
          success: () => {
            if (this.data.judge_id!="") {
            wx.navigateBack({
            delta: 1
            })
            }else{
            wx.redirectTo({
              url: '/pages/wts_list/wts_list'
            })
            }
          }
        })
      })
  },
    // 上传文件
    upload: function (e) {
      var that = this
      wx.chooseMessageFile({
        count: 1,
        type: 'file',
        success(res) {
          let filenandp = {};
          filenandp.name = res.tempFiles[0].name
          SysConfig.Upload.upLoadFile(res.tempFiles[0].path, res.tempFiles[0].name).then((res) => {
            let allfile = []
            filenandp.path = JSON.parse(res.data).filepath
            allfile = that.data.filearray
            allfile.push(filenandp)
            that.setData({
              filearray: allfile
            });
          })
        }
      })
    },
    showfile(e) {
      SysConfig.Upload.downloadFile(e.currentTarget.dataset.id)
    },
    delefile(e) {
      console.log(e)
      if (this.data.rowiddata.rowid && e.currentTarget.dataset.rowid) {
        SysConfig.SubSystemData.request({
          istoken: true, //是否使用token
          XKLX: "SYBGGL", //接口XKLX参数
          XAction: "GetDataInterface", //接口XAction参数
          data: { //接口body体内参数
            "XDLMCID": "4000",
            "XDLMSID": "DYBH202002181047204720115334",
            "XDLMROWID": e.currentTarget.dataset.rowid
          },
          method: "GET"
        })
      }
      let UploadData = this.data.filearray
      UploadData.splice(e.currentTarget.dataset.index, 1);
      this.setData({
        filearray: UploadData
      });
    }
})
