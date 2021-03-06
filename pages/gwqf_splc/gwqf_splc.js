
var SysConfig = require("../../utils/util.js")
Page({
  data: {
    lzyj_data: [], //流转意见
    useData: { //用户数据
      mUserID: null
    },
  
    pageParams: {}, //页面参数
    rowidData: {}, //单行数据
    backNode: [], //退回节点数据渲染
    ht_jd: null, //回退节点
    xianyin: true,
    steps: [],//所有步骤
    active: 0,//	当前步骤
    qyread:false,//是否显示签阅情况
    activeNames: [],
    read_data:[],
    qyqk_data: {
      qyqk_data_name:"",
      qyqk_data_nameid: "",
      readpeople_id:""
    },
    readremake_value: "",//阅读内容
    shradio:"ry",//默认选中
    sxpeople: [],
    mainActiveIndex: 0,//左侧选中项的索引
    activeId: null,// 右侧选中项的 id，支持传入数组
    showrenyuan: false,//审核人弹出层
    bmlist:[],//审核部门
    bmry:[],
    readtype:"批阅意见",
    readBtncontent:"已阅",
    ryradio:"",
    spzt:true,//审核显示
    thradio:"thno",
    htspzt:true,//回退显示
    rydataarr:[],//人员信息
  },
  onLoad: function(options) {
    this.setData({
      pageParams: {
        rowid: options.id,
        m_LConlynum: options.xmlcid,
        m_Onlynum: options.onlynum,
        module: options.module,
        urlid: options.urlid,
      }
    })
      //获取选择部门负责人
    SysConfig.SubSystemData.request({
      istoken: true, //是否使用token
      XKLX: "SYYHGL", //接口XKLX参数
      XAction: "GetDataInterface", //接口XAction参数
      data: { //接口body体内参数
        "XDLMCID": "1001",
        "XDLMSID": "DYBH20190823102601261253201",
        "XDLMJ": "1"
      },
      method: "GET"
    }).then((bmData) => {
      // let depArr = []
      // if (bmData.success) {
      //   for (var i = 0; i < bmData.rows.length; i++) {
      //     depArr.push(bmData.rows[i].mDepart)
      //   }
      // }
      this.setData({
        bm_arr:bmData.rows
      })
      })
         //获取选择部门
    SysConfig.SubSystemData.request({
      istoken: true, //是否使用token
      XKLX: "SYYHGL", //接口XKLX参数
      XAction: "GetDataInterface", //接口XAction参数
      data: { //接口body体内参数
        "XDLMCID": "1001",
        "XDLMSID": "DYBH20190823102601261218191"
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
        },
        method: "GET"   //请求方式  目前接口先暂时全部使用get方式
      })
    }).then((res) => {
      let rynamearr = ["孙周勇", "王继源", "王小蒙", "赵西晨", "种建荣"]
      const { depxuanze } = this.data;
      let peoplearr = [];
      if (res.rows && res.rows.length > 0 && depxuanze.length > 0) {
        for (let i = 0; i < depxuanze.length; i++) {
           let ispeople=false
          let _children = []
          for (let j = 0; j < res.rows.length; j++) {
            if (depxuanze[i] == res.rows[j].mDepart) {
               if(rynamearr.includes(res.rows[j].mUserName)){
                  ispeople=true
                  _children.push({
                    text: res.rows[j].mUserName,
                    id: res.rows[j].mUserID,
                    user_bm: res.rows[j].mDepart
                  })
               }
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
      //  if (res.rows && res.rows.length > 0) {
      //     let rynamearr = ["孙周勇", "王继源", "王小蒙", "赵西晨", "种建荣"]
      //     let _children = []
      //     for (let j in rynamearr) {
      //           for (let i = 0; i < res.rows.length; i++) {
      //              if (rynamearr[j] == res.rows[i].mUserName) {
      //                 _children.push({
      //                   text: res.rows[i].mUserName,
      //                   id: res.rows[i].mUserID,
      //                   user_bm: res.rows[i].mDepart
      //                 })
      //              }
      //         }
      //    }
      //    this.setData({
      //       sxpeople: _children
      //     });
      // }
    })


    SysConfig.UserInfo.GetUserID().then((res) => {
      this.setData({
        useData: {
          mUserID: res.data
        }
      })
      return SysConfig.SubSystemData.request({ // 获取主表单行数据
        istoken: true,
        XKLX: "SYBGGL",
        XAction: "GetDataInterface",
        data: {
          "XDLMCID": "1001",
          "XDLMSID": "DYBH202007101118581858144452",
          "XDLMA": this.data.pageParams.urlid,
        },
        method: "GET"
      })
    }).then((res) => {
      if (res.rows) {
        this.setData({
          rowidData:res.rows[0],
        })
        return SysConfig.SubSystemData.request({ // 获取流转意见
          istoken: true,
          XKLX: "SYBGGL",
          XAction: "GetDataInterface",
          data: {
            "XDLMCID": "1001",
            "XDLMSID": "DYBH20200317113731373146231",
            "XDLMA": this.data.rowidData.onlynum,
          },
          method: "GET"
        })
      }
    }).then((rydata) => {
      let raednr=[];//签约情况
      let yiarr=[]
      let lcarr=[{
        text:"发起申请"
      }]
      yiarr.push({
        biaoti:"公文批阅申请",
        name:`申请人【${this.data.rowidData.creator}】`,
        time:`申请时间【${this.data.rowidData['添加时间']}】`
      })
      if(rydata.rows && rydata.rows.length > 0){
          this.setData({
            rydataarr:rydata.rows
          })
          for(let i=0;i<rydata.rows.length;i++){
            if(rydata.rows[i]['是否已读']== "是"&&rydata.rows[i]['是否部门科室']== "否"){
              if(i==0){
                yiarr.push({
                  biaoti:rydata.rows[i]['人员']+"批阅",
                  name:`批阅人【${rydata.rows[i]['人员']}】`,
                  tixing_time:`提醒时间【${this.data.rowidData['添加时间']}】`,
                  yijian:`签批意见【${rydata.rows[i]['备注']}】`,
                  time:`签批时间【${rydata.rows[i]['已读时间']}】`
                })
              }else{
                yiarr.push({
                  biaoti:rydata.rows[i]['人员']+"批阅",
                  name:`批阅人【${rydata.rows[i]['人员']}】`,
                  tixing_time:`提醒时间【${rydata.rows[i-1]['已读时间']}】`,
                  yijian:`签批意见【${rydata.rows[i]['备注']}】`,
                  time:`签批时间【${rydata.rows[i]['已读时间']}】`
                })
              }
            }
            if(rydata.rows[i]['是否部门科室']== "是"){
              raednr.push(rydata.rows[i])
            }else{
              lcarr.push({
                text: rydata.rows[i]['人员']
              }) 
            }
          }
          for (let i = 0; i < rydata.rows.length; i++) {
            if (rydata.rows[i].是否部门科室 == "是") {
              this.setData({
                active:  i,
                qyread: true,
                readtype:"办理结果",
                readBtncontent:"确认"
              })
              break;
            }
        }
          for (let i = 0; i < rydata.rows.length; i++) {
              if (rydata.rows[i]['是否部门科室']== "否"&&rydata.rows[i].是否已读 == "否") {
                  this.setData({
                    active:  i + 1,
                  })
                  break;
              }
          }
          for (let i = 0; i < rydata.rows.length; i++) {
            if (rydata.rows[i].是否已读 == "否"&&this.data.useData.mUserID==rydata.rows[i].人员ID) {
                this.setData({
                  ['qyqk_data.readpeople_id']:rydata.rows[i].id
                })
                break;
            }
          }
          for (let i = 0; i < rydata.rows.length; i++) {
            if (rydata.rows[i].是否已读 == "是") {
                this.setData({
                  htspzt:true
                })
              
            }
        }
          // for (let i = 0; i < rydata.rows.length; i++) {
          //   if (rydata.rows[i].是否已读 == "否" &&this.data.useData.mUserID!=rydata.rows[i].人员ID) {
          //       this.setData({
          //         ["qyqk_data.qyqk_data_name"]:rydata.rows[i].人员,
          //         ["qyqk_data.qyqk_data_nameid"]:rydata.rows[i].人员ID
          //       })
          //       break;
          //   }
          // }
      }
      this.setData({
        lzyj_data: yiarr,
        steps:lcarr,
        read_data:raednr
      })
      return SysConfig.SubSystemData.request({ // 附件
        istoken: true,
        XKLX: "SYBGGL",
        XAction: "GetDataInterface",
        data: {
          "XDLMCID": "1001",
          "XDLMSID": "DYBH20200218104720472064331",
          "XDLMB": this.data.rowidData.onlynum
        },
        method: "GET"
      })
    }).then((res)=>{
      let _fliedata = [];
      if (res.rows && res.rows.length > 0) {
        for (let i in res.rows) {
          _fliedata.push({
            name: res.rows[i].文件名,
            path: res.rows[i].文件地址
          })
        }
        this.setData({
          filearray: _fliedata
        })
      } 
    })
    
  },
  showfile(e) {
    SysConfig.Upload.downloadFile(e.currentTarget.dataset.id)
  },
  qyqk_Change(event) {
    this.setData({
      activeNames: event.detail
    });
  },
  shtypeChange(event){//审核状态切换
    this.setData({
      shradio: event.detail
    });
  },
  thtypeChange(event){//退回状态切换
    this.setData({
      thradio: event.detail
    });
    if(event.detail=="thyes"){
        this.setData({
          spzt:false,
          readBtncontent:"退回上一级"
        }); 
    }else{
      this.setData({
        spzt:true,
        readBtncontent:"已阅"
      });  
    }
  },
   // 人员选择
  showRenyuan_true() {//人员弹框开启
    this.setData({
      showrenyuan: true
    });
  },
  onClickNav({ detail = {} }) {
    this.setData({
      mainActiveIndex: detail.index || 0
    })
  },
  onClickItem({ detail = {} }) {
    let { activeId } = this.data;
    let tryqrarr_name = "";
    let tryqrarr_=[];
    if(detail.id==this.data.useData.mUserID){
      wx.showToast({
        title: "请勿选择自己！",
        icon: 'none',
        duration: 1000,
        complete: () => {
        }
      })
    }else{
      if (activeId!=detail.id) {
        tryqrarr_.push({
          "XDLM部门": detail.user_bm,
          "XDLM人员": detail.text,
          "XDLM人员ID": detail.id,
          "XDLM库内编号": SysConfig.ToolBox.getTimeAndRandom(),
          "XDLM关联编号": this.data.rowidData.onlynum,
          "XDLM是否已读": "否",
          "XDLM是否部门科室": "否"
        })
        activeId=detail.id
        tryqrarr_name=detail.text
      } else {
        tryqrarr_=[]
        activeId=null
      }
      this.setData({
        renyuanlist: tryqrarr_name,
        renyuanlistarr: tryqrarr_,
        activeId
      });
    }
  },
  showrenyuan_close(e) {
    this.setData({ showrenyuan: false })
  },
  //部门选择
  shbm_event() {
    this.setData({
      bm_show: true
    });
  },
  bm_confirm(e) {
    this.setData({
      bmlist: e.detail
    });
  },
  rytoggle(e){
    let tryqrarr_name = "";
    let tryqrarr_=[];
    if(e.currentTarget.dataset.ryid==this.data.useData.mUserID){
      wx.showToast({
        title: "请勿选择自己！",
        icon: 'none',
        duration: 1000,
        complete: () => {
        }
      })
    }else{
      let ryobj={
         "XDLM部门":e.currentTarget.dataset.bm,
          "XDLM人员":e.currentTarget.dataset.ry,
          "XDLM人员ID":e.currentTarget.dataset.ryid,
          "XDLM库内编号": SysConfig.ToolBox.getTimeAndRandom(),
          "XDLM关联编号": this.data.rowidData.onlynum,
          "XDLM是否已读": "否",
          "XDLM是否部门科室": "否"
      }
      tryqrarr_.push(ryobj)
      tryqrarr_name=e.currentTarget.dataset.ry
    } 
    this.setData({
      renyuanlist: tryqrarr_name,
      renyuanlistarr: tryqrarr_,
      ryradio:e.currentTarget.dataset.ryid
    });
    
  },
  toggle(event) {
    console.log(event)
    let bmryarr=this.data.bmry
    const {
      index,
      bm,
      ry,
      ryid
    } = event.currentTarget.dataset;
    const checkbox = this.selectComponent(`.checkboxes-${index}`);
    checkbox.toggle();
   
      for(let i in bmryarr){
          if(index==bmryarr[i].index){
            bmryarr.splice(i,1)
            console.log(bmryarr)
            this.setData({
              bmry:bmryarr
            })
            return
          }
      }
      bmryarr.push({
        index:index,
        "XDLM库内编号": SysConfig.ToolBox.getTimeAndRandom(),
        "XDLM关联编号": this.data.rowidData.onlynum,
        "XDLM部门": bm,
        "XDLM人员":ry,
        "XDLM人员ID": ryid,
        "XDLM是否已读": "否",
        "XDLM是否部门科室": "是"
      })
      this.setData({
        bmry:bmryarr
      })
    
  },
  bm_cancel() {
    this.setData({
      bm_show: false
    });
  },
  readremake(e){
    this.setData({
      readdata: e.detail.value
    })
  },
  readBtn(e){
    if(this.data.thradio=="thyes"){
      let that=this
        wx.showModal({
          title: '提示',
          content: '确定要退回上一步吗？',
          success(res) {
              if (res.confirm) {
                let gwcy_next_node_ry_name = "";
                let gwcy_next_node_ry_id = "";
                let gwcy_next_readnode_ry_id;
                let pl_addryarr = [];
                let gwcy_del_node_ry_id = "";
                let {rydataarr}=that.data
                if (rydataarr.length > 0) {
                  for (let i in rydataarr) {
                        if (rydataarr[i].是否已读 == "否" && that.data.useData.mUserID== rydataarr[i].人员ID) {
                            gwcy_del_node_ry_id = rydataarr[i].id
                            gwcy_next_readnode_ry_id = rydataarr[i - 1].id //上一步阅读人id
                            gwcy_next_node_ry_id = rydataarr[i - 1].人员ID //上一步阅读人useid
                            gwcy_next_node_ry_name = rydataarr[i - 1].人员 //上一步阅读人名字
                            break;
                        }
                    }
                    SysConfig.SubSystemData.request({
                      istoken: true,
                      XKLX: "SYBGGL",
                      XAction: "GetDataInterface",
                      data: {
                        "XDLMCID": "6000",
                        "XDLMSID": "DYBH202003171137313731161235",
                        "XDLMID": gwcy_next_readnode_ry_id,
                        "XDLM是否已读": "否",
                        "XDLM已读时间": "",
                        "XDLM备注": ""
                      },
                      method: "GET"
                    }).then((res)=>{
                      if (res.success) {
                        return SysConfig.SubSystemData.request({
                          istoken: true,
                          XKLX: "SYBGGL",
                          XAction: "GetDataInterface",
                          data: {
                            XDLMCID: "4000",
                            XDLMSID: "DYBH20200317113731373151234",
                            XDLMROWID: gwcy_del_node_ry_id
                          },
                          method: "GET"
                        })
                      }
                    }).then((res)=>{
                      if (res.success){
                        return SysConfig.SubSystemData.request({
                          istoken: true,
                          XKLX: "SYBGGL",
                          XAction: "GetDataInterface",
                          data: {
                            XDLMCID: "6000",
                            XDLMSID: "DYBH201908231020302030171325",
                            XDLMID: that.data.pageParams.rowid,
                            XDLMisComplete: "yes",
                          },
                          method: "GET"
                        })
                      }else{
                        wx.showToast({
                          title: "退回失败",
                          icon: 'none',
                          duration: 1000,
                          complete: () => {
                            wx.navigateBack({
                              delta: 1
                            });
                          }
                        })
                      } 
                    }).then((res)=>{
                      if (res.success) {
                        SysConfig.SubSystemData.request({
                          istoken: true,
                          XKLX: "SYBGGL",
                          XAction: "GetDataInterface",
                          data: {
                            XDLMCID: "9000",
                            XDLMTID:"9210",
                            XDLMSID: "9210001",
                            xmonlynum:that.data.rowidData.onlynum,
                            lconlynum: that.data.rowidData.xmlcid,
                            jdbh: "2",
                            senderID: that.data.useData.mUserID,
                            recipientID: gwcy_next_node_ry_id
                          },
                          method: "GET"
                        })
                        if(gwcy_next_node_ry_name){
                          wx.showToast({
                            title:"退回完成，退回给" +gwcy_next_node_ry_name,
                            icon: 'success',
                            duration: 1000,
                            complete: () => {
                              setTimeout(()=>{
                                wx.navigateBack({
                                  delta: 1
                                });
                              },1000)
                            }
                          })
                        }
                      } else {
                        wx.showToast({
                          title: "退回失败",
                          icon: 'none',
                          duration: 1000,
                          complete: () => {
                            wx.navigateBack({
                              delta: 1
                            });
                          }
                        })
                      } 
                    })

                }
              }
          }
      })
    }else{
      if(!this.data.qyread){
        if(this.data.shradio=="ry"){
          if(this.data.renyuanlist){
            this.setData({
              ["qyqk_data.qyqk_data_name"]:this.data.renyuanlistarr[0].XDLM人员,
              ["qyqk_data.qyqk_data_nameid"]:this.data.renyuanlistarr[0].XDLM人员ID
            })
          }else{
            wx.showToast({
              title: "请选择审核人！",
              icon: 'none',
              duration: 1000,
              complete: () => {
              }
            })
            return
          }
        }else{
          if(this.data.bmlist){
            let ry_name="";
            let ty_id="";
            const {bmry}=this.data
            for(let i=0;i<bmry.length;i++){
                  if(i==bmry.length-1){
                    ry_name+=bmry[i].XDLM部门
                    ty_id+=bmry[i].XDLM人员ID
                  }else{
                    ry_name+=bmry[i].XDLM部门+","
                    ty_id+=bmry[i].XDLM人员ID+","
                  }
                  delete bmry[i].index
              }
            this.setData({
              ["qyqk_data.qyqk_data_name"]:ry_name,
              ["qyqk_data.qyqk_data_nameid"]:ty_id,
              bmry
            })
          }else{
            wx.showToast({
              title: "请选择审核部门！",
              icon: 'none',
              duration: 1000,
              complete: () => {
              }
            })
            return
          }
      }
      }
      if(this.data.qyqk_data.qyqk_data_name){
        SysConfig.SubSystemData.request({
          istoken: true,
          XKLX: "SYBGGL",
          XAction: "GetDataInterface",
          data: {
            "XDLMCID":"5001",
            "XDLMSID":"DYBH2020031711390201378368",
            datalist: JSON.stringify({ "key":this.data.shradio=="ry"?this.data.renyuanlistarr:this.data.bmry})
          },
          method: "GET"
        })
        SysConfig.SubSystemData.request({
          istoken: true,
          XKLX: "SYBGGL",
          XAction: "GetDataInterface",
          data: {
            "XDLMCID":"9000",
            "XDLMTID":"9210",
            "XDLMSID":"9210001",
            "xmonlynum":this.data.rowidData.onlynum,
            "lconlynum":this.data.rowidData.xmlcid,
            "jdbh":"2",
            "senderID": this.data.useData.mUserID,
            "recipientID": this.data.qyqk_data.qyqk_data_nameid
          },
          method: "GET"
        })
      
      }
      SysConfig.SubSystemData.request({
        istoken: true,
        XKLX: "SYBGGL",
        XAction: "GetDataInterface",
        data: {
          "XDLMCID": "6000",
          "XDLMSID": "DYBH202003171137313731161235",
          "XDLMID": this.data.qyqk_data.readpeople_id,
          "XDLM是否已读": "是",
          "XDLM已读时间": SysConfig.ToolBox.CurrentDate() + " " + SysConfig.ToolBox.CurrentTime(),
          "XDLM备注": this.data.readdata ? this.data.readdata : "已读",
        },
        method: "GET"
      }).then((res)=>{
        if (res.success){
          return SysConfig.SubSystemData.request({
            istoken: true,
            XKLX: "SYBGGL",
            XAction: "GetDataInterface",
            data: {
              XDLMCID: "6000",
              XDLMSID: "DYBH201908231020302030171325",
              XDLMID: this.data.pageParams.rowid,
              XDLMisComplete: "yes",
            },
            method: "GET"
          })
        }else{
          wx.showToast({
            title: "签阅失败",
            icon: 'none',
            duration: 1000,
            complete: () => {
              wx.navigateBack({
                delta: 1
              });
            }
          })
        } 
      }).then((res)=>{
        if (res.success) {
          if(this.data.qyqk_data.qyqk_data_name){
            if(this.data.shradio=="bm"){
              SysConfig.SubSystemData.request({
                istoken: true,
                XKLX: "SYBGGL",
                XAction: "ExtFC",
                data: {
                  XDLMCID: "SendSMS",
                  UID: this.data.rowidData.creator_id,
                  theme:this.data.rowidData.title
                },
                method: "GET"
              })
            }
            wx.showToast({
              title: "已传阅给"+this.data.qyqk_data.qyqk_data_name,
              icon: 'success',
              duration: 1000,
              complete: () => {
                setTimeout(()=>{
                  wx.navigateBack({
                    delta: 1
                  });
                },1000)
              }
            })
          }else{
            SysConfig.SubSystemData.request({
              istoken: true,
              XKLX: "SYBGGL",
              XAction: "GetDataInterface",
              data: {
                XDLMCID: "1001",
                XDLMSID: "DYBH20200317113731373146231",
                XDLMA:this.data.rowidData.onlynum
              },
              method: "GET"
            }).then((res)=>{
              let shzttype=true;
              if(res.rows&&res.rows.length>0){
                  for(let i=0;i<res.rows.length;i++){
                      if(res.rows[i]['是否已读'] == "否"&&res.rows[i]['人员ID'] != this.data.useData.mUserID){
                        shzttype=false
                      }
                  }
              }
              if(shzttype){
                SysConfig.SubSystemData.request({
                  istoken: true,
                  XKLX: "SYBGGL",
                  XAction: "GetDataInterface",
                  data: {
                    XDLMCID: "6000",
                    XDLMSID: "DYBH202007101118581858193455",
                    XDLMID: this.data.pageParams.urlid,
                    XDLMshzt: "已完成",
                  },
                  method: "GET"
                })
              }
            
            })
            wx.showToast({
              title: "签阅成功",
              icon: 'success',
              duration: 1000,
              complete: () => {
                wx.navigateBack({
                  delta: 1
                });
              }
            })
          }
        } else {
          wx.showToast({
            title: "签阅失败",
            icon: 'none',
            duration: 1000,
            complete: () => {
              wx.navigateBack({
                delta: 1
              });
            }
          })
        } 
      })
    }
  }
})