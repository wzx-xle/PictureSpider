var page = {
    attr: {},
    view: {},
    event: {},
    model: {}
};

page.event.onPageLoad = function () {
    // 设置dispaly的minHeight
    //var minHeight = document.documentElement.clientHeight - document.getElementById('header').offsetHeight - document.getElementById('buttom').offsetHeight;
    var minHeight = document.documentElement.clientHeight - document.getElementById('buttom').offsetHeight;
    if (minHeight < 0) {
        minHeight = 0;
    }
    document.getElementById('display').style.minHeight = minHeight + 'px';

    page.view.addPicture();
};

page.view.addPicture = function (limit, startId) {
    var url = '/controller/getPictures?limit=';
    if (limit) {
        url += 'limit=' + limit;
    }
    if (startId) {
        url += '&startId=' + startId;
    }

    page.model.getJSON(url, function (data) {
        if (data.status == 0) {
            var pictures = data.pictures;
            var display = document.getElementById('display');
            for (var i in pictures) {
                var src = pictures[i].file;
                var img = document.createElement('img');
                img.setAttribute('src', src);
                display.appendChild(img);
            }
            page.attr['lastPictureId'] = pictures.pop().id;
        }
    });
}

page.event.onClickTop = function () {

}

page.event.onClickNext = function () {

}

page.event.onMouseOverNav = function () {

}

page.model.getJSON = function (url, succ, fail) {
    var ajax = null;
    if (window.XMLHttpRequest) {
        ajax = new XMLHttpRequest();
    }
    else {
        ajax = new ActiveXObject('Microsoft.XMLHTTP');
    }

    ajax.open('GET', url, true);
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
            if (ajax.status == 200) {
                succ(JSON.parse(ajax.responseText));
            }
            else {
                if (faild) {
                    faild(ajax.status);
                }
            }
        }
    };
    ajax.send();
}

window.onload = function () {
    page.event.onPageLoad();
};