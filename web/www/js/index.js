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

page.event.onPageLoad = function () {
    // 设置dispaly的minHeight
    //var minHeight = document.documentElement.clientHeight - document.getElementById('header').offsetHeight - document.getElementById('buttom').offsetHeight;
    var minHeight = document.documentElement.clientHeight - document.getElementById('buttom').offsetHeight;
    if (minHeight < 0) {
        minHeight = 0;
    }
    document.getElementById('display').style.minHeight = minHeight + 'px';

    page.view.addPicture(10);
    
    window.onscroll = page.event.onNearEnd;
};

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
                var src = pictures[i].file;
                var img = document.createElement('img');
                img.onload = page.event.onPictureLoad;
                img.setAttribute('src', src);
                display.appendChild(img);
            }
            page.attr.lastPictureId = pictures.pop().id;
            page.attr.picListOneLoad = true;
        } else if (data.status == 1) {
            page.attr.picEnd = true;
        }
    });
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

page.event.onPictureLoad = function () {
    page.attr.picLoadStatus--;
    console.log('page.attr.picLoadStatus ' + page.attr.picLoadStatus);
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