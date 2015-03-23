// MRC
// common.js
// 2015-3-21 16:29:50
// global var and func
// ver 0.1

var startPos,
    endPos,
    stage,              // 用于标识 onStart/onMove/onEnd 流程的第几阶段，解决 onEnd 重复调用
    offset,             // 偏移距离
    direction = 'stay',			// 翻页方向

    curPage = 0, 			// page 当前页
    pageCount,          // page 数量
    pageWidth = document.documentElement.clientWidth,          // page 宽度
    pageHeight = document.documentElement.clientHeight,         // page 高度

    $container = $('#container'),             // page 外部 wrapper
    $pageArr,           // page 列表
    $animateDom,		// 所有设置 [data-animate] 的动画元素
    
    movePrevent = false,
    touchDown = false;





// MRC
// options.js
// 2015-03-22 00:18:18
// the default options
// ver 0.1

var options = {
	direction: 'vertical', // the default direction
	swipeAnim: 'cover',   // 滚动动画，"default/cover"
	arrow: false,			// 箭头
	loading: false,        	// loading
    indicator: false,       		//
    drag : true,
    onchange : function(){}
}
// MRC
// page.js
// 2015-3-21 16:29:50
// for backbone page model and view
// ver 0.1

var Page = Backbone.Model.extend({
	defaults:function(){
        return{
            startPos:'',
            endPos:'',
            VHDirection:'',
            direction:'stay',
    		width:pageWidth,
    		height:pageHeight,
            touchDown:false,
            movePrevent:false,
            test:'123'
        }
	}
});

var Pages = Backbone.Collection.extend({
	model:Page,
	url:'./json/page.json',
    next:function(){

    },
    prev:function(){

    },
    goto:function (argument) {

    },
    comparator: 'id'

});

var pages = new Pages();

