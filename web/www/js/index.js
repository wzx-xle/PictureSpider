var page = {
    attr: {},
    view: {},
    event: {}
};

page.event.onPageLoad = function () {
    // 设置dispaly的minHeight
    var minHeight = document.documentElement.clientHeight - document.getElementById('header').offsetHeight - document.getElementById('buttom').offsetHeight;
    if (minHeight < 0) {
        minHeight = 0;
    }
    document.getElementById('display').style.minHeight = minHeight + 'px';
}

window.onload = function () {
    page.event.onPageLoad();
}