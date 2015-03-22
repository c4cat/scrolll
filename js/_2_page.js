// MRC
// page.js
// 2015-3-21 16:29:50
// for backbone page model and view
// ver 0.1

var Page = Backbone.Model.extend({
	defaults:{
		width:pageWidth,
		height:pageHeight,
	}
});

var Pages = Backbone.Collection.extend({
	model:Page,
	url:'./json/page.json'
});

var PageView = Backbone.View.extend({
	el:"#container",
	model:Page,
	template: _.template($("#page-template").html()),
	// template: _.template("   <div></div> "),
	initialize:function(){
		var t = this;	
			t.pages = new Pages(),

		t.pages.fetch({
			success:function(req,res){
				req.each(function(obj){
					t.render(obj.toJSON());
				});
			},
			error:function(err){
				console.log("Get Page JSON Error!!!");
			}
		});

		$pages.addClass(options.direction).addClass(options.swipeAnim);
		
		if (options.loading) {
			// $('.wrapper').append('<div class="parallax-loading"><i class="ui-loading ui-loading-white"></i></div>');
        } else {
        	// 允许触摸滑动
            movePrevent = false;
        }
	},
	events:{
		'touchstart':'onStart',
		'touchmove':'onMove',
		'touchend':'onEnd',
		'webkitAnimationEnd':'',
		'webkitTransitionEnd':'afterAnimate'
	},
	render:function(obj){
		$(this.el).append(this.template(obj));
	},
	onStart:function(ee){
        if (movePrevent === true) {
            event.preventDefault();
            return false;
        }
       	var e = ee.changedTouches[0];
		this.target = $(e.target);
		options.direction = this.target.attr("data-direction");
        options.direction === 'horizontal' ? startPos = e.pageX : startPos = e.pageY;
        touchDown = true;
        $pageArr = $('.page');
        pageCount = $pageArr.length;

        if (options.swipeAnim === 'default') {
            $pages.addClass('drag');    // 阻止过渡效果

            offset = $pages.css("-webkit-transform")
                        .replace("matrix(", "")
                        .replace(")", "")
                        .split(",");

            options.direction === 'horizontal' ?
                offset = parseInt(offset[4]) :
                offset = parseInt(offset[5]);
        }
        if ((options.swipeAnim === 'cover' && options.drag)) {
            $pageArr.addClass('drag');
        }

        stage = 1;
        console.log(1);
	},
	onMove:function(ee){
		var e = ee.changedTouches[0];

        if(movePrevent === true || touchDown === false){
            event.preventDefault();
            return false;
        }
        event.preventDefault();
        options.direction === 'horizontal' ? endPos = e.pageX : endPos = e.pageY;

        this.addDirecClass();    // 添加方向类

        if (options.drag && !this.isHeadOrTail()) { // 拖拽时调用
            this.dragToMove();
        }
        stage = 2;
        console.log(2);
    },
    onEnd:function(ee){
		var e = ee.changedTouches[0];

        if (movePrevent === true || stage !== 2){
            // event.preventDefault();
            // return false;
        } else {
            touchDown = false;
            options.direction === 'horizontal' ? endPos = e.pageX : endPos = e.pageY;

            if (options.swipeAnim === 'default' && !this.isHeadOrTail()) {
                $pages.removeClass('drag');

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
                $pages.css("-webkit-transform", "matrix(1, 0, 0, 1, " + temp + ", 0)") :
                $pages.css("-webkit-transform", "matrix(1, 0, 0, 1, 0, " + temp + ")");
        }
        else if (options.swipeAnim === 'cover') {
            var temp      =  endPos - startPos,
                $prevPage = $($pageArr[curPage-1]),
                $nextPage = $($pageArr[curPage+1]);

            $($pageArr).css({'z-index': 0});

            console.log($nextPage);

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
                $pages.css({'-webkit-transform': 'matrix(1, 0, 0, 1, ' + newOffset + ', 0)'}) :
                $pages.css({'-webkit-transform': 'matrix(1, 0, 0, 1, 0, ' + newOffset + ')'});

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
                $pages.addClass('animate');
                $($pageArr[curPage-1]).addClass('back');
                $($pageArr[curPage]).addClass('front').show();
            }
            else if (action === 'backward' && !options.drag) {
                $pages.addClass('animate');
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
                $pages.removeClass('forward').addClass('backward');
            } else if (endPos < startPos) {
                $pages.removeClass('backward').addClass('forward');
            }
        } else {
            if (endPos >= startPos) {
                $pages.removeClass('forward').addClass('backward');
            } else if (endPos < startPos) {
                $pages.removeClass('backward').addClass('forward');
            }
        }
    },
    isHeadOrTail:function(){
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
    afterAnimate:function(){
    	if (direction !== 'stay') {
				setTimeout(function() {
	                $(".back").hide().removeClass("back");
	                $(".front").show().removeClass("front");
	                $pages.removeClass('forward backward animate');
	            }, 10);
	
	            $($pageArr.removeClass('current').get(curPage)).addClass('current');
	            options.onchange(curPage, $pageArr[curPage], direction);  // 执行回调函数
	            animShow();
		}
    },	
	test:function(){
		alert('this is a test');
	}
});

var app = new PageView();