var PageView = Backbone.View.extend({
    template: _.template($("#page-template").html()),
    events:{
        'touchstart':'onStart',
        'touchmove':'onMove',
        'touchend':'onEnd',
        'webkitAnimationEnd':'afterAnimate',
        'webkitTransitionEnd':'afterAnimate'
    },
    initialize:function() {
        // console.log(this.model.get('test'));

    },
    render:function(){
    	// this.$el.html(this.template(this.model.toJSON())); //replace because we don't need the tag swap
        this.setElement(this.template(this.model.toJSON()));
        return this;
    },
    onStart:function(ee){
        if (movePrevent === true) {
            event.preventDefault();
            return false;
        }
        var e = ee.changedTouches[0];

        options.direction === 'horizontal' ? startPos = e.pageX : startPos = e.pageY;
        //startPos.x = e.pageX;
        //startPos.y = e.pageY;

        touchDown = true;

        // if (options.swipeAnim === 'default') {
        //     $container.addClass('drag');    // 阻止过渡效果

        //     offset = $container.css("-webkit-transform")
        //                 .replace("matrix(", "")
        //                 .replace(")", "")
        //                 .split(",");

        //     options.direction === 'horizontal' ?
        //         offset = parseInt(offset[4]) :
        //         offset = parseInt(offset[5]);
        // }

        if ((options.swipeAnim === 'cover' && options.drag)) {
            $pageArr.addClass('drag');
        }

        stage = 1;
        console.log(stage);
    },
    onMove:function(ee){
        var e = ee.changedTouches[0];

        if(movePrevent === true || touchDown === false){
            event.preventDefault();
            return false;
        }
        event.preventDefault();
        options.direction === 'horizontal' ? endPos = e.pageX : endPos = e.pageY;
        // endPos.x = e.pageX;
        // endPos.y = e.pageY;

        this.addDirecClass();    // 添加方向类

        if (options.drag && !this.isHeadOrTail()) { // 拖拽时调用
            this.dragToMove();
        }
        stage = 2;
    },
    onEnd:function(ee){
        var e = ee.changedTouches[0];

        if (movePrevent === true || stage !== 2){
            // event.preventDefault();
            // return false;
        } else {
            touchDown = false;
            options.direction === 'horizontal' ? endPos = e.pageX : endPos = e.pageY;

            // endPos.x = e.pageX;
            // endPos.y = e.pageY;

            if (options.swipeAnim === 'default' && !this.isHeadOrTail()) {
                $container.removeClass('drag');

                if (Math.abs(endPos-startPos) <= 50) {
                    this.animatePage(curPage);
                    direction = 'stay';
                }
                else if (endPos >= startPos) {
                    this.animatePage(curPage-1);
                    direction = 'backward';
                }
                else if (endPos < startPos) {
                    this.animatePage(curPage+1);
                    direction = 'forward';
                }
            }
            else if (options.swipeAnim === 'cover' && !this.isHeadOrTail()){

                if (Math.abs(endPos-startPos) <= 50 && endPos >= startPos && options.drag) {
                    this.animatePage(curPage, 'keep-backward');
                    direction = 'stay';
                }
                else if (Math.abs(endPos-startPos) <= 50 && endPos < startPos && options.drag) {
                    this.animatePage(curPage, 'keep-forward');
                    direction = 'stay';
                }
                else if (Math.abs(endPos-startPos) > 50 && endPos >= startPos && options.drag) {
                    this.animatePage(curPage-1, 'backward');
                    direction = 'backward';
                }
                else if (Math.abs(endPos-startPos) > 50 && endPos < startPos && options.drag) {
                    this.animatePage(curPage+1, 'forward')
                    direction = 'forward';
                }
                else if (Math.abs(endPos-startPos) > 50 && endPos >= startPos && !options.drag) {
                    this.animatePage(curPage-1, 'backward');
                    direction = 'backward';
                }
                else if (Math.abs(endPos-startPos) > 50 && endPos < startPos && !options.drag) {
                    this.animatePage(curPage+1, 'forward')
                    direction = 'forward';
                }
            }
            // dot
            // if (options.indicator) {
   //              $($('.parallax-h-indicator ul li, .parallax-v-indicator ul li').removeClass('current').get(curPage)).addClass('current');
   //          }
            stage = 3;
        }
        
    },
    dragToMove:function() {
        if (options.swipeAnim === 'default') {
            var temp = offset + endPos - startPos;
            options.direction === 'horizontal' ?
                $container.css("-webkit-transform", "matrix(1, 0, 0, 1, " + temp + ", 0)") :
                $container.css("-webkit-transform", "matrix(1, 0, 0, 1, 0, " + temp + ")");
        }
        else if (options.swipeAnim === 'cover') {
            var temp      =  endPos - startPos,
                $prevPage = $($pageArr[curPage-1]),
                $nextPage = $($pageArr[curPage+1]);

            $($pageArr).css({'z-index': 0});

            if (options.direction === 'horizontal' && endPos >= startPos) {
                $prevPage.css({
                    'z-index': 2,
                    'display': 'block',
                    '-webkit-transform': 'translateX('+(temp-pageWidth) +'px)'
                })
            }
            else if (options.direction === 'horizontal' && endPos < startPos) {
                $nextPage.css({
                    'z-index': 2,
                    'display': 'block',
                    '-webkit-transform': 'translateX('+(pageWidth+temp) +'px)'
                })
            }
            else if (options.direction === 'vertical' && endPos >= startPos) {
                $prevPage.css({
                    'z-index': 2,
                    'display': 'block',
                    '-webkit-transform': 'translateY('+ (temp-pageHeight) +'px)'
                })
            }
            else if (options.direction === 'vertical' && endPos < startPos) {
                $nextPage.css({
                    'z-index': 2,
                    'display': 'block',
                    '-webkit-transform': 'translateY('+ (pageHeight+temp) +'px)'
                })
            }
        }
    },
    animatePage:function(newPage, action) {
        curPage = newPage;
        if (options.swipeAnim === 'default') {

            var newOffset = 0;
            options.direction === 'horizontal' ?
                newOffset = newPage * (-pageWidth) :
                newOffset = newPage * (-pageHeight);

            options.direction === 'horizontal' ?
                $container.css({'-webkit-transform': 'matrix(1, 0, 0, 1, ' + newOffset + ', 0)'}) :
                $container.css({'-webkit-transform': 'matrix(1, 0, 0, 1, 0, ' + newOffset + ')'});

        }
        else if (options.swipeAnim === 'cover') {
            if (action === 'keep-backward' && options.drag) {
                $pageArr.removeClass('drag');
                options.direction === 'horizontal' ?
                $($pageArr[curPage-1]).css({'-webkit-transform': 'translateX(-100%)'}) :
                $($pageArr[curPage-1]).css({'-webkit-transform': 'translateY(-100%)'})
            }
            else if (action === 'keep-forward' && options.drag) {
                $pageArr.removeClass('drag');
                options.direction === 'horizontal' ?
                $($pageArr[curPage+1]).css({'-webkit-transform': 'translateX(100%)'}) :
                $($pageArr[curPage+1]).css({'-webkit-transform': 'translateY(100%)'})
            }
            else if (action === 'forward' && options.drag) {
                $pageArr.removeClass('drag');
                $($pageArr[curPage-1]).addClass('back'); // 纯粹为了在动画结束后隐藏，不涉及 CSS 中定义的动画
                $pageArr[curPage].style.webkitTransform = 'translate(0, 0)';
            }
            else if (action === 'backward' && options.drag) {
                $pageArr.removeClass('drag');
                $($pageArr[curPage+1]).addClass('back');
                $pageArr[curPage].style.webkitTransform = 'translate(0, 0)';
            }
            else if (action === 'forward' && !options.drag) {
                $container.addClass('animate');
                $($pageArr[curPage-1]).addClass('back');
                $($pageArr[curPage]).addClass('front').show();
            }
            else if (action === 'backward' && !options.drag) {
                $container.addClass('animate');
                $($pageArr[curPage+1]).addClass('back');
                $($pageArr[curPage]).addClass('front').show();
            }

        }

        movePrevent = true;         // 动画过程中不可移动
        setTimeout(function() {
            movePrevent = false;
        }, 300);
    },
    addDirecClass:function(){
        if(options.direction === 'horizontal'){
            if (endPos >= startPos) {
                $container.removeClass('forward').addClass('backward');
            } else if (endPos < startPos) {
                $container.removeClass('backward').addClass('forward');
            }
        } else {
            if (endPos >= startPos) {
                $container.removeClass('forward').addClass('backward');
            } else if (endPos < startPos) {
                $container.removeClass('backward').addClass('forward');
            }
        }
    },
    isHeadOrTail:function(){
    	var pageCount = pages.length;

        if (options.direction === 'horizontal') {
            if ((endPos >= startPos && curPage === 0) ||
                (endPos <= startPos && curPage === pageCount-1)) {
                return true;
            }
        } else if ((endPos >= startPos && curPage === 0) ||
                (endPos <= startPos && curPage === pageCount-1)) {
            return true;
        }
        return false;
    },
    h_or_v:function(){
        var offsetX = Math.abs(endPos.x-startPos.x),
            offsetY = Math.abs(endPos.y-endPos.y);

        //this.target = "";
            
    },
    afterAnimate:function(){
        if (direction !== 'stay') {
                setTimeout(function() {
                    $(".back").hide().removeClass("back");
                    $(".front").show().removeClass("front");
                    $container.removeClass('forward backward animate');
                }, 10);
    
                $($pageArr.removeClass('current').get(curPage)).addClass('current');
                options.onchange(curPage, $pageArr[curPage], direction);  // 执行回调函数
                //this.animShow();
        }
    },  
    animShow:function(){
        
        $animateDom.css({
            '-webkit-animation': 'none',
            'display': 'none'   // 解决部分 Android 机型 DOM 不自动重绘的 bug
            });

        
        $('.current [data-animation]').each(function(index, element){
            var $element    = $(element),
                $animation  = $element.attr('data-animation'),
                $duration   = $element.attr('data-duration') || 500,
                $timfunc    = $element.attr('data-timing-function') || 'ease',
                $delay      = $element.attr('data-delay') ?  $element.attr('data-delay') : 0;


            if ($animation === 'followSlide') {
                
                if (options.direction === 'horizontal' && direction === 'forward') {
                    $animation = 'followSlideToLeft';
                }
                else if (options.direction === 'horizontal' && direction === 'backward') {
                    $animation = 'followSlideToRight';
                }
                else if (options.direction === 'vertical' && direction === 'forward') {
                    $animation = 'followSlideToTop';
                }
                else if (options.direction === 'vertical' && direction === 'backward') {
                    $animation = 'followSlideToBottom';
                }
                
            }

            $element.css({
//              '-webkit-animation': $animation +' '+ $duration + 'ms ' + $timfunc + ' '+ $delay + 'ms both',
                
                'display': 'block',
                
                // 为了兼容不支持贝塞尔曲线的动画，需要拆开写
                // 严格模式下不允许出现两个同名属性，所以不得已去掉 'use strict'
                '-webkit-animation-name': $animation,
                '-webkit-animation-duration': $duration + 'ms',
                '-webkit-animation-timing-function': 'ease',
                '-webkit-animation-timing-function': $timfunc,
                '-webkit-animation-delay': $delay + 'ms',
                '-webkit-animation-fill-mode': 'both'
            })
        });
    }
});

