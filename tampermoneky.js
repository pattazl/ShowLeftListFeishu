// ==UserScript==
// @name         ShowLeftListFeishu
// @namespace    https://www.feishu.cn/
// @version      0.7
// @description  展示飞书文件列表
// @author       AustinYoung
// @match        https://prd.fs.huaqin.com/*
// @icon         https://www.feishu.cn/favicon.ico
// @require      https://unpkg.com/dayjs@1.11.2/dayjs.min.js
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==
////require      https://cdn.bootcdn.net/ajax/libs/axios/0.21.1/axios.min.js
let searchCount = 0;
let currentToken = '';
let preHttp = 'https://internal-api-space.fs.huaqin.com/space/api/explorer/'; // 可根据实际地址修改
// obj_type 无法获取 ，只能分析判断为4种
let typeList = {
    file: 12,
    mindnotes: 11,
    sheets: 3,
    docs: 2,
    folder:0
}

// 根据 typeList 反向获得
let strTypeList ={} 
for(let t in typeList)
{
    strTypeList[ typeList[t]] = t;
}
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
        url = preHttp+'share/folder/newlist/?hidden=0&asc=1&rank=5'
    } else if (token == 'myDoc') {
        url = preHttp+'folder/children/?type=0&asc=1&rank=5'
    } else {
        url = preHttp+'folder/children/?asc=1&rank=5&token=' + token + '&show_no_perm=1' // mydoc
    }
    return await getRequest(url)
}
async function getPath() {
    let arr = location.pathname.split('/');
    let pathToken = arr.pop();
    let pathType = arr.pop();
    console.log(pathToken, pathType)
    if (pathToken.length != 27) {
        myFloatHint.innerHTML = '路径中token长度不是27'; 
        console.log('pathToken len[' + pathToken.length + '] not 27')
        return '';
    }
    let typeCode = typeList[pathType]
    if (typeCode == null) {
        myFloatHint.innerHTML = '<span style="color:red">当前格式[' + pathType + ']不在列表中，请联系开发</span>'
        return;
    }
    let url = preHttp+`obj/paths/?obj_token=${pathToken}&obj_type=${typeCode}`
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
}
function showList() {
    let flag = myControl.style.display == 'none';
    if (flag) {
        myControl.style.display = 'block';
        myselfFloat.style.width = '360px'
        myselfFloat.style.backgroundColor = 'grey';
        // 显示当前页面的路径
        openFolder()
    } else {
        myControl.style.display = 'none';
        myselfFloat.style.width = '25px'
        myselfFloat.style.backgroundColor = ''
        myFloatSelect.style.display='none';
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
    <div style="padding:2px;width:25px;position:fixed;top:40px;left:2px;z-index:99999" id="myselfFloat">
    <div style="cursor:pointer;color:white" id="myFloatBar">📑<span id="myFloatHint"></span><select style="display:none" id="myFloatSelect"></select></div>
    <div style="display:none;height:600px;background-color:rgb(245, 246, 247);color:black;overflow-x: auto; overflow-y: auto;" id="myControl">
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
    document.body.append(oNode);
    GM_addStyle(cssStr)
    // 绑定统一事件
    myDoc.type = 0;
    myDoc.onclick = (e) => {
        ajaxGetPath(e.srcElement)
    }
    shareDoc.type = 0;
    shareDoc.onclick = (e) => {
        ajaxGetPath(e.srcElement)
    }
    // 显示下拉菜单
    myFloatSelect.onclick= (e) => {
        try{
            let arr = JSON.parse(myFloatSelect.value)
            openFolderCore(arr)
        }catch(e){}
        e.cancelBubble= true // 禁止传递消息
    }
    // 绑定按钮
    myFloatBar.onclick = () => {
        showList();
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
        childSpan.title='折叠'
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

        let strType = strTypeList[n.type]
        let strCtime = n.create_time
        let strMtime = n.edit_time
        if(dayjs)
        {
            strCtime = dayjs(strCtime*1000).format('YY-MM-DD HH:mm:ss')
            strMtime = dayjs(strMtime*1000).format('YY-MM-DD HH:mm:ss')
        }
        oNode.title=`类型:${strType},创建时间:${strCtime},修改时间:${strMtime}`;
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

async function openFolder() {
    let data = await getPath()
    if (data.data == null || data.data.paths == null) {
        return
    }
    let nodes = data.data.entities?.nodes;
    let arrPath = data.data.paths;
    if(arrPath.length ==0)
    {
        myFloatHint.innerHTML = '该文件未属于任何文件夹！';
        return
    }else if(arrPath.length>1)
    {
        myFloatSelect.style.display='inline';
        myFloatSelect.options.length=0; // 清空
        myFloatSelect.options.add(new Option('属于多个文件夹,请选择',''))
        for(let arr of arrPath)
        {
            console.log(arr)
            if(nodes==null || arr.length<3)
            {
                myFloatHint.innerHTML = 'nodes信息获取失败';
                break;
            }
            let v = arr[arr.length-2];
            let p = new Option(nodes[v].name,JSON.stringify(arr));
            myFloatSelect.options.add(p)
        }
        return;
    }
    // 一个文件夹时自动选择,取第一个
    await openFolderCore(arrPath[0]);
}
async function openFolderCore(arrOri)
{
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
    // 滚动显出出来,距离上方空90px
    myControl.scrollTo(
        {
            top: document.getElementById(currentToken).offsetTop -200,
            behavior: "smooth"
        }
    )
}