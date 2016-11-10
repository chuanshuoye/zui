define("zui/mixin",["zui/base","zui/mixin/scrollbar","zui/mixin/pagetransition","zui/mixin/touch","zui/mixin/event"],function(require,exports,modules){

		var Mixin={
			iScroll:require("zui/mixin/scrollbar"),
			PageTransition:require("zui/mixin/pagetransition"),
			Touch:require("zui/mixin/touch"),
			Event:require("zui/mixin/event")

		};
		return Mixin;

});