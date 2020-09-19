
var SysConfig = require("../../utils/util.js")
Page({
  data: {
    lzyj_data: [], //流转意见
    useData: { //用户数据
      mUserID: null,
      mUserName:""
    },
    pageParams: {}, //页面参数
    rowidData: {}, //单行数据
    current: 1,
    steps: [],//所有步骤
    active: 0,//	当前步骤
    activeNames: [],
    zbcontent:[],
    zbbtcontent:[],
    zbDataIndex:0,
    details:[],//详情
    zbbtdetails:[],//表头
    project_search: "", //报表人员搜索
  },
  onLoad: function (options) {
    this.setData({
      pageParams: {
        urlid: options.id,
      }
    })
    SysConfig.UserInfo.GetUserID().then((res) => {
      this.setData({
        useData: {
          mUserID: res.data
        }
      })
      return SysConfig.SubSystemData.request({ // 获取主表单行数据
        istoken: true,
        XKLX: "SYRSGL",
        XAction: "GetDataInterface",
        data: {
          "XDLMCID": "1001",
          "XDLMSID": "DYBH202003111014331433210382",
          "XDLMA": this.data.pageParams.urlid,
        },
        method: "GET"
      })
    }).then((res) => {
      if (res.rows) {
        SysConfig.WorkflowManage.getXMInfo(res) //流程函数初始化
        this.setData({
          rowidData: {
            title: res.rows[0].统计月份.split("-")[0] + "年" + res.rows[0].统计月份.split("-")[1] + "月差旅费报销单",
            creator: res.rows[0].制表人,
            time: res.rows[0].制表时间,
            onlynum:res.rows[0].onlynum
          },
          active: res.rows[0].currentLCxh-1
        })
        return SysConfig.WorkflowManage.getWorkflowInfoAndList() // 获取流转意见
      }
    }).then((res) => {
      this.setData({
        lzyj_data: res
      })
      return SysConfig.SubSystemData.request({
        istoken: true,
        XKLX: "SYRSGL",
        XAction: "GetDataInterface",
        data: {
          "XDLMCID": "9000",
          "XDLMTID": "9202",
          "XDLMSID": "9202019",
          "method": "details",
          "projectid":this.data.rowidData.onlynum
        },
        method: "GET"
      })
    }).then((res)=>{
          let details=res.rows
          SysConfig.SubSystemData.request({
            istoken: true,
            XKLX: "SYRSGL",
            XAction: "GetDataInterface",
            data: {
              "XDLMCID": "9000",
              "XDLMTID": "9202",
              "XDLMSID": "9202019",
              "method": "detailsHead",
              "projectid":this.data.rowidData.onlynum
            },
            method: "GET"
          }).then((res)=>{
            console.log(details)
            console.log(res)
            let rowsarr=[]
            // let btarr=[]
            res.data.forEach((item,index,array)=>{
              if(item.group){
                let ispush=true
                for(let i=0;i<rowsarr.length;i++){
                    if(rowsarr[i].group==item.group){
                      ispush=false
                      rowsarr[i].childer.push({
                        title:item.title,
                        content:details[0][item.field]
                      })
                    }
                }
                if(ispush){
                  rowsarr.push({
                    group:item.group,
                    childer:[{
                      title:item.title,
                      content:details[0][item.field]
                    }]
                  })
                }
              }else{
                rowsarr.push({
                  title:item.title,
                  content:details[0][item.field]
                })
              }
            })

            this.setData({
              zbcontent:rowsarr,
              // zbbtcontent:btarr,
              details:details,
              zbbtdetails:res.data
            })
            console.log(rowsarr)
            // console.log(btarr)
          })
    })

  },
  onChange(event) {
    this.setData({
      activeNames: event.detail,
    });
  },
  previous_btn(){//上一个
    let {zbDataIndex}=this.data
    zbDataIndex--
    this.zbcontentdata(zbDataIndex)
    this.setData({
      zbDataIndex
    })
  },
  next_btn(){//下一个
    let {zbDataIndex}=this.data
    zbDataIndex++
    this.zbcontentdata(zbDataIndex)
    this.setData({
      zbDataIndex
    })
  },
  zbcontentdata(zbDataIndex){//制表内容
    let {details,zbbtdetails}=this.data
    let rowsarr=[]
    // let btarr=[]
    zbbtdetails.forEach((item,index,array)=>{
      if(item.group){
        let ispush=true
        for(let i=0;i<rowsarr.length;i++){
            if(rowsarr[i].group==item.group){
              ispush=false
              rowsarr[i].childer.push({
                title:item.title,
                content:details[zbDataIndex][item.field]
              })
            }
        }
        if(ispush){
          rowsarr.push({
            group:item.group,
            childer:[{
              title:item.title,
              content:details[zbDataIndex][item.field]
            }]
          })
        }
      }else{
        rowsarr.push({
          title:item.title,
          content:details[zbDataIndex][item.field]
        })
      }
    })
    this.setData({
      zbcontent:rowsarr,
      // zbbtcontent:btarr
    })
  },
  project_search_Change(e) {
    SysConfig.SubSystemData.request({
      istoken: true,
      XKLX: "SYBGGL",
      XAction: "GetDataInterface",
      data: {
        "XDLMCID": "1001",
        "XDLMSID": "DYBH201908231020302030114331",
        "QueryKey": e.detail,
        "QueryType": "模糊查询"
      },
      method: "GET"
    }).then((res) => {
      let allbook = []
    
      if (res.rows && res.rows.length > 0) {
        for (let i = 0; i < res.rows.length; i++) {
          allbook.push({
            book_name: res.rows[i].name,
            book_publisher: res.rows[i].publisher,
            book_price: res.rows[i].price,
            book_storeNum: parseInt(res.rows[i].sum) - parseInt(res.rows[i].virtualNum) > 0 ? parseInt(res.rows[i].sum) - parseInt(res.rows[i].virtualNum) : 0,
            book_bh: res.rows[i].onlynum,
            book_num: 1,
            book_onlynum: this.data.onlynum, //主表唯一编号 
          })
        }
        this.setData({
          project_search: e.detail,
          tg_fx_arr: allbook
        })
      } else {
        this.setData({
          tg_fx_arr: []
        })
      }
    })
  },
})