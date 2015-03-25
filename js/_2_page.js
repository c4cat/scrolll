// MRC
// page.js
// 2015-3-21 16:29:50
// for backbone page model and view
// ver 0.1

var Page = Backbone.Model.extend({
	defaults:function(){
        var demo = "456";

        return{
            startPos:0,
            endPos:0,
            stage:0,
            VHDirection:'',
            direction:'stay',
    		width:pageWidth,
    		height:pageHeight,
            touchDown:false,
            movePrevent:false,
            isCurrent:false,
            test:'123',
            demo:demo,
        }
	}
});

var Pages = Backbone.Collection.extend({
	model:Page,
	url:'./json/page.json',
    next:function(cur){

    },
    prev:function(cur){
    	return pages.length;
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
        this.demo = 'demo';
        // this.listenTo(this.model,'change:startPos',this.test);
        // this.listenTo(this.model,'change:endPos',this.test);
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

        this.direction = this.model.get('direction') ? this.model.get('direction') : options.direction;
        this.direction === 'horizontal' ? this.model.set('startPos',e.pageX) : this.model.set('startPos',e.pageY);

        this.model.set('touchDown',true);

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
            this.$el.addClass('drag');
        }

        this.model.set('stage',1);
    },
    onMove:function(ee){
        var e = ee.changedTouches[0];

        if(movePrevent === true || this.model.get('touchDown') === false){
            event.preventDefault();
            return false;
        }
        event.preventDefault();

        this.direction === 'horizontal' ? this.model.set('endPos',e.pageX) : this.model.set('endPos',e.pageY);
        this.addDirecClass();    // 添加方向类

        if (options.drag && !this.isHeadOrTail()) { // 拖拽时调用
            this.dragToMove();
        }
        this.model.set('stage',2);
    },
    onEnd:function(ee){
        var e = ee.changedTouches[0];

        if (movePrevent === true || this.model.get('stage') !== 2){
            // event.preventDefault();
            // return false;
        } else {
            this.model.set('touchDown',false);
            this.direction === 'horizontal' ? this.model.set('endPos',e.pageX) : this.model.set('endPos',e.pageY);

            _startPos = this.model.get('startPos');
            _endPos = this.model.get('endPos');

            this.curPage = pages.indexOf(this);
            // if (options.swipeAnim === 'default' && !this.isHeadOrTail()) {
            //     $container.removeClass('drag');

            //     if (Math.abs(_endPos-_startPos) <= 50) {
            //         this.animatePage(this.curPage);
            //         direction = 'stay';
            //     }
            //     else if (_endPos >= _startPos) {
            //         this.animatePage(this.curPage-1);
            //         direction = 'backward';
            //     }
            //     else if (_endPos < _startPos) {
            //         this.animatePage(this.curPage+1);
            //         direction = 'forward';
            //     }
            // }
            // else
            if (options.swipeAnim === 'cover' && !this.isHeadOrTail()){

                if (Math.abs(_endPos-_startPos) <= 50 && _endPos >= _startPos && options.drag) {
                    this.animatePage(this.curPage, 'keep-backward');
                    this.model.set('direction','stay');
                }
                else if (Math.abs(_endPos-_startPos) <= 50 && _endPos < _startPos && options.drag) {
                    this.animatePage(this.curPage, 'keep-forward');
                    this.model.set('direction','stay');
                }
                else if (Math.abs(_endPos-_startPos) > 50 && _endPos >= _startPos && options.drag) {
                    this.animatePage(this.curPage-1, 'backward');
                    this.model.set('direction','backward');
                }
                else if (Math.abs(_endPos-_startPos) > 50 && _endPos < _startPos && options.drag) {
                    this.animatePage(this.nextPage(), 'forward')
                    this.model.set('direction','forward');
                }
                else if (Math.abs(_endPos-_startPos) > 50 && _endPos >= _startPos && !options.drag) {
                    this.animatePage(this.curPage-1, 'backward');
                    this.model.set('direction','backward');
                }
                else if (Math.abs(_endPos-_startPos) > 50 && _endPos < _startPos && !options.drag) {
                    this.animatePage(this.nextPage(), 'forward')
                    this.model.set('direction','forward');
                }
            }
            // dot
            // if (options.indicator) {
   //              $($('.parallax-h-indicator ul li, .parallax-v-indicator ul li').removeClass('current').get(this.curPage)).addClass('current');
   //          }
            this.model.set('stage',3);
        }
    },
    dragToMove:function() {
        var endPos = this.model.get('endPos'),
            startPos = this.model.get('startPos');

        if (options.swipeAnim === 'default') {
            var temp = offset + endPos - startPos;
            this.direction === 'horizontal' ?
                $container.css("-webkit-transform", "matrix(1, 0, 0, 1, " + temp + ", 0)") :
                $container.css("-webkit-transform", "matrix(1, 0, 0, 1, 0, " + temp + ")");
        }
        else if (options.swipeAnim === 'cover') {
            var temp = endPos - startPos;
            var view,cssVal;

            //need to correct
            $('.page').css({'z-index': 0});

            if (this.direction === 'horizontal' && endPos >= startPos) {
                view = 'prevPage';
                cssVal = {
                    'z-index': 2,
                    'display': 'block',
                    '-webkit-transform': 'translateX('+(temp-pageWidth) +'px)'
                };
            }
            else if (this.direction === 'horizontal' && endPos < startPos) {
                view = 'nextPage';
                cssVal = {
                    'z-index': 2,
                    'display': 'block',
                    '-webkit-transform': 'translateX('+(pageWidth+temp) +'px)'
                };
            }
            else if (this.direction === 'vertical' && endPos >= startPos) {
                view = 'prevPage';
                cssVal = {
                    'z-index': 2,
                    'display': 'block',
                    '-webkit-transform': 'translateY('+ (temp-pageHeight) +'px)'
                };
            }
            else if (this.direction === 'vertical' && endPos < startPos) {
                view = 'nextPage';
                cssVal = {
                    'z-index': 2,
                    'display': 'block',
                    '-webkit-transform': 'translateY('+ (pageHeight+temp) +'px)'
                };
            }
            this.setCss(view,cssVal)
        }
    },
    setCss:function(view,cssVal){
        var dom = this.getDom(view);
        $(dom).css(cssVal).addClass("heyJude");
    },
    setTheClass:function(view,className) {
        var dom = this.getDom(view);
        $(dom).addClass(className);
    },
    removeTheClass:function(view,className) {
        var dom = this.getDom(view);
        $(dom).addClass(className);
    },
    getDom:function(view){
        var dom;
        if(view === "nextPage"){
            dom = this.nextPage();
        }else if(view === "prevPage"){
            dom = this.prevPage();
        }else{
            dom = $(this.$el[0])
        }
        return dom;
    },
    nextPage:function(){
        return $(this.$el[0].nextElementSibling);
    },
    prevPage:function(){
        return $(this.$el[0].prevElementSibling);
    },
    animatePage:function(newPage, action) {

        var view,cssVal,className;
        // if (options.swipeAnim === 'default') {

        //     var newOffset = 0;
        //     this.direction === 'horizontal' ?
        //         newOffset = newPage * (-pageWidth) :
        //         newOffset = newPage * (-pageHeight);

        //     this.direction === 'horizontal' ?
        //         $container.css({'-webkit-transform': 'matrix(1, 0, 0, 1, ' + newOffset + ', 0)'}) :
        //         $container.css({'-webkit-transform': 'matrix(1, 0, 0, 1, 0, ' + newOffset + ')'});

        // }
        // else 
        if (options.swipeAnim === 'cover') {
            if (action === 'keep-backward' && options.drag) {
                $('.page').removeClass('drag');

                this.direction === 'horizontal' ?
                cssVal = {'-webkit-transform': 'translateX(-100%)'} :
                cssVal = {'-webkit-transform': 'translateY(-100%)'};
                view = 'prevPage';
            }
            else if (action === 'keep-forward' && options.drag) {
                $('.page').removeClass('drag');

                this.direction === 'horizontal' ?
                cssVal = {'-webkit-transform': 'translateX(100%)'} :
                cssVal = {'-webkit-transform': 'translateY(100%)'};
                view = 'nextPage';
            }
            else if (action === 'forward' && options.drag) {
                $('.page').removeClass('drag');
                
                this.setTheClass('prevPage','back'); // 纯粹为了在动画结束后隐藏，不涉及 CSS 中定义的动画
                cssVal = {'-webkit-transform': 'translate(0,0)'};
                view = 'curPage';
            }
            else if (action === 'backward' && options.drag) {
                $('.page').removeClass('drag');

                this.setTheClass('nextPage','back');
                cssVal = {'-webkit-transform': 'translate(0,0)'};
                view = 'curPage';
            }
            else if (action === 'forward' && !options.drag) {
                $container.addClass('animate');

                this.setTheClass('nextPage','back');
                className = 'front';
                cssVal = {'display': 'block'};
                view = 'curPage';
            }
            else if (action === 'backward' && !options.drag) {
                $container.addClass('animate');

                this.setTheClass('nextPage','back');
                className = 'front';
                cssVal = {'display': 'block'};
                view = 'curPage';
            }
            this.setCss(view,cssVal);
            this.setTheClass(className);

        }

        movePrevent = true;         // 动画过程中不可移动
        setTimeout(function() {
            movePrevent = false;
        }, 300);
    },
    addDirecClass:function(){
        if(this.direction === 'horizontal'){
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

        if (this.direction === 'horizontal') {
            if ((endPos >= startPos && this.curPage === 0) ||
                (endPos <= startPos && this.curPage === pageCount-1)) {
                return true;
            }
        } else if ((endPos >= startPos && this.curPage === 0) ||
                (endPos <= startPos && this.curPage === pageCount-1)) {
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
    
                $($('.page').removeClass('current').get(this.curPage)).addClass('current');
                //options.onchange(this.curPage, $pageArr[this.curPage], direction);  // 执行回调函数
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
                
                if (this.direction === 'horizontal' && direction === 'forward') {
                    $animation = 'followSlideToLeft';
                }
                else if (this.direction === 'horizontal' && direction === 'backward') {
                    $animation = 'followSlideToRight';
                }
                else if (this.direction === 'vertical' && direction === 'forward') {
                    $animation = 'followSlideToTop';
                }
                else if (this.direction === 'vertical' && direction === 'backward') {
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
    },
    test:function(){
        console.log('this is a test function!');
    }
});

