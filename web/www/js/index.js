var page = {
    attr: {},
    view: {},
    event: {},
    model: {}
};

page.event.onPageLoad = function () {
    // 设置dispaly的minHeight
    //var minHeight = document.documentElement.clientHeight - document.getElementById('header').offsetHeight - document.getElementById('buttom').offsetHeight;
    var minHeight = document.documentElement.clientHeight - document.getElementById('buttom').offsetHeight - 16;
    if (minHeight < 0) {
        minHeight = 0;
    }
    document.getElementById('display').style.minHeight = minHeight + 'px';

    page.view.addPicture(10);
    page.view.initNav();
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
            for (var i in pictures) {
                var src = pictures[i].file;
                var img = document.createElement('img');
                img.setAttribute('src', src);
                display.appendChild(img);
            }
            page.attr['lastPictureId'] = pictures.pop().id;
        }
        else if (data.status == 1) {

        }
    });
};

page.view.initNav = function () {
    var nav = document.getElementById('navigateBar');
    nav.onmouseover = page.event.onMouseOverNav;
    nav.onmouseout = page.event.onMouseOutNav;


    for (var i in nav.childNodes) {
        var item = nav.childNodes[i];
        if (item.nodeType == 1) {
            item.onmouseover = page.event.onMouseOverNavItem;
            item.onmouseout = page.event.onMouseOutNavItem;

            var classVal = item.attributes['class'].value || item.attributes['class'].nodeValue;
            if (classVal == 'top') {
                item.onclick = page.event.onClickTop;
            }
            else if (classVal == 'next') {
                item.onclick = page.event.onClickNext;
            }

            console.log(nav.childNodes[i].nodeName);
        }
    }
};

page.event.onClickTop = function () {
    console.log('click top');
    window.scrollTo(0,0);
};

page.event.onClickNext = function () {
    console.log('click next');
    page.view.addPicture(8, page.attr['lastPictureId'] - 1);
};

page.event.onMouseOverNav = function () {
    console.log('nav over');
    //this.style.backgroundColor = 'black';
};

page.event.onMouseOutNav = function () {
    console.log('nav out');
    //this.style.backgroundColor = 'gray';
};

page.event.onMouseOverNavItem = function () {
    console.log('nav item over');
    this.style.backgroundColor = 'gray';
};

page.event.onMouseOutNavItem = function () {
    console.log('nav item out');
    this.style.backgroundColor = '';
};

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
};

window.onload = function () {
    page.event.onPageLoad();
};