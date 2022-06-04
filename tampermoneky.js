// ==UserScript==
// @name         ShowLeftListFeishu
// @namespace    https://www.feishu.cn/
// @version      0.1
// @description  展示飞书文件列表
// @author       AustinYoung
// @match        https://prd.fs.huaqin.com/*
// @icon         https://www.feishu.cn/favicon.ico
// @grant        unsafeWindow
// @license      MIT
// ==/UserScript==
////require      https://cdn.bootcdn.net/ajax/libs/axios/0.21.1/axios.min.js
let searchCount = 0;
let currentToken = '';
(function () {
    'use strict';
    // 添加悬浮框
    console.log('添加悬浮框')
    addFloat()
})();
function addFloat() {
    searchCount++;
    console.log('查找文件目录:' + searchCount)
    let searchNote = document.querySelector(".note-title__info")
    if (searchNote == null) {
        console.log('没有找到文件目录')
        if (searchCount < 20) {
            setTimeout(addFloat, 1000);
        }
        return;
    }
    addList()
}
async function getSub(token) {
    let url = '';
    if (token == 'shareDoc') {
        url = 'https://internal-api-space.fs.huaqin.com/space/api/explorer/share/folder/newlist/?hidden=0&asc=1&rank=5'
    } else if (token == 'myDoc') {
        url = 'https://internal-api-space.fs.huaqin.com/space/api/explorer/folder/children/?type=0&asc=1&rank=5'
    } else {
        url = 'https://internal-api-space.fs.huaqin.com/space/api/explorer/folder/children/?asc=1&rank=5&token=' + token + '&show_no_perm=1' // mydoc
    }
    //url = 'https://internal-api-space.fs.huaqin.com/space/api/explorer/folder/children/?asc=1&rank=5&token=fldhqpdAFM1JqAtdowGUsZ1XLzd&show_no_perm=1' // share

    return await getRequest(url)
}
unsafeWindow.getPath = async function () {
    let arr = location.href.split('/');
    let pathToken = arr.pop();
    let pathType = arr.pop();
    console.log(pathToken, pathType)
    if (pathToken.length != 27) {
        console.log('pathToken len[' + pathToken.length + '] not 27')
        return '';
    }
    // obj_type 无法获取 ，只能分析判断为4种
    let typeList = {
        file: 12,
        mindnotes: 11,
        sheets: 3,
        docs: 2,
    }
    let typeCode = typeList[pathType]
    if (typeCode == null) {
        myFloatHint.innerHTML = '<span style="color:red">当前格式[' + pathType + ']不在列表中，请联系开发</span>'
        return;
    }
    // https://internal-api-space.fs.huaqin.com/space/api/explorer/obj/paths/?obj_token=shthqFNSAwoahCkFxKrAkDQOSqb&obj_type=2
    let url = `https://internal-api-space.fs.huaqin.com/space/api/explorer/obj/paths/?obj_token=${pathToken}&obj_type=${typeCode}`
    return await getRequest(url)
}

// 包含校验算法的提交
function getRequest(url) {
    let arr = document.cookie.split(';')
    let token = '';
    for (let v of arr) {
        let arr2 = v.split("=");
        let k = arr2[0].trim();
        let v1 = arr2[1].trim();
        if (k == '_csrf_token') {
            token = v1
            break;
        }
    }
    return new Promise((resolve, reject) => {
        $.ajax({
            url, method: 'get', headers: {
                "X-CSRFToken": token,
            }, xhrFields: {
                withCredentials: true //允许跨域带 Cookie
            }, success: function (result) {
                resolve(result)
            }, error: function (xhr, status, error) { console.error('error'); reject(error) }
        });
    });


    /*
    return axios.get("https://internal-api-space.fs.huaqin.com/space/api/explorer/obj/paths/?obj_token="+currToken+"&obj_type=2", {
     headers: {
        "X-CSRFToken":token,
     },
     withCredentials: true //允许跨域带 Cookie
   })
      $.get( "https://internal-api-space.fs.huaqin.com/space/api/explorer/folder/children/?type=0&asc=1&rank=5",function(data){
         console.log(data)
     })
       GM_xmlhttpRequest({ // @grant        GM_xmlhttpRequest
         url:"https://internal-api-space.fs.huaqin.com/space/api/explorer/folder/children/?type=0&asc=1&rank=5",
         method :"GET",
         //data:"fid=1037793830&act=1&re_src=11&jsonp=jsonp&csrf=e37f1881fd98f16756d16ab71109d37a",
         headers: {
             "Content-type": "application/json; charset=utf-8"
         },
         onload:function(xhr){
             console.log(xhr.responseText);
         }
     });*/
}
unsafeWindow.showList = function () {
    let flag = myControl.style.display == 'none';
    if (flag) {
        myControl.style.display = 'block';
        myselfFloat.style.width = '360px'
        myselfFloat.style.backgroundColor = 'grey';

        // 显示当前页面的路径
        setTimeout(function () { openFolder() }, 1000);

    } else {
        myControl.style.display = 'none';
        myselfFloat.style.width = '25px'
        myselfFloat.style.backgroundColor = ''
        // opacity: 1.0;
    }
}
// 主入口，初始化浮动框，样式等等
function addList() {
    var cssStr = `.level {
      cursor: pointer;
      margin-left: 10px;
    }
    .level:hover {
      border-color: blue;
      border-style: none none none dotted;
    }
    `
    var strControlHTML = `
    <div style="padding:2px;width:360px;position:fixed;top:40px;left:2px;z-index:99999" id="myselfFloat">
    <div style="cursor:pointer;color:white"
      onclick="showList()">📑<span id="myFloatHint"></span></div>
    <div style="display:none;height:600px;background-color:rgb(245, 246, 247);color:black;overflow-x: auto; overflow-y: austo;" id="myControl">
      <div class="level" id="myDoc"> <span class="spark-icon" style="width: 20px; height: 20px;"><svg width="20"
            height="20" viewBox="0 0 20 20" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M14.49 6.85c.9 0 1.77.27 2.51.79V3a2 2 0 00-2-2H3a2 2 0 00-2 2v14a2 2 0 002 2h4.94a1.87 1.87 0 01-.08-.54c0-2.1 1.43-3.77 3.39-4.49a4.22 4.22 0 01-1.1-2.85 4.3 4.3 0 014.34-4.27zM4.22 4.22A.75.75 0 014.75 4h7.5a.75.75 0 110 1.5h-7.5a.75.75 0 01-.53-1.28zm0 4A.75.75 0 014.75 8h3.5a.75.75 0 010 1.5h-3.5a.75.75 0 01-.53-1.28zm9.15 5.67a2.96 2.96 0 100-5.5 2.95 2.95 0 000 5.5zm-3.52 5.2h9.35a.55.55 0 00.55-.55c0-2.11-2-3.54-4.13-3.54h-2.18c-2.13 0-4.14 1.43-4.14 3.54a.55.55 0 00.55.55z"
              fill="currentColor"></path>
          </svg></span>
        我的文档
      </div>
      <div class="level" id="shareDoc"><span class="spark-icon" style="width: 20px; height: 20px;"><svg width="20"
            height="20" viewBox="0 0 20 20" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M10 5.25a3 3 0 11-6 0 3 3 0 016 0zM14.5 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm.58 5.75a2.5 2.5 0 00.14-1.57c-.2-.9-.49-1.7-.83-2.43h.14c3.45 0 5.27 1.19 5.46 3.57a.4.4 0 01-.4.43h-4.5zm-8.03-7c3.57 0 5.8 1.92 6.71 5.77a1 1 0 01-.97 1.23H1.22a1 1 0 01-.97-1.24c.97-3.84 3.23-5.76 6.8-5.76z"
              fill="currentColor"></path>
          </svg></span>
        共享文档
      </div>
    </div>
  </div>
  `;
    var oNode = document.createElement('div');
    oNode.innerHTML = strControlHTML;
    var oStyle = document.createElement('style');
    oStyle.innerHTML = cssStr;
    document.body.append(oNode);
    document.body.append(oStyle);

    // 绑定统一事件
    myDoc.type = 0;
    myDoc.onclick = (e) => {
        ajaxGetPath(e.srcElement)
    }
    shareDoc.type = 0;
    shareDoc.onclick = (e) => {
        ajaxGetPath(e.srcElement)
    }
}

