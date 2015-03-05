var page = {
    attr: {},
    view: {},
    event: {},
    model: {}
};

page.attr.autoLoadRatio = 0.9;
// 是否已经没有图片了
page.attr.picEnd = false;
page.attr.lastPictureId = 1;
// 本次异步加载的图片的加载状态，0表示全部加载完成
page.attr.picLoadStatus = 0;
// 同一段时间只能加载一次列表
page.attr.picListOneLoad = true;

// 初始化上下文菜单
page.view.initContextMenu = function () {
    var contextMenu = document.getElementById('contextMenu');
    var menuItems = contextMenu.children;
    for (var i in menuItems) {
        menuItems[i].onclick = page.event.onMenuClick;
    }
}

page.view.addPicture = function (limit, startId) {
    var url = '/controller/getPictures?limit=';
    if (limit) {
        url += limit;
    }
    if (startId || startId == 0) {
        url += '&startId=' + startId;
    }

    page.model.getJSON(url, function (data) {
        if (data.status == 0) {
            var pictures = data.pictures;
            var display = document.getElementById('display');
            page.attr.picLoadStatus = pictures.length;
            for (var i in pictures) {
                display.appendChild(page.view.createImage(pictures[i]));
            }
            page.attr.lastPictureId = pictures.pop().id;
            page.attr.picListOneLoad = true;
        } else if (data.status == 1) {
            page.attr.picEnd = true;
        }
    });
};

page.view.createImage = function (pic) {
    var src = pic.file;
    var img = document.createElement('img');
    // 设置事件
    img.onload = page.event.onPictureLoad;
    img.onerror = page.event.onPictureLoad;
    img.onclick = page.event.onImgClick;
    // 设置属性
    img.setAttribute('src', src);
    var title = pic.laud + '赞，' + pic.tread + '踩';
    img.setAttribute('title', title);
    img.setAttribute('name', pic.id);
    
    return img;
}

page.event.onPageLoad = function () {
    // 设置dispaly的minHeight
    //var minHeight = document.documentElement.clientHeight - document.getElementById('header').offsetHeight - document.getElementById('buttom').offsetHeight;
    var minHeight = document.documentElement.clientHeight - document.getElementById('buttom').offsetHeight;
    if (minHeight < 0) {
        minHeight = 0;
    }
    document.getElementById('display').style.minHeight = minHeight + 'px';

    page.view.initContextMenu();
    
    page.view.addPicture(10);

    window.onscroll = page.event.onNearEnd;
};

page.event.onNearEnd = function () {
    var top = document.body.scrollTop;
    var height = document.body.offsetHeight - window.innerHeight;
    // 同一时刻只能加载一次列表
    if (!page.attr.picListOneLoad) {
        return;
    }

    // 满足大于指定的比例，还有图片可以加载，上次图片已经加载完成
    if (top / height > page.attr.autoLoadRatio && !page.attr.picEnd && !page.attr.picLoadStatus) {
        page.attr.picListOneLoad = false;
        page.view.addPicture(10, page.attr.lastPictureId - 1);
    }
};

page.event.onImgClick = function (e) {
    page.attr.clickedImg = this;
    var contextMenu = document.getElementById('contextMenu');
    contextMenu.style.left = (5 + e.x) + 'px';
    contextMenu.style.top = (2 + e.y) + 'px';
    contextMenu.style.display = 'block';
};

page.event.onMenuClick = function (e) {
    alert(this.getAttribute('do') + '-' + page.attr.clickedImg.getAttribute('name'));
    
}

page.event.onPictureLoad = function () {
    page.attr.picLoadStatus--;
    console.log('page.attr.picLoadStatus ' + page.attr.picLoadStatus);
};

page.model.getJSON = function (url, succ, fail) {
    var ajax = null;
    if (window.XMLHttpRequest) {
        ajax = new XMLHttpRequest();
    } else {
        ajax = new ActiveXObject('Microsoft.XMLHTTP');
    }

    ajax.open('GET', url, true);
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
            if (ajax.status == 200) {
                succ(JSON.parse(ajax.responseText));
            } else {
                if (faild) {
                    faild(ajax.status);
                }
            }
        }
    };
    ajax.send();
};

window.onload = function () {
    page.event.onPageLoad();
};