var AppView = Backbone.View.extend({
	el:"#container",
	initialize:function(){
		var t = this;	
		
		pages.fetch({
			success:function(req,res){
				req.each(function(obj){
					// t.render(obj.toJSON());
                    t.add(obj);
				});
                t.init();
			},
			error:function(err){
				console.log("Get Page JSON Error!!!");
			}
		});
	},
    init:function(){
        $container.addClass(options.direction).addClass(options.swipeAnim);
        $pageArr = $container.find('.page');

        options.direction === 'horizontal' ?     // 设置 wrapper 宽高
            $container.css('width', pageWidth * pages.length) :
            $container.css('height', pageHeight * pages.length);


        if (options.swipeAnim === 'cover') {    // 重置 page 的宽高(因为这两个效果与 default 实现方式截然不同)
            $container.css({
                'width': pageWidth,
                'height': pageHeight
            });
            $pageArr[0].style.display = 'block'; // 不能通过 css 来定义，不然在 Android 和 iOS 下会有 bug
        }

        if (options.loading) {
            // $('.wrapper').append('<div class="parallax-loading"><i class="ui-loading ui-loading-white"></i></div>');
        } else {
            // 允许触摸滑动
            movePrevent = false;
        }
    },
	render:function(){
		
	},
    add:function(page){
        var view = new PageView({model:page});
        $(this.el).append(view.render().el);
    },
	test:function(){
		alert('this is a test');
	}
});

var app = new AppView();


