// MRC
// AppView.js
// 2015-3-21 16:29:50
// for backbone page model and view
// ver 0.1

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
        // this.listenTo(pages, 'change', this.test);
        
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
