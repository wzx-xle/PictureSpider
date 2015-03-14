var util = {};

window.util;

/**
 * 删除元素
 * @param {Element Object} ele 元素对象
 */
util.delEle = function (ele) {
    ele.parentElement.removeChild(ele);
}