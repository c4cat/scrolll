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
	url:'page.json'
});

var PageView = Backbone.View.extend({
	el:"#container",
	model:Page,
	template: _.template($("#page-template").html()),
	// template: _.template($("#dragbox-template").html()),
	initialize:function(){
		var t = this;	
			t.pages = new Pages();
		pages.fetch({
			success:function(col,arr){
				t.create();
			},
			error:function(){
				console.log("Get Page JSON Error!!!");
			}
		})
	},
	render:function(){
		container.append(this.$el.html(this.template(this.model.toJSON())))
	},
	create:function(){
		this.pages.each(function(obj){

		});
	}
});


