var page = {
    attr: {},
    view: {},
    event: {},
    model: {}
};

// 滚动条的位置大于该比例
page.attr.autoLoadRatio = 0.9;
// 是否已经没有图片了
page.attr.picEnd = false;
page.attr.lastPictureId = 1;
// 本次异步加载的图片的加载状态，0表示全部加载完成
page.attr.picLoadStatus = 0;
// 同一段时间只能加载一次列表
page.attr.picListOneLoad = true;
// 上下文菜单出现的时候，滚动条位置
page.attr.scrollTopForContextMenu = 0;
// 上下文菜单出现的元素对象
page.attr.clickedImg = null;

// 上下文菜单项
page.attr.ContextMenuItems = [
    {
        name: '赞一个',
        func: function (e) {
            var img = page.attr.clickedImg;
            console.log(img.getAttribute('name') + ' - land');

            // TODO

            // 发起请求，成功后执行下面步骤
            var title = img.getAttribute('title');
            var land = title.split('，')[0];
            title = title.replace(land, (parseInt(land) + 1) + '赞');
            img.title = title;
        }
    },
    {
        name: '踩一脚',
        func: function (e) {
            var img = page.attr.clickedImg;
            console.log(img.getAttribute('name') + ' - tread');

            // TODO

            // 发起请求，成功后执行下面步骤
            var title = img.getAttribute('title');
            var tread = title.split('，')[1].split(' ')[0];
            title = title.replace(tread, (parseInt(tread) + 1) + '踩');
            img.title = title;
        }
    },
    {
        name: '删掉吧',
        func: function (e) {
            var img = page.attr.clickedImg;
            console.log(img.getAttribute('name') + ' - delPic');

            if (confirm('请再次确认要删除该图片！')) {
                // TODO

                // 发起请求，成功后执行下面步骤
                util.delEle(img);
                page.attr.clickedImg = null;
            }
        }
    },
    {
        name: '到原帖',
        func: function (e) {
            var img = page.attr.clickedImg;
            console.log(img.getAttribute('name') + ' - toTopic');

            // TODO

            // 发起请求，成功后执行下面步骤
            var newUrl = '#';
            window.location = newUrl;
        }
    },
    {
        name: '单独看',
        func: function (e) {
            var img = page.attr.clickedImg;
            console.log(img.getAttribute('name') + ' - newTab');
            
            var newUrl = img.getAttribute('src');
            window.location = newUrl;
        }
    },
];

// 初始化上下文菜单
page.view.initContextMenu = function () {
    var contextMenu = document.getElementById('contextMenu');
    var menuItems = page.attr.ContextMenuItems;
    for (var i in menuItems) {
        contextMenu.appendChild(page.view.createMenuItem(menuItems[i].name, menuItems[i].func));
    }
}

// 取消上下文菜单
page.view.cleanContextMenu = function () {
    document.getElementById('contextMenu').style.display = 'none';
}

// 创建菜单项
page.view.createMenuItem = function (displayName, func) {
    var menuItem = document.createElement('li');
    menuItem.setAttribute('class', 'menuItem');
    menuItem.onclick = function (e) {
        func(e, this);
        page.view.cleanContextMenu();
    };

    var a = document.createElement('a');
    a.setAttribute('href', '#');
    a.onclick = function () {
        return false;
    };
    a.innerHTML = displayName;
    menuItem.appendChild(a);

    return menuItem;
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
    img.oncontextmenu = page.event.onRightClick;

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

    window.onscroll = function (e) {
        page.event.onNearEnd(e);
        page.event.onScrollChange(e);
    };
    document.body.onclick = page.view.cleanContextMenu;
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

page.event.onRightClick = function (e) {
    page.attr.clickedImg = this;
    var contextMenu = document.getElementById('contextMenu');
    contextMenu.style.left = (5 + e.x) + 'px';
    contextMenu.style.top = (2 + e.y) + 'px';
    contextMenu.style.display = 'block';

    // 记录滚动条的位置
    page.attr.scrollTopForContextMenu = document.body.scrollTop;

    return false;
};

page.event.onPictureLoad = function () {
    page.attr.picLoadStatus--;
};

page.event.onScrollChange = function () {
    var scrollTop = document.body.scrollTop;

    if (Math.abs(page.attr.scrollTopForContextMenu - scrollTop) > 10) {
        page.view.cleanContextMenu();
    }

}

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