async function ajaxGetPath(obj, alwaysOpen) {
    const folderSVG = '▷'  //➕▶
    const folderSVGBlue = '▼' // ➖
    const folderOpenNew = '🗔'
    let newwin = false;
    console.log(obj)
    if (obj == null) return;
    let selectStr = document.getSelection().toString()
    if (selectStr.length > 0) {
        myFloatHint.innerHTML = '请取消选择后点击';
        return;
    }
    myFloatHint.innerHTML = '';
    if (obj.tagName != 'DIV') {
        if (obj.tagName == 'SPAN') {
            newwin = (obj.hasAttribute('newwin'))
            obj = obj.parentNode;
        } else {
            console.error('object error');
            return;
        }
    }
    // 新窗口中打开
    if (newwin) {
        window.open(obj.url, '_blank')
        return;
    }
    // 非文件夹
    if (obj.type != 0) {
        // 需要本地打开
        location.href = obj.url;
        return
    }
    // 需要展开
    let childDiv = obj.querySelectorAll(':scope>div');
    let childSpan = obj.querySelector('span');
    if (childDiv.length > 0) {
        if (alwaysOpen) {
            // 已经展开，直接成功
            return;
        }
        for (let arrV of childDiv) {
            try {
                obj.removeChild(arrV)
            } catch (e) {
                console.log(e)
            }
        }
        console.log(obj.id)
        if (childSpan != null && obj.id.length > 10) //  不是根节点
        {
            childSpan.innerHTML = folderSVG
        }
        return
    }

    if (childSpan != null && obj.id.length > 10) {
        childSpan.innerHTML = folderSVGBlue
    }
    let data;
    data = await getSub(obj.id);

    for (let arrV of data.data.node_list) {
        let n = data.data.entities.nodes[arrV]
        var oNode = document.createElement('div');
        oNode.className = 'level'
        oNode.id = arrV;
        oNode.url = n.url;
        oNode.type = n.type;
        if (n.type == 0) {
            oNode.innerHTML = `<span title='展开'>${folderSVG}</span><span newwin title='新窗口中打开'>${folderOpenNew}</span>${n.name} `;
        } else {
            oNode.innerHTML = `<span newwin title='新窗口中打开'>📄</span>${n.name}`;
        }
        if (arrV == currentToken) {
            // 当前文件
            oNode.style.color = 'blue';
        }
        obj.appendChild(oNode)
    }
}
unsafeWindow.openFolder = async function () {
    let data = await getPath()
    if (data.data == null || data.data.paths == null) {
        return
    }
    let arrOri = data.data.paths[0];
    let arr = [];
    if (arrOri[0] == 'share-folders') {
        arr.push('shareDoc')
    } else {
        arr.push('myDoc')
    }
    arrOri.shift();// 去掉首
    currentToken = arrOri.pop(); // 去掉尾
    arr = arr.concat(arrOri)
    console.log(arr)
    for (let v of arr) {
        await ajaxGetPath(document.getElementById(v), true)
    }
}

