// MRC
// common.js
// 2015-3-21 16:29:50
// global var and func
// ver 0.1

var startPos,           // 开始触摸点(X/Y坐标)
    endPos,             // 结束触摸点(X/Y坐标)
    stage,              // 用于标识 onStart/onMove/onEnd 流程的第几阶段，解决 onEnd 重复调用
    offset,             // 偏移距离
    direction = 'stay',			// 翻页方向

    curPage = 0, 			// page 当前页
    pageCount,          // page 数量
    pageWidth = document.documentElement.clientWidth,          // page 宽度
    pageHeight = document.documentElement.clientHeight,         // page 高度

    $pages = $('#container'),             // page 外部 wrapper
    $pageArr,           // page 列表
    $animateDom,		// 所有设置 [data-animate] 的动画元素

    options,            // 最终配置项

    touchDown = false,  // 手指已按下 (取消触摸移动时 transition 过渡)
    movePrevent = true; // 阻止滑动 (动画过程中手指按下不可阻止)
	




