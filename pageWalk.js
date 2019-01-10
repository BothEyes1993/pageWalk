(function($,win){
	function UserGuideWalkComp(){
		this._index = 0;
		this.$blackOverEl = $('<div id="userGuideBlackGroudId" class="userGuide-BlackGroud-Class" ></div>');//黑幕背景
		this.$walkContentEl = $('<div id="walkContentId"  class="userGuide-walkContent-Class" ></div>');//引导内容外层DIV(高亮DIV+引导内容DIV)
		this.$guideContentEl = $('<div id="guideContentId"></div>');//引导内容DIV
		this.$guideInnerWrapper = $("<div />", {id: "guideInnerWrapper", style: "width:350px"});
		this.config = {
			_element:"body",
			steps : [{}],
			name : "",
			buttons : {
				closeUserGuideBtnId :{
					 i18n:"关闭" ,
					 css : "close-UserGuideBtn-Class",
					 showCheck : function(){
						return 1===1;
					}
				},
				nextUserGuide: {
					i18n:"下一步 &rarr;",
					css : "all-UserGuideBtn-Class next-class",
					showCheck : function(){
						return !this.isLastStep();
					}
				},
				previousUserGuide:{
					i18n:"&larr; 上一步",
					css : "all-UserGuideBtn-Class prev-class",
					showCheck : function(){
						return !this.isfirstStep();
					}
				},
				finishUserGuide:{
					i18n:"结束 &#10004;",
					css : "all-UserGuideBtn-Class next-class",
					showCheck : function(){
						return this.isLastStep();
					}
				}
			}
		};
	}

	UserGuideWalkComp.prototype={
		init : function(param){
			$.extend(this.config,param);
			if(!param){
				return;
			}
			//构造黑幕
			this.$blackOverEl.appendTo(this.config._element).show();
			//关闭按钮
			this.showButton("closeUserGuideBtnId",this.config._element);
			//引导页
	        this.showStep();
	        //绑定事件
	        this.buttonEvn();
		},
		//显示按钮
		showButton : function(id,appendTo){
			if($("#"+id).length){
				return
			}
			var btn = this.config.buttons[id],
				appendTo = appendTo || "";
			;
			if(!btn)return;

			if(typeof btn.showCheck === "function" && !btn.showCheck.apply(this)){
				return
			}

			$(appendTo).append($('<a />',{id : id , class:btn.css, html:btn.i18n}));
		},

		//引导页
		showStep : function(){
			//清除之前容器
			if($("#walkContentId").length){
				this.$walkContentEl.html("").remove();
			}
			//获取index对应的引导内容
			var step = this.config.steps[this._index],
				targetEL = step.wrapper,
				userGuidePopup = step.popup;

			if(userGuidePopup && userGuidePopup.type === "modal"){
				//显示黑幕
				this.$blackOverEl.show();
				//第一张引导页
				var guideInnerEl = $('<div class="guideInner"></div>').html(getContent(step));
				var guideWay = $('<div class="bottom-way-class"></div>');
				this.$guideContentEl.addClass("userguid-modal-class");
				this.$guideContentEl.html("").append(this.$guideInnerWrapper.html("").append(guideInnerEl)).append(guideWay);
				$(this.config._element).append(this.$walkContentEl.append(this.$guideContentEl));
			}else{
				if(targetEL === "" || typeof targetEL === "undefined"){
					return;
				}
				//构造高亮DIV
				$("<div>").addClass("highLightDiv").height($(targetEL).outerHeight()).width($(targetEL).outerWidth()).css({
					top:$(targetEL).offset().top-20,
					left:$(targetEL).offset().left-20
				}).append($("<div>").css({
					 position: "absolute",
	                top: 0,
	                bottom: 0,
	                left: 0,
	                right: 0
				})).appendTo(this.$walkContentEl);
				$(this.config._element).append(this.$walkContentEl);
				//隐藏黑幕
				this.$blackOverEl.hide();
				//构造指示语
				this.showTooltip();
			}
			this.showButton("previousUserGuide","#guideInnerWrapper");
       	 	this.showButton("nextUserGuide","#guideInnerWrapper");
        	this.showButton("finishUserGuide","#guideInnerWrapper");
		},

		//绑定事件
		buttonEvn : function(){
			var _this = this;

			$(document).on("click", "#closeUserGuideBtnId,#finishUserGuide", function() {
	           _this.closeUserGuideFun();
        	});

			$(document).on("click", "#nextUserGuide", function() {
	            _this.nextFun();
        	});

        	$(document).on("click", "#previousUserGuide", function() {
	            _this.previousFun();
        	});

		},

		isLastStep : function(){
			return this._index === this.config.steps.length-1;
		},

		isfirstStep : function(){
			return this._index === 0;
		},

		closeUserGuideFun : function(){
			this._index = 0;
			//消除黑幕
			this.$blackOverEl.fadeOut("slow",function(){
				$(this).remove();
			});
			//消除提示
			this.$walkContentEl.fadeOut("slow",function(){
				$(this).remove();
			});
			//消除关闭按钮
			$("#closeUserGuideBtnId").fadeOut("slow",function(){
				$(this).remove();
			});
		},

		nextFun : function(){
			if(this.isLastStep()) return;
			this._index++;
			this.showStep();
		},

		previousFun : function(){
			if(this.isfirstStep()) return;
			this._index--;
			this.showStep();
		},

		showTooltip : function(){
			//获取index对应的引导内容
			var step = this.config.steps[this._index],
				highLightDivEl = $("#walkContentId .highLightDiv");
			//高亮DIV位置
			var highLightDivWidth = highLightDivEl.outerWidth(),
				highLightDivHight = highLightDivEl.outerHeight(),
				highLightDivLeft = highLightDivEl.offset().left,
				highLightDivTop = highLightDivEl.offset().top,
				topStr,leftStr;

			//构造提示DIV
			this.$guideContentEl.removeClass("userguid-modal-class").addClass("userguid-inner-class");
			this.$guideContentEl.html("").append($('<div class="guideInner"></div>')).wrapInner(
			this.$guideInnerWrapper.html("")).appendTo(this.$walkContentEl);
			//添加提示内容
			this.$guideContentEl.find(".guideInner").append(getContent(step))
			//添加方向箭头图标
			var icn = $('<span class="' + step.popup.position + '">&nbsp;</span>');
			this.$guideContentEl.append(icn);
			//挑战提示框位置
			switch(step.popup.position){
				case "top" :
						topStr = highLightDivTop+highLightDivHight+icn.outerHeight();
						leftStr = highLightDivLeft+highLightDivWidth/2-this.$guideContentEl.width() / 2;
					break;
				case "left" : 
						topStr = highLightDivTop;
						leftStr = highLightDivLeft+highLightDivWidth+icn.outerWidth();
					break;
				case "bottom" :
						topStr = highLightDivTop-highLightDivHight-icn.outerHeight()-this.$guideContentEl.outerHeight();
						leftStr = highLightDivLeft+highLightDivWidth/2-this.$guideContentEl.width() / 2;
					break;
				case "right" :
						topStr = highLightDivTop;
						leftStr = highLightDivLeft-this.$guideContentEl.outerWidth()-icn.outerWidth();
					break
			}
			this.$guideContentEl.css({
				top:topStr,
				left:leftStr
			});
		}
	};

	function getContent(step) {
        var option = step.popup.content, content;
        try {
            content = $("body").find(option).html()
        } catch (e) {}
        return content || option
    };

	$.fn.initPageWalk = function(option){
		//如果多个juerty对象，可以循环this对象，批量new UserGuideWalkComp;
		var userguid = new UserGuideWalkComp();
		userguid.init(option);
	}
})(jQuery,window)