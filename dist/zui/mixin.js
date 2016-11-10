define("zui/mixin",["zui/base","zui/mixin/scrollbar","zui/mixin/pagetransition","zui/mixin/touch","zui/mixin/event"],function(require,exports,modules){

		var Mixin={
			iScroll:require("zui/mixin/scrollbar"),
			PageTransition:require("zui/mixin/pagetransition"),
			Touch:require("zui/mixin/touch"),
			Event:require("zui/mixin/event")

		};
		return Mixin;

});
/*! iScroll v5.1.3 ~ (c) 2008-2014 Matteo Spinelli ~ http://cubiq.org/license */
define("zui/mixin/scrollbar",function(require){



var rAF = window.requestAnimationFrame	||
	window.webkitRequestAnimationFrame	||
	window.mozRequestAnimationFrame		||
	window.oRequestAnimationFrame		||
	window.msRequestAnimationFrame		||
	function (callback) { window.setTimeout(callback, 1000 / 60); };

var utils = (function () {
	var me = {};

	var _elementStyle = document.createElement('div').style;
	var _vendor = (function () {
		var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
			transform,
			i = 0,
			l = vendors.length;

		for ( ; i < l; i++ ) {
			transform = vendors[i] + 'ransform';
			if ( transform in _elementStyle ) return vendors[i].substr(0, vendors[i].length-1);
		}

		return false;
	})();

	function _prefixStyle (style) {
		if ( _vendor === false ) return false;
		if ( _vendor === '' ) return style;
		return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
	}

	me.getTime = Date.now || function getTime () { return new Date().getTime(); };

	me.extend = function (target, obj) {
		for ( var i in obj ) {
			target[i] = obj[i];
		}
	};

	me.addEvent = function (el, type, fn, capture) {
		el.addEventListener(type, fn, !!capture);
	};

	me.removeEvent = function (el, type, fn, capture) {
		el.removeEventListener(type, fn, !!capture);
	};

	me.prefixPointerEvent = function (pointerEvent) {
		return window.MSPointerEvent ? 
			'MSPointer' + pointerEvent.charAt(9).toUpperCase() + pointerEvent.substr(10):
			pointerEvent;
	};

	me.momentum = function (current, start, time, lowerMargin, wrapperSize, deceleration) {
		var distance = current - start,
			speed = Math.abs(distance) / time,
			destination,
			duration;

		deceleration = deceleration === undefined ? 0.0006 : deceleration;

		destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
		duration = speed / deceleration;

		if ( destination < lowerMargin ) {
			destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
			distance = Math.abs(destination - current);
			duration = distance / speed;
		} else if ( destination > 0 ) {
			destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
			distance = Math.abs(current) + destination;
			duration = distance / speed;
		}

		return {
			destination: Math.round(destination),
			duration: duration
		};
	};

	var _transform = _prefixStyle('transform');

	me.extend(me, {
		hasTransform: _transform !== false,
		hasPerspective: _prefixStyle('perspective') in _elementStyle,
		hasTouch: 'ontouchstart' in window,
		hasPointer: window.PointerEvent || window.MSPointerEvent, // IE10 is prefixed
		hasTransition: _prefixStyle('transition') in _elementStyle
	});

	// This should find all Android browsers lower than build 535.19 (both stock browser and webview)
	me.isBadAndroid = /Android /.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion));

	me.extend(me.style = {}, {
		transform: _transform,
		transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
		transitionDuration: _prefixStyle('transitionDuration'),
		transitionDelay: _prefixStyle('transitionDelay'),
		transformOrigin: _prefixStyle('transformOrigin')
	});

	me.hasClass = function (e, c) {
		var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
		return re.test(e.className);
	};

	me.addClass = function (e, c) {
		if ( me.hasClass(e, c) ) {
			return;
		}

		var newclass = e.className.split(' ');
		newclass.push(c);
		e.className = newclass.join(' ');
	};

	me.removeClass = function (e, c) {
		if ( !me.hasClass(e, c) ) {
			return;
		}

		var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
		e.className = e.className.replace(re, ' ');
	};

	me.offset = function (el) {
		var left = -el.offsetLeft,
			top = -el.offsetTop;

		// jshint -W084
		while (el = el.offsetParent) {
			left -= el.offsetLeft;
			top -= el.offsetTop;
		}
		// jshint +W084

		return {
			left: left,
			top: top
		};
	};

	me.preventDefaultException = function (el, exceptions) {
		for ( var i in exceptions ) {
			if ( exceptions[i].test(el[i]) ) {
				return true;
			}
		}

		return false;
	};

	me.extend(me.eventType = {}, {
		touchstart: 1,
		touchmove: 1,
		touchend: 1,

		mousedown: 2,
		mousemove: 2,
		mouseup: 2,

		pointerdown: 3,
		pointermove: 3,
		pointerup: 3,

		MSPointerDown: 3,
		MSPointerMove: 3,
		MSPointerUp: 3
	});

	me.extend(me.ease = {}, {
		quadratic: {
			style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			fn: function (k) {
				return k * ( 2 - k );
			}
		},
		circular: {
			style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',	// Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
			fn: function (k) {
				return Math.sqrt( 1 - ( --k * k ) );
			}
		},
		back: {
			style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
			fn: function (k) {
				var b = 4;
				return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1;
			}
		},
		bounce: {
			style: '',
			fn: function (k) {
				if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {
					return 7.5625 * k * k;
				} else if ( k < ( 2 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
				} else if ( k < ( 2.5 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
				} else {
					return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
				}
			}
		},
		elastic: {
			style: '',
			fn: function (k) {
				var f = 0.22,
					e = 0.4;

				if ( k === 0 ) { return 0; }
				if ( k == 1 ) { return 1; }

				return ( e * Math.pow( 2, - 10 * k ) * Math.sin( ( k - f / 4 ) * ( 2 * Math.PI ) / f ) + 1 );
			}
		}
	});

	me.tap = function (e, eventName) {
		var ev = document.createEvent('Event');
		ev.initEvent(eventName, true, true);
		ev.pageX = e.pageX;
		ev.pageY = e.pageY;
		e.target.dispatchEvent(ev);
	};

	me.click = function (e) {
		var target = e.target,
			ev;

		if ( !(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName) ) {
			ev = document.createEvent('MouseEvents');
			ev.initMouseEvent('click', true, true, e.view, 1,
				target.screenX, target.screenY, target.clientX, target.clientY,
				e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
				0, null);

			ev._constructed = true;
			target.dispatchEvent(ev);
		}
	};

	return me;
})();

function IScroll (el, options) {
	this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
	this.scroller = this.wrapper.children[0];
	this.scrollerStyle = this.scroller.style;		// cache style for better performance

	this.options = {

		resizeScrollbars: true,

		mouseWheelSpeed: 20,

		snapThreshold: 0.334,

// INSERT POINT: OPTIONS 

		startX: 0,
		startY: 0,
		scrollY: true,
		directionLockThreshold: 5,
		momentum: true,

		bounce: true,
		bounceTime: 600,
		bounceEasing: '',

		preventDefault: true,
		preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ },

		HWCompositing: true,
		useTransition: true,
		useTransform: true
	};

	for ( var i in options ) {
		this.options[i] = options[i];
	}

	// Normalize options
	this.translateZ = this.options.HWCompositing && utils.hasPerspective ? ' translateZ(0)' : '';

	this.options.useTransition = utils.hasTransition && this.options.useTransition;
	this.options.useTransform = utils.hasTransform && this.options.useTransform;

	this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
	this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;

	// If you want eventPassthrough I have to lock one of the axes
	this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY;
	this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX;

	// With eventPassthrough we also need lockDirection mechanism
	this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
	this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;

	this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;

	this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;

	if ( this.options.tap === true ) {
		this.options.tap = 'tap';
	}

	if ( this.options.shrinkScrollbars == 'scale' ) {
		this.options.useTransition = false;
	}

	this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1;

// INSERT POINT: NORMALIZATION

	// Some defaults	
	this.x = 0;
	this.y = 0;
	this.directionX = 0;
	this.directionY = 0;
	this._events = {};

// INSERT POINT: DEFAULTS

	this._init();
	this.refresh();

	this.scrollTo(this.options.startX, this.options.startY);
	this.enable();
}

IScroll.prototype = {
	version: '5.1.3',

	_init: function () {
		this._initEvents();

		if ( this.options.scrollbars || this.options.indicators ) {
			this._initIndicators();
		}

		if ( this.options.mouseWheel ) {
			this._initWheel();
		}

		if ( this.options.snap ) {
			this._initSnap();
		}

		if ( this.options.keyBindings ) {
			this._initKeys();
		}

// INSERT POINT: _init

	},

	destroy: function () {
		this._initEvents(true);

		this._execEvent('destroy');
	},

	_transitionEnd: function (e) {
		if ( e.target != this.scroller || !this.isInTransition ) {
			return;
		}

		this._transitionTime();
		if ( !this.resetPosition(this.options.bounceTime) ) {
			this.isInTransition = false;
			this._execEvent('scrollEnd');
		}
	},

	_start: function (e) {
		// React to left mouse button only
		if ( utils.eventType[e.type] != 1 ) {
			if ( e.button !== 0 ) {
				return;
			}
		}

		if ( !this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated) ) {
			return;
		}

		if ( this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
			e.preventDefault();
		}

		var point = e.touches ? e.touches[0] : e,
			pos;

		this.initiated	= utils.eventType[e.type];
		this.moved		= false;
		this.distX		= 0;
		this.distY		= 0;
		this.directionX = 0;
		this.directionY = 0;
		this.directionLocked = 0;

		this._transitionTime();

		this.startTime = utils.getTime();

		if ( this.options.useTransition && this.isInTransition ) {
			this.isInTransition = false;
			pos = this.getComputedPosition();
			this._translate(Math.round(pos.x), Math.round(pos.y));
			this._execEvent('scrollEnd');
		} else if ( !this.options.useTransition && this.isAnimating ) {
			this.isAnimating = false;
			this._execEvent('scrollEnd');
		}

		this.startX    = this.x;
		this.startY    = this.y;
		this.absStartX = this.x;
		this.absStartY = this.y;
		this.pointX    = point.pageX;
		this.pointY    = point.pageY;

		this._execEvent('beforeScrollStart');
	},

	_move: function (e) {
		if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
			return;
		}

		if ( this.options.preventDefault ) {	// increases performance on Android? TODO: check!
			e.preventDefault();
		}

		var point		= e.touches ? e.touches[0] : e,
			deltaX		= point.pageX - this.pointX,
			deltaY		= point.pageY - this.pointY,
			timestamp	= utils.getTime(),
			newX, newY,
			absDistX, absDistY;

		this.pointX		= point.pageX;
		this.pointY		= point.pageY;

		this.distX		+= deltaX;
		this.distY		+= deltaY;
		absDistX		= Math.abs(this.distX);
		absDistY		= Math.abs(this.distY);

		// We need to move at least 10 pixels for the scrolling to initiate
		if ( timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10) ) {
			return;
		}

		// If you are scrolling in one direction lock the other
		if ( !this.directionLocked && !this.options.freeScroll ) {
			if ( absDistX > absDistY + this.options.directionLockThreshold ) {
				this.directionLocked = 'h';		// lock horizontally
			} else if ( absDistY >= absDistX + this.options.directionLockThreshold ) {
				this.directionLocked = 'v';		// lock vertically
			} else {
				this.directionLocked = 'n';		// no lock
			}
		}

		if ( this.directionLocked == 'h' ) {
			if ( this.options.eventPassthrough == 'vertical' ) {
				e.preventDefault();
			} else if ( this.options.eventPassthrough == 'horizontal' ) {
				this.initiated = false;
				return;
			}

			deltaY = 0;
		} else if ( this.directionLocked == 'v' ) {
			if ( this.options.eventPassthrough == 'horizontal' ) {
				e.preventDefault();
			} else if ( this.options.eventPassthrough == 'vertical' ) {
				this.initiated = false;
				return;
			}

			deltaX = 0;
		}

		deltaX = this.hasHorizontalScroll ? deltaX : 0;
		deltaY = this.hasVerticalScroll ? deltaY : 0;

		newX = this.x + deltaX;
		newY = this.y + deltaY;

		// Slow down if outside of the boundaries
		if ( newX > 0 || newX < this.maxScrollX ) {
			newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
		}
		if ( newY > 0 || newY < this.maxScrollY ) {
			newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
		}

		this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
		this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

		if ( !this.moved ) {
			this._execEvent('scrollStart');
		}

		this.moved = true;

		this._translate(newX, newY);

/* REPLACE START: _move */

		if ( timestamp - this.startTime > 300 ) {
			this.startTime = timestamp;
			this.startX = this.x;
			this.startY = this.y;
		}

/* REPLACE END: _move */

	},

	_end: function (e) {
		if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
			return;
		}

		if ( this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
			e.preventDefault();
		}

		var point = e.changedTouches ? e.changedTouches[0] : e,
			momentumX,
			momentumY,
			duration = utils.getTime() - this.startTime,
			newX = Math.round(this.x),
			newY = Math.round(this.y),
			distanceX = Math.abs(newX - this.startX),
			distanceY = Math.abs(newY - this.startY),
			time = 0,
			easing = '';

		this.isInTransition = 0;
		this.initiated = 0;
		this.endTime = utils.getTime();

		// reset if we are outside of the boundaries
		if ( this.resetPosition(this.options.bounceTime) ) {
			return;
		}

		this.scrollTo(newX, newY);	// ensures that the last position is rounded

		// we scrolled less than 10 pixels
		if ( !this.moved ) {
			if ( this.options.tap ) {
				utils.tap(e, this.options.tap);
			}

			if ( this.options.click ) {
				utils.click(e);
			}

			this._execEvent('scrollCancel');
			return;
		}

		if ( this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100 ) {
			this._execEvent('flick');
			return;
		}

		// start momentum animation if needed
		if ( this.options.momentum && duration < 300 ) {
			momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : { destination: newX, duration: 0 };
			momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : { destination: newY, duration: 0 };
			newX = momentumX.destination;
			newY = momentumY.destination;
			time = Math.max(momentumX.duration, momentumY.duration);
			this.isInTransition = 1;
		}


		if ( this.options.snap ) {
			var snap = this._nearestSnap(newX, newY);
			this.currentPage = snap;
			time = this.options.snapSpeed || Math.max(
					Math.max(
						Math.min(Math.abs(newX - snap.x), 1000),
						Math.min(Math.abs(newY - snap.y), 1000)
					), 300);
			newX = snap.x;
			newY = snap.y;

			this.directionX = 0;
			this.directionY = 0;
			easing = this.options.bounceEasing;
		}

// INSERT POINT: _end

		if ( newX != this.x || newY != this.y ) {
			// change easing function when scroller goes out of the boundaries
			if ( newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY ) {
				easing = utils.ease.quadratic;
			}

			this.scrollTo(newX, newY, time, easing);
			return;
		}

		this._execEvent('scrollEnd');
	},

	_resize: function () {
		var that = this;

		clearTimeout(this.resizeTimeout);

		this.resizeTimeout = setTimeout(function () {
			that.refresh();
		}, this.options.resizePolling);
	},

	resetPosition: function (time) {
		var x = this.x,
			y = this.y;

		time = time || 0;

		if ( !this.hasHorizontalScroll || this.x > 0 ) {
			x = 0;
		} else if ( this.x < this.maxScrollX ) {
			x = this.maxScrollX;
		}

		if ( !this.hasVerticalScroll || this.y > 0 ) {
			y = 0;
		} else if ( this.y < this.maxScrollY ) {
			y = this.maxScrollY;
		}

		if ( x == this.x && y == this.y ) {
			return false;
		}

		this.scrollTo(x, y, time, this.options.bounceEasing);

		return true;
	},

	disable: function () {
		this.enabled = false;
	},

	enable: function () {
		this.enabled = true;
	},

	refresh: function () {
		var rf = this.wrapper.offsetHeight;		// Force reflow

		this.wrapperWidth	= this.wrapper.clientWidth;
		this.wrapperHeight	= this.wrapper.clientHeight;

/* REPLACE START: refresh */

		this.scrollerWidth	= this.scroller.offsetWidth;
		this.scrollerHeight	= this.scroller.offsetHeight;

		this.maxScrollX		= this.wrapperWidth - this.scrollerWidth;
		this.maxScrollY		= this.wrapperHeight - this.scrollerHeight;

/* REPLACE END: refresh */

		this.hasHorizontalScroll	= this.options.scrollX && this.maxScrollX < 0;
		this.hasVerticalScroll		= this.options.scrollY && this.maxScrollY < 0;

		if ( !this.hasHorizontalScroll ) {
			this.maxScrollX = 0;
			this.scrollerWidth = this.wrapperWidth;
		}

		if ( !this.hasVerticalScroll ) {
			this.maxScrollY = 0;
			this.scrollerHeight = this.wrapperHeight;
		}

		this.endTime = 0;
		this.directionX = 0;
		this.directionY = 0;

		this.wrapperOffset = utils.offset(this.wrapper);

		this._execEvent('refresh');

		this.resetPosition();

// INSERT POINT: _refresh

	},

	on: function (type, fn) {
		if ( !this._events[type] ) {
			this._events[type] = [];
		}

		this._events[type].push(fn);
	},

	off: function (type, fn) {
		if ( !this._events[type] ) {
			return;
		}

		var index = this._events[type].indexOf(fn);

		if ( index > -1 ) {
			this._events[type].splice(index, 1);
		}
	},

	_execEvent: function (type) {
		if ( !this._events[type] ) {
			return;
		}

		var i = 0,
			l = this._events[type].length;

		if ( !l ) {
			return;
		}

		for ( ; i < l; i++ ) {
			this._events[type][i].apply(this, [].slice.call(arguments, 1));
		}
	},

	scrollBy: function (x, y, time, easing) {
		x = this.x + x;
		y = this.y + y;
		time = time || 0;

		this.scrollTo(x, y, time, easing);
	},

	scrollTo: function (x, y, time, easing) {
		easing = easing || utils.ease.circular;

		this.isInTransition = this.options.useTransition && time > 0;

		if ( !time || (this.options.useTransition && easing.style) ) {
			this._transitionTimingFunction(easing.style);
			this._transitionTime(time);
			this._translate(x, y);
		} else {
			this._animate(x, y, time, easing.fn);
		}
	},

	scrollToElement: function (el, time, offsetX, offsetY, easing) {
		el = el.nodeType ? el : this.scroller.querySelector(el);

		if ( !el ) {
			return;
		}

		var pos = utils.offset(el);

		pos.left -= this.wrapperOffset.left;
		pos.top  -= this.wrapperOffset.top;

		// if offsetX/Y are true we center the element to the screen
		if ( offsetX === true ) {
			offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
		}
		if ( offsetY === true ) {
			offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
		}

		pos.left -= offsetX || 0;
		pos.top  -= offsetY || 0;

		pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
		pos.top  = pos.top  > 0 ? 0 : pos.top  < this.maxScrollY ? this.maxScrollY : pos.top;

		time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x-pos.left), Math.abs(this.y-pos.top)) : time;

		this.scrollTo(pos.left, pos.top, time, easing);
	},

	_transitionTime: function (time) {
		time = time || 0;

		this.scrollerStyle[utils.style.transitionDuration] = time + 'ms';

		if ( !time && utils.isBadAndroid ) {
			this.scrollerStyle[utils.style.transitionDuration] = '0.001s';
		}


		if ( this.indicators ) {
			for ( var i = this.indicators.length; i--; ) {
				this.indicators[i].transitionTime(time);
			}
		}


// INSERT POINT: _transitionTime

	},

	_transitionTimingFunction: function (easing) {
		this.scrollerStyle[utils.style.transitionTimingFunction] = easing;


		if ( this.indicators ) {
			for ( var i = this.indicators.length; i--; ) {
				this.indicators[i].transitionTimingFunction(easing);
			}
		}


// INSERT POINT: _transitionTimingFunction

	},

	_translate: function (x, y) {
		if ( this.options.useTransform ) {

/* REPLACE START: _translate */

			this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;

/* REPLACE END: _translate */

		} else {
			x = Math.round(x);
			y = Math.round(y);
			this.scrollerStyle.left = x + 'px';
			this.scrollerStyle.top = y + 'px';
		}

		this.x = x;
		this.y = y;


	if ( this.indicators ) {
		for ( var i = this.indicators.length; i--; ) {
			this.indicators[i].updatePosition();
		}
	}


// INSERT POINT: _translate

	},

	_initEvents: function (remove) {
		var eventType = remove ? utils.removeEvent : utils.addEvent,
			target = this.options.bindToWrapper ? this.wrapper : window;

		eventType(window, 'orientationchange', this);
		eventType(window, 'resize', this);

		if ( this.options.click ) {
			eventType(this.wrapper, 'click', this, true);
		}

		if ( !this.options.disableMouse ) {
			eventType(this.wrapper, 'mousedown', this);
			eventType(target, 'mousemove', this);
			eventType(target, 'mousecancel', this);
			eventType(target, 'mouseup', this);
		}

		if ( utils.hasPointer && !this.options.disablePointer ) {
			eventType(this.wrapper, utils.prefixPointerEvent('pointerdown'), this);
			eventType(target, utils.prefixPointerEvent('pointermove'), this);
			eventType(target, utils.prefixPointerEvent('pointercancel'), this);
			eventType(target, utils.prefixPointerEvent('pointerup'), this);
		}

		if ( utils.hasTouch && !this.options.disableTouch ) {
			eventType(this.wrapper, 'touchstart', this);
			eventType(target, 'touchmove', this);
			eventType(target, 'touchcancel', this);
			eventType(target, 'touchend', this);
		}

		eventType(this.scroller, 'transitionend', this);
		eventType(this.scroller, 'webkitTransitionEnd', this);
		eventType(this.scroller, 'oTransitionEnd', this);
		eventType(this.scroller, 'MSTransitionEnd', this);
	},

	getComputedPosition: function () {
		var matrix = window.getComputedStyle(this.scroller, null),
			x, y;

		if ( this.options.useTransform ) {
			matrix = matrix[utils.style.transform].split(')')[0].split(', ');
			x = +(matrix[12] || matrix[4]);
			y = +(matrix[13] || matrix[5]);
		} else {
			x = +matrix.left.replace(/[^-\d.]/g, '');
			y = +matrix.top.replace(/[^-\d.]/g, '');
		}

		return { x: x, y: y };
	},

	_initIndicators: function () {
		var interactive = this.options.interactiveScrollbars,
			customStyle = typeof this.options.scrollbars != 'string',
			indicators = [],
			indicator;

		var that = this;

		this.indicators = [];

		if ( this.options.scrollbars ) {
			// Vertical scrollbar
			if ( this.options.scrollY ) {
				indicator = {
					el: createDefaultScrollbar('v', interactive, this.options.scrollbars),
					interactive: interactive,
					defaultScrollbars: true,
					customStyle: customStyle,
					resize: this.options.resizeScrollbars,
					shrink: this.options.shrinkScrollbars,
					fade: this.options.fadeScrollbars,
					listenX: false
				};

				this.wrapper.appendChild(indicator.el);
				indicators.push(indicator);
			}

			// Horizontal scrollbar
			if ( this.options.scrollX ) {
				indicator = {
					el: createDefaultScrollbar('h', interactive, this.options.scrollbars),
					interactive: interactive,
					defaultScrollbars: true,
					customStyle: customStyle,
					resize: this.options.resizeScrollbars,
					shrink: this.options.shrinkScrollbars,
					fade: this.options.fadeScrollbars,
					listenY: false
				};

				this.wrapper.appendChild(indicator.el);
				indicators.push(indicator);
			}
		}

		if ( this.options.indicators ) {
			// TODO: check concat compatibility
			indicators = indicators.concat(this.options.indicators);
		}

		for ( var i = indicators.length; i--; ) {
			this.indicators.push( new Indicator(this, indicators[i]) );
		}

		// TODO: check if we can use array.map (wide compatibility and performance issues)
		function _indicatorsMap (fn) {
			for ( var i = that.indicators.length; i--; ) {
				fn.call(that.indicators[i]);
			}
		}

		if ( this.options.fadeScrollbars ) {
			this.on('scrollEnd', function () {
				_indicatorsMap(function () {
					this.fade();
				});
			});

			this.on('scrollCancel', function () {
				_indicatorsMap(function () {
					this.fade();
				});
			});

			this.on('scrollStart', function () {
				_indicatorsMap(function () {
					this.fade(1);
				});
			});

			this.on('beforeScrollStart', function () {
				_indicatorsMap(function () {
					this.fade(1, true);
				});
			});
		}


		this.on('refresh', function () {
			_indicatorsMap(function () {
				this.refresh();
			});
		});

		this.on('destroy', function () {
			_indicatorsMap(function () {
				this.destroy();
			});

			delete this.indicators;
		});
	},

	_initWheel: function () {
		utils.addEvent(this.wrapper, 'wheel', this);
		utils.addEvent(this.wrapper, 'mousewheel', this);
		utils.addEvent(this.wrapper, 'DOMMouseScroll', this);

		this.on('destroy', function () {
			utils.removeEvent(this.wrapper, 'wheel', this);
			utils.removeEvent(this.wrapper, 'mousewheel', this);
			utils.removeEvent(this.wrapper, 'DOMMouseScroll', this);
		});
	},

	_wheel: function (e) {
		if ( !this.enabled ) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		var wheelDeltaX, wheelDeltaY,
			newX, newY,
			that = this;

		if ( this.wheelTimeout === undefined ) {
			that._execEvent('scrollStart');
		}

		// Execute the scrollEnd event after 400ms the wheel stopped scrolling
		clearTimeout(this.wheelTimeout);
		this.wheelTimeout = setTimeout(function () {
			that._execEvent('scrollEnd');
			that.wheelTimeout = undefined;
		}, 400);

		if ( 'deltaX' in e ) {
			if (e.deltaMode === 1) {
				wheelDeltaX = -e.deltaX * this.options.mouseWheelSpeed;
				wheelDeltaY = -e.deltaY * this.options.mouseWheelSpeed;
			} else {
				wheelDeltaX = -e.deltaX;
				wheelDeltaY = -e.deltaY;
			}
		} else if ( 'wheelDeltaX' in e ) {
			wheelDeltaX = e.wheelDeltaX / 120 * this.options.mouseWheelSpeed;
			wheelDeltaY = e.wheelDeltaY / 120 * this.options.mouseWheelSpeed;
		} else if ( 'wheelDelta' in e ) {
			wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * this.options.mouseWheelSpeed;
		} else if ( 'detail' in e ) {
			wheelDeltaX = wheelDeltaY = -e.detail / 3 * this.options.mouseWheelSpeed;
		} else {
			return;
		}

		wheelDeltaX *= this.options.invertWheelDirection;
		wheelDeltaY *= this.options.invertWheelDirection;

		if ( !this.hasVerticalScroll ) {
			wheelDeltaX = wheelDeltaY;
			wheelDeltaY = 0;
		}

		if ( this.options.snap ) {
			newX = this.currentPage.pageX;
			newY = this.currentPage.pageY;

			if ( wheelDeltaX > 0 ) {
				newX--;
			} else if ( wheelDeltaX < 0 ) {
				newX++;
			}

			if ( wheelDeltaY > 0 ) {
				newY--;
			} else if ( wheelDeltaY < 0 ) {
				newY++;
			}

			this.goToPage(newX, newY);

			return;
		}

		newX = this.x + Math.round(this.hasHorizontalScroll ? wheelDeltaX : 0);
		newY = this.y + Math.round(this.hasVerticalScroll ? wheelDeltaY : 0);

		if ( newX > 0 ) {
			newX = 0;
		} else if ( newX < this.maxScrollX ) {
			newX = this.maxScrollX;
		}

		if ( newY > 0 ) {
			newY = 0;
		} else if ( newY < this.maxScrollY ) {
			newY = this.maxScrollY;
		}

		this.scrollTo(newX, newY, 0);

// INSERT POINT: _wheel
	},

	_initSnap: function () {
		this.currentPage = {};

		if ( typeof this.options.snap == 'string' ) {
			this.options.snap = this.scroller.querySelectorAll(this.options.snap);
		}

		this.on('refresh', function () {
			var i = 0, l,
				m = 0, n,
				cx, cy,
				x = 0, y,
				stepX = this.options.snapStepX || this.wrapperWidth,
				stepY = this.options.snapStepY || this.wrapperHeight,
				el;

			this.pages = [];

			if ( !this.wrapperWidth || !this.wrapperHeight || !this.scrollerWidth || !this.scrollerHeight ) {
				return;
			}

			if ( this.options.snap === true ) {
				cx = Math.round( stepX / 2 );
				cy = Math.round( stepY / 2 );

				while ( x > -this.scrollerWidth ) {
					this.pages[i] = [];
					l = 0;
					y = 0;

					while ( y > -this.scrollerHeight ) {
						this.pages[i][l] = {
							x: Math.max(x, this.maxScrollX),
							y: Math.max(y, this.maxScrollY),
							width: stepX,
							height: stepY,
							cx: x - cx,
							cy: y - cy
						};

						y -= stepY;
						l++;
					}

					x -= stepX;
					i++;
				}
			} else {
				el = this.options.snap;
				l = el.length;
				n = -1;

				for ( ; i < l; i++ ) {
					if ( i === 0 || el[i].offsetLeft <= el[i-1].offsetLeft ) {
						m = 0;
						n++;
					}

					if ( !this.pages[m] ) {
						this.pages[m] = [];
					}

					x = Math.max(-el[i].offsetLeft, this.maxScrollX);
					y = Math.max(-el[i].offsetTop, this.maxScrollY);
					cx = x - Math.round(el[i].offsetWidth / 2);
					cy = y - Math.round(el[i].offsetHeight / 2);

					this.pages[m][n] = {
						x: x,
						y: y,
						width: el[i].offsetWidth,
						height: el[i].offsetHeight,
						cx: cx,
						cy: cy
					};

					if ( x > this.maxScrollX ) {
						m++;
					}
				}
			}

			this.goToPage(this.currentPage.pageX || 0, this.currentPage.pageY || 0, 0);

			// Update snap threshold if needed
			if ( this.options.snapThreshold % 1 === 0 ) {
				this.snapThresholdX = this.options.snapThreshold;
				this.snapThresholdY = this.options.snapThreshold;
			} else {
				this.snapThresholdX = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width * this.options.snapThreshold);
				this.snapThresholdY = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height * this.options.snapThreshold);
			}
		});

		this.on('flick', function () {
			var time = this.options.snapSpeed || Math.max(
					Math.max(
						Math.min(Math.abs(this.x - this.startX), 1000),
						Math.min(Math.abs(this.y - this.startY), 1000)
					), 300);

			this.goToPage(
				this.currentPage.pageX + this.directionX,
				this.currentPage.pageY + this.directionY,
				time
			);
		});
	},

	_nearestSnap: function (x, y) {
		if ( !this.pages.length ) {
			return { x: 0, y: 0, pageX: 0, pageY: 0 };
		}

		var i = 0,
			l = this.pages.length,
			m = 0;

		// Check if we exceeded the snap threshold
		if ( Math.abs(x - this.absStartX) < this.snapThresholdX &&
			Math.abs(y - this.absStartY) < this.snapThresholdY ) {
			return this.currentPage;
		}

		if ( x > 0 ) {
			x = 0;
		} else if ( x < this.maxScrollX ) {
			x = this.maxScrollX;
		}

		if ( y > 0 ) {
			y = 0;
		} else if ( y < this.maxScrollY ) {
			y = this.maxScrollY;
		}

		for ( ; i < l; i++ ) {
			if ( x >= this.pages[i][0].cx ) {
				x = this.pages[i][0].x;
				break;
			}
		}

		l = this.pages[i].length;

		for ( ; m < l; m++ ) {
			if ( y >= this.pages[0][m].cy ) {
				y = this.pages[0][m].y;
				break;
			}
		}

		if ( i == this.currentPage.pageX ) {
			i += this.directionX;

			if ( i < 0 ) {
				i = 0;
			} else if ( i >= this.pages.length ) {
				i = this.pages.length - 1;
			}

			x = this.pages[i][0].x;
		}

		if ( m == this.currentPage.pageY ) {
			m += this.directionY;

			if ( m < 0 ) {
				m = 0;
			} else if ( m >= this.pages[0].length ) {
				m = this.pages[0].length - 1;
			}

			y = this.pages[0][m].y;
		}

		return {
			x: x,
			y: y,
			pageX: i,
			pageY: m
		};
	},

	goToPage: function (x, y, time, easing) {
		easing = easing || this.options.bounceEasing;

		if ( x >= this.pages.length ) {
			x = this.pages.length - 1;
		} else if ( x < 0 ) {
			x = 0;
		}

		if ( y >= this.pages[x].length ) {
			y = this.pages[x].length - 1;
		} else if ( y < 0 ) {
			y = 0;
		}

		var posX = this.pages[x][y].x,
			posY = this.pages[x][y].y;

		time = time === undefined ? this.options.snapSpeed || Math.max(
			Math.max(
				Math.min(Math.abs(posX - this.x), 1000),
				Math.min(Math.abs(posY - this.y), 1000)
			), 300) : time;

		this.currentPage = {
			x: posX,
			y: posY,
			pageX: x,
			pageY: y
		};

		this.scrollTo(posX, posY, time, easing);
	},

	next: function (time, easing) {
		var x = this.currentPage.pageX,
			y = this.currentPage.pageY;

		x++;

		if ( x >= this.pages.length && this.hasVerticalScroll ) {
			x = 0;
			y++;
		}

		this.goToPage(x, y, time, easing);
	},

	prev: function (time, easing) {
		var x = this.currentPage.pageX,
			y = this.currentPage.pageY;

		x--;

		if ( x < 0 && this.hasVerticalScroll ) {
			x = 0;
			y--;
		}

		this.goToPage(x, y, time, easing);
	},

	_initKeys: function (e) {
		// default key bindings
		var keys = {
			pageUp: 33,
			pageDown: 34,
			end: 35,
			home: 36,
			left: 37,
			up: 38,
			right: 39,
			down: 40
		};
		var i;

		// if you give me characters I give you keycode
		if ( typeof this.options.keyBindings == 'object' ) {
			for ( i in this.options.keyBindings ) {
				if ( typeof this.options.keyBindings[i] == 'string' ) {
					this.options.keyBindings[i] = this.options.keyBindings[i].toUpperCase().charCodeAt(0);
				}
			}
		} else {
			this.options.keyBindings = {};
		}

		for ( i in keys ) {
			this.options.keyBindings[i] = this.options.keyBindings[i] || keys[i];
		}

		utils.addEvent(window, 'keydown', this);

		this.on('destroy', function () {
			utils.removeEvent(window, 'keydown', this);
		});
	},

	_key: function (e) {
		if ( !this.enabled ) {
			return;
		}

		var snap = this.options.snap,	// we are using this alot, better to cache it
			newX = snap ? this.currentPage.pageX : this.x,
			newY = snap ? this.currentPage.pageY : this.y,
			now = utils.getTime(),
			prevTime = this.keyTime || 0,
			acceleration = 0.250,
			pos;

		if ( this.options.useTransition && this.isInTransition ) {
			pos = this.getComputedPosition();

			this._translate(Math.round(pos.x), Math.round(pos.y));
			this.isInTransition = false;
		}

		this.keyAcceleration = now - prevTime < 200 ? Math.min(this.keyAcceleration + acceleration, 50) : 0;

		switch ( e.keyCode ) {
			case this.options.keyBindings.pageUp:
				if ( this.hasHorizontalScroll && !this.hasVerticalScroll ) {
					newX += snap ? 1 : this.wrapperWidth;
				} else {
					newY += snap ? 1 : this.wrapperHeight;
				}
				break;
			case this.options.keyBindings.pageDown:
				if ( this.hasHorizontalScroll && !this.hasVerticalScroll ) {
					newX -= snap ? 1 : this.wrapperWidth;
				} else {
					newY -= snap ? 1 : this.wrapperHeight;
				}
				break;
			case this.options.keyBindings.end:
				newX = snap ? this.pages.length-1 : this.maxScrollX;
				newY = snap ? this.pages[0].length-1 : this.maxScrollY;
				break;
			case this.options.keyBindings.home:
				newX = 0;
				newY = 0;
				break;
			case this.options.keyBindings.left:
				newX += snap ? -1 : 5 + this.keyAcceleration>>0;
				break;
			case this.options.keyBindings.up:
				newY += snap ? 1 : 5 + this.keyAcceleration>>0;
				break;
			case this.options.keyBindings.right:
				newX -= snap ? -1 : 5 + this.keyAcceleration>>0;
				break;
			case this.options.keyBindings.down:
				newY -= snap ? 1 : 5 + this.keyAcceleration>>0;
				break;
			default:
				return;
		}

		if ( snap ) {
			this.goToPage(newX, newY);
			return;
		}

		if ( newX > 0 ) {
			newX = 0;
			this.keyAcceleration = 0;
		} else if ( newX < this.maxScrollX ) {
			newX = this.maxScrollX;
			this.keyAcceleration = 0;
		}

		if ( newY > 0 ) {
			newY = 0;
			this.keyAcceleration = 0;
		} else if ( newY < this.maxScrollY ) {
			newY = this.maxScrollY;
			this.keyAcceleration = 0;
		}

		this.scrollTo(newX, newY, 0);

		this.keyTime = now;
	},

	_animate: function (destX, destY, duration, easingFn) {
		var that = this,
			startX = this.x,
			startY = this.y,
			startTime = utils.getTime(),
			destTime = startTime + duration;

		function step () {
			var now = utils.getTime(),
				newX, newY,
				easing;

			if ( now >= destTime ) {
				that.isAnimating = false;
				that._translate(destX, destY);

				if ( !that.resetPosition(that.options.bounceTime) ) {
					that._execEvent('scrollEnd');
				}

				return;
			}

			now = ( now - startTime ) / duration;
			easing = easingFn(now);
			newX = ( destX - startX ) * easing + startX;
			newY = ( destY - startY ) * easing + startY;
			that._translate(newX, newY);

			if ( that.isAnimating ) {
				rAF(step);
			}
		}

		this.isAnimating = true;
		step();
	},
	handleEvent: function (e) {
		switch ( e.type ) {
			case 'touchstart':
			case 'pointerdown':
			case 'MSPointerDown':
			case 'mousedown':
				this._start(e);
				break;
			case 'touchmove':
			case 'pointermove':
			case 'MSPointerMove':
			case 'mousemove':
				this._move(e);
				break;
			case 'touchend':
			case 'pointerup':
			case 'MSPointerUp':
			case 'mouseup':
			case 'touchcancel':
			case 'pointercancel':
			case 'MSPointerCancel':
			case 'mousecancel':
				this._end(e);
				break;
			case 'orientationchange':
			case 'resize':
				this._resize();
				break;
			case 'transitionend':
			case 'webkitTransitionEnd':
			case 'oTransitionEnd':
			case 'MSTransitionEnd':
				this._transitionEnd(e);
				break;
			case 'wheel':
			case 'DOMMouseScroll':
			case 'mousewheel':
				this._wheel(e);
				break;
			case 'keydown':
				this._key(e);
				break;
			case 'click':
				if ( !e._constructed ) {
					e.preventDefault();
					e.stopPropagation();
				}
				break;
		}
	}
};
function createDefaultScrollbar (direction, interactive, type) {
	var scrollbar = document.createElement('div'),
		indicator = document.createElement('div');

	if ( type === true ) {
		scrollbar.style.cssText = 'position:absolute;z-index:9999';
		indicator.style.cssText = '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px';
	}

	indicator.className = 'iScrollIndicator';

	if ( direction == 'h' ) {
		if ( type === true ) {
			scrollbar.style.cssText += ';height:7px;left:2px;right:2px;bottom:0';
			indicator.style.height = '100%';
		}
		scrollbar.className = 'iScrollHorizontalScrollbar';
	} else {
		if ( type === true ) {
			scrollbar.style.cssText += ';width:7px;bottom:2px;top:2px;right:1px';
			indicator.style.width = '100%';
		}
		scrollbar.className = 'iScrollVerticalScrollbar';
	}

	scrollbar.style.cssText += ';overflow:hidden';

	if ( !interactive ) {
		scrollbar.style.pointerEvents = 'none';
	}

	scrollbar.appendChild(indicator);

	return scrollbar;
}

function Indicator (scroller, options) {
	this.wrapper = typeof options.el == 'string' ? document.querySelector(options.el) : options.el;
	this.wrapperStyle = this.wrapper.style;
	this.indicator = this.wrapper.children[0];
	this.indicatorStyle = this.indicator.style;
	this.scroller = scroller;

	this.options = {
		listenX: true,
		listenY: true,
		interactive: false,
		resize: true,
		defaultScrollbars: false,
		shrink: false,
		fade: false,
		speedRatioX: 0,
		speedRatioY: 0
	};

	for ( var i in options ) {
		this.options[i] = options[i];
	}

	this.sizeRatioX = 1;
	this.sizeRatioY = 1;
	this.maxPosX = 0;
	this.maxPosY = 0;

	if ( this.options.interactive ) {
		if ( !this.options.disableTouch ) {
			utils.addEvent(this.indicator, 'touchstart', this);
			utils.addEvent(window, 'touchend', this);
		}
		if ( !this.options.disablePointer ) {
			utils.addEvent(this.indicator, utils.prefixPointerEvent('pointerdown'), this);
			utils.addEvent(window, utils.prefixPointerEvent('pointerup'), this);
		}
		if ( !this.options.disableMouse ) {
			utils.addEvent(this.indicator, 'mousedown', this);
			utils.addEvent(window, 'mouseup', this);
		}
	}

	if ( this.options.fade ) {
		this.wrapperStyle[utils.style.transform] = this.scroller.translateZ;
		this.wrapperStyle[utils.style.transitionDuration] = utils.isBadAndroid ? '0.001s' : '0ms';
		this.wrapperStyle.opacity = '0';
	}
}

Indicator.prototype = {
	handleEvent: function (e) {
		switch ( e.type ) {
			case 'touchstart':
			case 'pointerdown':
			case 'MSPointerDown':
			case 'mousedown':
				this._start(e);
				break;
			case 'touchmove':
			case 'pointermove':
			case 'MSPointerMove':
			case 'mousemove':
				this._move(e);
				break;
			case 'touchend':
			case 'pointerup':
			case 'MSPointerUp':
			case 'mouseup':
			case 'touchcancel':
			case 'pointercancel':
			case 'MSPointerCancel':
			case 'mousecancel':
				this._end(e);
				break;
		}
	},

	destroy: function () {
		if ( this.options.interactive ) {
			utils.removeEvent(this.indicator, 'touchstart', this);
			utils.removeEvent(this.indicator, utils.prefixPointerEvent('pointerdown'), this);
			utils.removeEvent(this.indicator, 'mousedown', this);

			utils.removeEvent(window, 'touchmove', this);
			utils.removeEvent(window, utils.prefixPointerEvent('pointermove'), this);
			utils.removeEvent(window, 'mousemove', this);

			utils.removeEvent(window, 'touchend', this);
			utils.removeEvent(window, utils.prefixPointerEvent('pointerup'), this);
			utils.removeEvent(window, 'mouseup', this);
		}

		if ( this.options.defaultScrollbars ) {
			this.wrapper.parentNode.removeChild(this.wrapper);
		}
	},

	_start: function (e) {
		var point = e.touches ? e.touches[0] : e;

		e.preventDefault();
		e.stopPropagation();

		this.transitionTime();

		this.initiated = true;
		this.moved = false;
		this.lastPointX	= point.pageX;
		this.lastPointY	= point.pageY;

		this.startTime	= utils.getTime();

		if ( !this.options.disableTouch ) {
			utils.addEvent(window, 'touchmove', this);
		}
		if ( !this.options.disablePointer ) {
			utils.addEvent(window, utils.prefixPointerEvent('pointermove'), this);
		}
		if ( !this.options.disableMouse ) {
			utils.addEvent(window, 'mousemove', this);
		}

		this.scroller._execEvent('beforeScrollStart');
	},

	_move: function (e) {
		var point = e.touches ? e.touches[0] : e,
			deltaX, deltaY,
			newX, newY,
			timestamp = utils.getTime();

		if ( !this.moved ) {
			this.scroller._execEvent('scrollStart');
		}

		this.moved = true;

		deltaX = point.pageX - this.lastPointX;
		this.lastPointX = point.pageX;

		deltaY = point.pageY - this.lastPointY;
		this.lastPointY = point.pageY;

		newX = this.x + deltaX;
		newY = this.y + deltaY;

		this._pos(newX, newY);

// INSERT POINT: indicator._move

		e.preventDefault();
		e.stopPropagation();
	},

	_end: function (e) {
		if ( !this.initiated ) {
			return;
		}

		this.initiated = false;

		e.preventDefault();
		e.stopPropagation();

		utils.removeEvent(window, 'touchmove', this);
		utils.removeEvent(window, utils.prefixPointerEvent('pointermove'), this);
		utils.removeEvent(window, 'mousemove', this);

		if ( this.scroller.options.snap ) {
			var snap = this.scroller._nearestSnap(this.scroller.x, this.scroller.y);

			var time = this.options.snapSpeed || Math.max(
					Math.max(
						Math.min(Math.abs(this.scroller.x - snap.x), 1000),
						Math.min(Math.abs(this.scroller.y - snap.y), 1000)
					), 300);

			if ( this.scroller.x != snap.x || this.scroller.y != snap.y ) {
				this.scroller.directionX = 0;
				this.scroller.directionY = 0;
				this.scroller.currentPage = snap;
				this.scroller.scrollTo(snap.x, snap.y, time, this.scroller.options.bounceEasing);
			}
		}

		if ( this.moved ) {
			this.scroller._execEvent('scrollEnd');
		}
	},

	transitionTime: function (time) {
		time = time || 0;
		this.indicatorStyle[utils.style.transitionDuration] = time + 'ms';

		if ( !time && utils.isBadAndroid ) {
			this.indicatorStyle[utils.style.transitionDuration] = '0.001s';
		}
	},

	transitionTimingFunction: function (easing) {
		this.indicatorStyle[utils.style.transitionTimingFunction] = easing;
	},

	refresh: function () {
		this.transitionTime();

		if ( this.options.listenX && !this.options.listenY ) {
			this.indicatorStyle.display = this.scroller.hasHorizontalScroll ? 'block' : 'none';
		} else if ( this.options.listenY && !this.options.listenX ) {
			this.indicatorStyle.display = this.scroller.hasVerticalScroll ? 'block' : 'none';
		} else {
			this.indicatorStyle.display = this.scroller.hasHorizontalScroll || this.scroller.hasVerticalScroll ? 'block' : 'none';
		}

		if ( this.scroller.hasHorizontalScroll && this.scroller.hasVerticalScroll ) {
			utils.addClass(this.wrapper, 'iScrollBothScrollbars');
			utils.removeClass(this.wrapper, 'iScrollLoneScrollbar');

			if ( this.options.defaultScrollbars && this.options.customStyle ) {
				if ( this.options.listenX ) {
					this.wrapper.style.right = '8px';
				} else {
					this.wrapper.style.bottom = '8px';
				}
			}
		} else {
			utils.removeClass(this.wrapper, 'iScrollBothScrollbars');
			utils.addClass(this.wrapper, 'iScrollLoneScrollbar');

			if ( this.options.defaultScrollbars && this.options.customStyle ) {
				if ( this.options.listenX ) {
					this.wrapper.style.right = '2px';
				} else {
					this.wrapper.style.bottom = '2px';
				}
			}
		}

		var r = this.wrapper.offsetHeight;	// force refresh

		if ( this.options.listenX ) {
			this.wrapperWidth = this.wrapper.clientWidth;
			if ( this.options.resize ) {
				this.indicatorWidth = Math.max(Math.round(this.wrapperWidth * this.wrapperWidth / (this.scroller.scrollerWidth || this.wrapperWidth || 1)), 8);
				this.indicatorStyle.width = this.indicatorWidth + 'px';
			} else {
				this.indicatorWidth = this.indicator.clientWidth;
			}

			this.maxPosX = this.wrapperWidth - this.indicatorWidth;

			if ( this.options.shrink == 'clip' ) {
				this.minBoundaryX = -this.indicatorWidth + 8;
				this.maxBoundaryX = this.wrapperWidth - 8;
			} else {
				this.minBoundaryX = 0;
				this.maxBoundaryX = this.maxPosX;
			}

			this.sizeRatioX = this.options.speedRatioX || (this.scroller.maxScrollX && (this.maxPosX / this.scroller.maxScrollX));	
		}

		if ( this.options.listenY ) {
			this.wrapperHeight = this.wrapper.clientHeight;
			if ( this.options.resize ) {
				this.indicatorHeight = Math.max(Math.round(this.wrapperHeight * this.wrapperHeight / (this.scroller.scrollerHeight || this.wrapperHeight || 1)), 8);
				this.indicatorStyle.height = this.indicatorHeight + 'px';
			} else {
				this.indicatorHeight = this.indicator.clientHeight;
			}

			this.maxPosY = this.wrapperHeight - this.indicatorHeight;

			if ( this.options.shrink == 'clip' ) {
				this.minBoundaryY = -this.indicatorHeight + 8;
				this.maxBoundaryY = this.wrapperHeight - 8;
			} else {
				this.minBoundaryY = 0;
				this.maxBoundaryY = this.maxPosY;
			}

			this.maxPosY = this.wrapperHeight - this.indicatorHeight;
			this.sizeRatioY = this.options.speedRatioY || (this.scroller.maxScrollY && (this.maxPosY / this.scroller.maxScrollY));
		}

		this.updatePosition();
	},

	updatePosition: function () {
		var x = this.options.listenX && Math.round(this.sizeRatioX * this.scroller.x) || 0,
			y = this.options.listenY && Math.round(this.sizeRatioY * this.scroller.y) || 0;

		if ( !this.options.ignoreBoundaries ) {
			if ( x < this.minBoundaryX ) {
				if ( this.options.shrink == 'scale' ) {
					this.width = Math.max(this.indicatorWidth + x, 8);
					this.indicatorStyle.width = this.width + 'px';
				}
				x = this.minBoundaryX;
			} else if ( x > this.maxBoundaryX ) {
				if ( this.options.shrink == 'scale' ) {
					this.width = Math.max(this.indicatorWidth - (x - this.maxPosX), 8);
					this.indicatorStyle.width = this.width + 'px';
					x = this.maxPosX + this.indicatorWidth - this.width;
				} else {
					x = this.maxBoundaryX;
				}
			} else if ( this.options.shrink == 'scale' && this.width != this.indicatorWidth ) {
				this.width = this.indicatorWidth;
				this.indicatorStyle.width = this.width + 'px';
			}

			if ( y < this.minBoundaryY ) {
				if ( this.options.shrink == 'scale' ) {
					this.height = Math.max(this.indicatorHeight + y * 3, 8);
					this.indicatorStyle.height = this.height + 'px';
				}
				y = this.minBoundaryY;
			} else if ( y > this.maxBoundaryY ) {
				if ( this.options.shrink == 'scale' ) {
					this.height = Math.max(this.indicatorHeight - (y - this.maxPosY) * 3, 8);
					this.indicatorStyle.height = this.height + 'px';
					y = this.maxPosY + this.indicatorHeight - this.height;
				} else {
					y = this.maxBoundaryY;
				}
			} else if ( this.options.shrink == 'scale' && this.height != this.indicatorHeight ) {
				this.height = this.indicatorHeight;
				this.indicatorStyle.height = this.height + 'px';
			}
		}

		this.x = x;
		this.y = y;

		if ( this.scroller.options.useTransform ) {
			this.indicatorStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.scroller.translateZ;
		} else {
			this.indicatorStyle.left = x + 'px';
			this.indicatorStyle.top = y + 'px';
		}
	},

	_pos: function (x, y) {
		if ( x < 0 ) {
			x = 0;
		} else if ( x > this.maxPosX ) {
			x = this.maxPosX;
		}

		if ( y < 0 ) {
			y = 0;
		} else if ( y > this.maxPosY ) {
			y = this.maxPosY;
		}

		x = this.options.listenX ? Math.round(x / this.sizeRatioX) : this.scroller.x;
		y = this.options.listenY ? Math.round(y / this.sizeRatioY) : this.scroller.y;

		this.scroller.scrollTo(x, y);
	},

	fade: function (val, hold) {
		if ( hold && !this.visible ) {
			return;
		}

		clearTimeout(this.fadeTimeout);
		this.fadeTimeout = null;

		var time = val ? 250 : 500,
			delay = val ? 0 : 300;

		val = val ? '1' : '0';

		this.wrapperStyle[utils.style.transitionDuration] = time + 'ms';

		this.fadeTimeout = setTimeout((function (val) {
			this.wrapperStyle.opacity = val;
			this.visible = +val;
		}).bind(this, val), delay);
	}
};

IScroll.utils = utils;

// if ( typeof module != 'undefined' && module.exports ) {
// 	module.exports = IScroll;
// } else {
// 	window.IScroll = IScroll;
// }
	
	return IScroll;
});
/*! touchjs v0.2.14  2014-08-05 */
define("zui/mixin/touch",function(require){

'use strict';

var utils = {};

utils.PCevts = {
    'touchstart': 'mousedown',
    'touchmove': 'mousemove',
    'touchend': 'mouseup',
    'touchcancel': 'mouseout'
};

utils.hasTouch = ('ontouchstart' in window);

utils.getType = function(obj) {
    return Object.prototype.toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
};

utils.getSelector = function(el) {
    if (el.id) {
        return "#" + el.id;
    }
    if (el.className) {
        var cns = el.className.split(/\s+/);
        return "." + cns.join(".");
    } else if (el === document) {
        return "body";
    } else {
        return el.tagName.toLowerCase();
    }
};

utils.matchSelector = function(target, selector) {
    return target.webkitMatchesSelector(selector);
};

utils.getEventListeners = function(el) {
    return el.listeners;
};

utils.getPCevts = function(evt) {
    return this.PCevts[evt] || evt;
};

utils.forceReflow = function() {
    var tempDivID = "reflowDivBlock";
    var domTreeOpDiv = document.getElementById(tempDivID);
    if (!domTreeOpDiv) {
        domTreeOpDiv = document.createElement("div");
        domTreeOpDiv.id = tempDivID;
        document.body.appendChild(domTreeOpDiv);
    }
    var parentNode = domTreeOpDiv.parentNode;
    var nextSibling = domTreeOpDiv.nextSibling;
    parentNode.removeChild(domTreeOpDiv);
    parentNode.insertBefore(domTreeOpDiv, nextSibling);
};

utils.simpleClone = function(obj) {
    return Object.create(obj);
};

utils.getPosOfEvent = function(ev) {
    if (this.hasTouch) {
        var posi = [];
        var src = null;

        for (var t = 0, len = ev.touches.length; t < len; t++) {
            src = ev.touches[t];
            posi.push({
                x: src.pageX,
                y: src.pageY
            });
        }
        return posi;
    } else {
        return [{
            x: ev.pageX,
            y: ev.pageY
        }];
    }
};

utils.getDistance = function(pos1, pos2) {
    var x = pos2.x - pos1.x,
        y = pos2.y - pos1.y;
    return Math.sqrt((x * x) + (y * y));
};

utils.getFingers = function(ev) {
    return ev.touches ? ev.touches.length : 1;
};

utils.calScale = function(pstart, pmove) {
    if (pstart.length >= 2 && pmove.length >= 2) {
        var disStart = this.getDistance(pstart[1], pstart[0]);
        var disEnd = this.getDistance(pmove[1], pmove[0]);

        return disEnd / disStart;
    }
    return 1;
};

utils.getAngle = function(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
};

utils.getAngle180 = function(p1, p2) {
    var agl = Math.atan((p2.y - p1.y) * -1 / (p2.x - p1.x)) * (180 / Math.PI);
    return (agl < 0 ? (agl + 180) : agl);
};

utils.getDirectionFromAngle = function(agl) {
    
    var directions = {
        up: agl < -15 && agl > -165,
        down: agl >= 15 && agl < 165,
        left: agl >= 165 || agl <= -165,
        right: agl >= -15 && agl <= 15
    };
    for (var key in directions) {
        if (directions[key]) return key;
    }
    return null;
};

utils.getXYByElement = function(el) {
    var left = 0,
        top = 0;

    while (el.offsetParent) {
        left += el.offsetLeft;
        top += el.offsetTop;
        el = el.offsetParent;
    }
    return {
        left: left,
        top: top
    };
};

utils.reset = function() {
    startEvent = moveEvent = endEvent = null;
    __tapped = __touchStart = startSwiping = startPinch = false;
    startDrag = false;
    pos = {};
    __rotation_single_finger = false;
};

utils.isTouchMove = function(ev) {
    return (ev.type === 'touchmove' || ev.type === 'mousemove');
};

utils.isTouchEnd = function(ev) {
    return (ev.type === 'touchend' || ev.type === 'mouseup' || ev.type === 'touchcancel');
};

utils.env = (function() {
    var os = {}, ua = navigator.userAgent,
        android = ua.match(/(Android)[\s\/]+([\d\.]+)/),
        ios = ua.match(/(iPad|iPhone|iPod)\s+OS\s([\d_\.]+)/),
        wp = ua.match(/(Windows\s+Phone)\s([\d\.]+)/),
        isWebkit = /WebKit\/[\d.]+/i.test(ua),
        isSafari = ios ? (navigator.standalone ? isWebkit : (/Safari/i.test(ua) && !/CriOS/i.test(ua) && !/MQQBrowser/i.test(ua))) : false;
    if (android) {
        os.android = true;
        os.version = android[2];
    }
    if (ios) {
        os.ios = true;
        os.version = ios[2].replace(/_/g, '.');
        os.ios7 = /^7/.test(os.version);
        if (ios[1] === 'iPad') {
            os.ipad = true;
        } else if (ios[1] === 'iPhone') {
            os.iphone = true;
            os.iphone5 = screen.height == 568;
        } else if (ios[1] === 'iPod') {
            os.ipod = true;
        }
    }
    if (wp) {
        os.wp = true;
        os.version = wp[2];
        os.wp8 = /^8/.test(os.version);
    }
    if (isWebkit) {
        os.webkit = true;
    }
    if (isSafari) {
        os.safari = true;
    }
    return os;
})();

/** 底层事件绑定/代理支持  */
var engine = {
    proxyid: 0,
    proxies: [],
    trigger: function(el, evt, detail) {

        detail = detail || {};
        var e, opt = {
                bubbles: true,
                cancelable: true,
                detail: detail
            };

        try {
            if (typeof CustomEvent !== 'undefined') {
                e = new CustomEvent(evt, opt);
                if (el) {
                    el.dispatchEvent(e);
                }
            } else {
                e = document.createEvent("CustomEvent");
                e.initCustomEvent(evt, true, true, detail);
                if (el) {
                    el.dispatchEvent(e);
                }
            }
        } catch (ex) {
            console.warn("Touch.js is not supported by environment.");
        }
    },
    bind: function(el, evt, handler) {
        el.listeners = el.listeners || {};
        if (!el.listeners[evt]) {
            el.listeners[evt] = [handler];
        } else {
            el.listeners[evt].push(handler);
        }
        var proxy = function(e) {
            if (utils.env.ios7) {
                utils.forceReflow();
            }
            e.originEvent = e;
            for (var p in e.detail) {
                if (p !== 'type') {
                    e[p] = e.detail[p];
                }
            }
            e.startRotate = function() {
                __rotation_single_finger = true;
            };
            var returnValue = handler.call(e.target, e);
            if (typeof returnValue !== "undefined" && !returnValue) {
                e.stopPropagation();
                e.preventDefault();
            }
        };
        handler.proxy = handler.proxy || {};
        if (!handler.proxy[evt]) {
            handler.proxy[evt] = [this.proxyid++];
        } else {
            handler.proxy[evt].push(this.proxyid++);
        }
        this.proxies.push(proxy);
        if (el.addEventListener) {
            el.addEventListener(evt, proxy, false);
        }
    },
    unbind: function(el, evt, handler) {
        if (!handler) {
            var handlers = el.listeners[evt];
            if (handlers && handlers.length) {
                handlers.forEach(function(handler) {
                    el.removeEventListener(evt, handler, false);
                });
            }
        } else {
            var proxyids = handler.proxy[evt];
            if (proxyids && proxyids.length) {
                proxyids.forEach(function(proxyid) {
                    if (el.removeEventListener) {
                        el.removeEventListener(evt, this.proxies[this.proxyid], false);
                    }
                });
            }
        }
    },
    delegate: function(el, evt, sel, handler) {
        var proxy = function(e) {
            var target, returnValue;
            e.originEvent = e;
            for (var p in e.detail) {
                if (p !== 'type') {
                    e[p] = e.detail[p];
                }
            }
            e.startRotate = function() {
                __rotation_single_finger = true;
            };
            var integrateSelector = utils.getSelector(el) + " " + sel;
            var match = utils.matchSelector(e.target, integrateSelector);
            var ischild = utils.matchSelector(e.target, integrateSelector + " " + e.target.nodeName);
            if (!match && ischild) {
                if (utils.env.ios7) {
                    utils.forceReflow();
                }
                target = e.target;
                while (!utils.matchSelector(target, integrateSelector)) {
                    target = target.parentNode;
                }
                returnValue = handler.call(e.target, e);
                if (typeof returnValue !== "undefined" && !returnValue) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            } else {
                if (utils.env.ios7) {
                    utils.forceReflow();
                }
                if (match || ischild) {
                    returnValue = handler.call(e.target, e);
                    if (typeof returnValue !== "undefined" && !returnValue) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                }
            }
        };
        handler.proxy = handler.proxy || {};
        if (!handler.proxy[evt]) {
            handler.proxy[evt] = [this.proxyid++];
        } else {
            handler.proxy[evt].push(this.proxyid++);
        }
        this.proxies.push(proxy);
        el.listeners = el.listeners || {};
        if (!el.listeners[evt]) {
            el.listeners[evt] = [proxy];
        } else {
            el.listeners[evt].push(proxy);
        }
        if (el.addEventListener) {
            el.addEventListener(evt, proxy, false);
        }
    },
    undelegate: function(el, evt, sel, handler) {
        if (!handler) {
            var listeners = el.listeners[evt];
            listeners.forEach(function(proxy) {
                el.removeEventListener(evt, proxy, false);
            });
        } else {
            var proxyids = handler.proxy[evt];
            if (proxyids.length) {
                proxyids.forEach(function(proxyid) {
                    if (el.removeEventListener) {
                        el.removeEventListener(evt, this.proxies[this.proxyid], false);
                    }
                });
            }
        }
    }
};

var config = {
    tap: true,
    doubleTap: true,
    tapMaxDistance: 10,
    hold: true,
    tapTime: 200,
    holdTime: 650,
    maxDoubleTapInterval: 300,
    swipe: true,
    swipeTime: 300,
    swipeMinDistance: 18,
    swipeFactor: 5,
    drag: true,
    pinch: true,
    minScaleRate: 0,
    minRotationAngle: 0
};

var smrEventList = {
    TOUCH_START: 'touchstart',
    TOUCH_MOVE: 'touchmove',
    TOUCH_END: 'touchend',
    TOUCH_CANCEL: 'touchcancel',
    MOUSE_DOWN: 'mousedown',
    MOUSE_MOVE: 'mousemove',
    MOUSE_UP: 'mouseup',
    CLICK: 'click',
    PINCH_START: 'pinchstart',
    PINCH_END: 'pinchend',
    PINCH: 'pinch',
    PINCH_IN: 'pinchin',
    PINCH_OUT: 'pinchout',
    ROTATION_LEFT: 'rotateleft',
    ROTATION_RIGHT: 'rotateright',
    ROTATION: 'rotate',
    SWIPE_START: 'swipestart',
    SWIPING: 'swiping',
    SWIPE_END: 'swipeend',
    SWIPE_LEFT: 'swipeleft',
    SWIPE_RIGHT: 'swiperight',
    SWIPE_UP: 'swipeup',
    SWIPE_DOWN: 'swipedown',
    SWIPE: 'swipe',
    DRAG: 'drag',
    DRAGSTART: 'dragstart',
    DRAGEND: 'dragend',
    HOLD: 'hold',
    TAP: 'tap',
    DOUBLE_TAP: 'doubletap'
};

/** 手势识别 */
var pos = {
    start: null,
    move: null,
    end: null
};

var startTime = 0;
var fingers = 0;
var startEvent = null;
var moveEvent = null;
var endEvent = null;
var startSwiping = false;
var startPinch = false;
var startDrag = false;

var __offset = {};
var __touchStart = false;
var __holdTimer = null;
var __tapped = false;
var __lastTapEndTime = null;
var __tapTimer = null;

var __scale_last_rate = 1;
var __rotation_single_finger = false;
var __rotation_single_start = [];
var __initial_angle = 0;
var __rotation = 0;

var __prev_tapped_end_time = 0;
var __prev_tapped_pos = null;

var gestures = {
    getAngleDiff: function(currentPos) {
        var diff = parseInt(__initial_angle - utils.getAngle180(currentPos[0], currentPos[1]), 10);
        var count = 0;

        while (Math.abs(diff - __rotation) > 90 && count++ < 50) {
            if (__rotation < 0) {
                diff -= 180;
            } else {
                diff += 180;
            }
        }
        __rotation = parseInt(diff, 10);
        return __rotation;
    },
    pinch: function(ev) {
        var el = ev.target;
        if (config.pinch) {
            if (!__touchStart) return;
            if (utils.getFingers(ev) < 2) {
                if (!utils.isTouchEnd(ev)) return;
            }
            var scale = utils.calScale(pos.start, pos.move);
            var rotation = this.getAngleDiff(pos.move);
            var eventObj = {
                type: '',
                originEvent: ev,
                scale: scale,
                rotation: rotation,
                direction: (rotation > 0 ? 'right' : 'left'),
                fingersCount: utils.getFingers(ev)
            };
            if (!startPinch) {
                startPinch = true;
                eventObj.fingerStatus = "start";
                engine.trigger(el, smrEventList.PINCH_START, eventObj);
            } else if (utils.isTouchMove(ev)) {
                eventObj.fingerStatus = "move";
                engine.trigger(el, smrEventList.PINCH, eventObj);
            } else if (utils.isTouchEnd(ev)) {
                eventObj.fingerStatus = "end";
                engine.trigger(el, smrEventList.PINCH_END, eventObj);
                utils.reset();
            }

            if (Math.abs(1 - scale) > config.minScaleRate) {
                var scaleEv = utils.simpleClone(eventObj);

                //手势放大, 触发pinchout事件
                var scale_diff = 0.00000000001; //防止touchend的scale与__scale_last_rate相等，不触发事件的情况。
                if (scale > __scale_last_rate) {
                    __scale_last_rate = scale - scale_diff;
                    engine.trigger(el, smrEventList.PINCH_OUT, scaleEv, false);
                } //手势缩小,触发pinchin事件
                else if (scale < __scale_last_rate) {
                    __scale_last_rate = scale + scale_diff;
                    engine.trigger(el, smrEventList.PINCH_IN, scaleEv, false);
                }

                if (utils.isTouchEnd(ev)) {
                    __scale_last_rate = 1;
                }
            }

            if (Math.abs(rotation) > config.minRotationAngle) {
                var rotationEv = utils.simpleClone(eventObj),
                    eventType;

                eventType = rotation > 0 ? smrEventList.ROTATION_RIGHT : smrEventList.ROTATION_LEFT;
                engine.trigger(el, eventType, rotationEv, false);
                engine.trigger(el, smrEventList.ROTATION, eventObj);
            }

        }
    },
    rotateSingleFinger: function(ev) {
        var el = ev.target;
        if (__rotation_single_finger && utils.getFingers(ev) < 2) {
            if (!pos.move) return;
            if (__rotation_single_start.length < 2) {
                var docOff = utils.getXYByElement(el);

                __rotation_single_start = [{
                        x: docOff.left + el.offsetWidth / 2,
                        y: docOff.top + el.offsetHeight / 2
                    },
                    pos.move[0]
                ];
                __initial_angle = parseInt(utils.getAngle180(__rotation_single_start[0], __rotation_single_start[1]), 10);
            }
            var move = [__rotation_single_start[0], pos.move[0]];
            var rotation = this.getAngleDiff(move);
            var eventObj = {
                type: '',
                originEvent: ev,
                rotation: rotation,
                direction: (rotation > 0 ? 'right' : 'left'),
                fingersCount: utils.getFingers(ev)
            };
            if (utils.isTouchMove(ev)) {
                eventObj.fingerStatus = "move";
            } else if (utils.isTouchEnd(ev) || ev.type === 'mouseout') {
                eventObj.fingerStatus = "end";
                engine.trigger(el, smrEventList.PINCH_END, eventObj);
                utils.reset();
            }
            var eventType = rotation > 0 ? smrEventList.ROTATION_RIGHT : smrEventList.ROTATION_LEFT;
            engine.trigger(el, eventType, eventObj);
            engine.trigger(el, smrEventList.ROTATION, eventObj);
        }
    },
    swipe: function(ev) {
        var el = ev.target;
        if (!__touchStart || !pos.move || utils.getFingers(ev) > 1) {
            return;
        }

        var now = Date.now();
        var touchTime = now - startTime;
        var distance = utils.getDistance(pos.start[0], pos.move[0]);
        var position = {
            x: pos.move[0].x - __offset.left,
            y: pos.move[0].y - __offset.top
        };
        var angle = utils.getAngle(pos.start[0], pos.move[0]);
        var direction = utils.getDirectionFromAngle(angle);
        //console.log(angle)
      //  alert(direction)
        var touchSecond = touchTime / 1000;
        var factor = ((10 - config.swipeFactor) * 10 * touchSecond * touchSecond);
        var eventObj = {
            type: smrEventList.SWIPE,
            originEvent: ev,
            position: position,
            direction: direction,
            distance: distance,
            distanceX: pos.move[0].x - pos.start[0].x,
            distanceY: pos.move[0].y - pos.start[0].y,
            x: pos.move[0].x - pos.start[0].x,
            y: pos.move[0].y - pos.start[0].y,
            angle: angle,
            duration: touchTime,
            fingersCount: utils.getFingers(ev),
            factor: factor
        };
        if (config.swipe) {
            var swipeTo = function() {
                var elt = smrEventList;
                switch (direction) {
                    case 'up':
                        engine.trigger(el, elt.SWIPE_UP, eventObj);
                        break;
                    case 'down':
                        engine.trigger(el, elt.SWIPE_DOWN, eventObj);
                        break;
                    case 'left':
                        engine.trigger(el, elt.SWIPE_LEFT, eventObj);
                        break;
                    case 'right':
                        engine.trigger(el, elt.SWIPE_RIGHT, eventObj);
                        break;
                }
            };
            if (!startSwiping) {
                eventObj.fingerStatus = eventObj.swipe = 'start';
                startSwiping = true;
                engine.trigger(el, smrEventList.SWIPE_START, eventObj);
            } else if (utils.isTouchMove(ev)) {
                eventObj.fingerStatus = eventObj.swipe = 'move';
                engine.trigger(el, smrEventList.SWIPING, eventObj);

                if (touchTime > config.swipeTime && touchTime < config.swipeTime + 50 && distance > config.swipeMinDistance) {
                    swipeTo();
                    engine.trigger(el, smrEventList.SWIPE, eventObj, false);
                }
            } else if (utils.isTouchEnd(ev) || ev.type === 'mouseout') {
                eventObj.fingerStatus = eventObj.swipe = 'end';
                engine.trigger(el, smrEventList.SWIPE_END, eventObj);

                if (config.swipeTime > touchTime && distance > config.swipeMinDistance) {
                    swipeTo();
                    engine.trigger(el, smrEventList.SWIPE, eventObj, false);
                }
            }
        }

        if (config.drag) {
            if (!startDrag) {
                eventObj.fingerStatus = eventObj.swipe = 'start';
                startDrag = true;
                engine.trigger(el, smrEventList.DRAGSTART, eventObj);
            } else if (utils.isTouchMove(ev)) {
                eventObj.fingerStatus = eventObj.swipe = 'move';
                engine.trigger(el, smrEventList.DRAG, eventObj);
            } else if (utils.isTouchEnd(ev)) {
                eventObj.fingerStatus = eventObj.swipe = 'end';
                engine.trigger(el, smrEventList.DRAGEND, eventObj);
            }

        }
    },
    tap: function(ev) {
        var el = ev.target;
        if (config.tap) {
            var now = Date.now();
            var touchTime = now - startTime;
            var distance = utils.getDistance(pos.start[0], pos.move ? pos.move[0] : pos.start[0]);

            clearTimeout(__holdTimer);
            var isDoubleTap = (function() {
                if (__prev_tapped_pos && config.doubleTap && (startTime - __prev_tapped_end_time) < config.maxDoubleTapInterval) {
                    var doubleDis = utils.getDistance(__prev_tapped_pos, pos.start[0]);
                    if (doubleDis < 16) return true;
                }
                return false;
            })();

            if (isDoubleTap) {
                clearTimeout(__tapTimer);
                engine.trigger(el, smrEventList.DOUBLE_TAP, {
                    type: smrEventList.DOUBLE_TAP,
                    originEvent: ev,
                    position: pos.start[0]
                });
                return;
            }

            if (config.tapMaxDistance < distance) return;

            if (config.holdTime > touchTime && utils.getFingers(ev) <= 1) {
                __tapped = true;
                __prev_tapped_end_time = now;
                __prev_tapped_pos = pos.start[0];
                __tapTimer = setTimeout(function() {
                        engine.trigger(el, smrEventList.TAP, {
                            type: smrEventList.TAP,
                            originEvent: ev,
                            fingersCount: utils.getFingers(ev),
                            position: __prev_tapped_pos
                        });
                    },
                    config.tapTime);
            }
        }
    },
    hold: function(ev) {
        var el = ev.target;
        if (config.hold) {
            clearTimeout(__holdTimer);

            __holdTimer = setTimeout(function() {
                    if (!pos.start) return;
                    var distance = utils.getDistance(pos.start[0], pos.move ? pos.move[0] : pos.start[0]);
                    if (config.tapMaxDistance < distance) return;

                    if (!__tapped) {
                        engine.trigger(el, "hold", {
                            type: 'hold',
                            originEvent: ev,
                            fingersCount: utils.getFingers(ev),
                            position: pos.start[0]
                        });
                    }
                },
                config.holdTime);
        }
    }
};

var handlerOriginEvent = function(ev) {

    var el = ev.target;
    switch (ev.type) {
        case 'touchstart':
        case 'mousedown':
            __rotation_single_start = [];
            __touchStart = true;
            if (!pos.start || pos.start.length < 2) {
                pos.start = utils.getPosOfEvent(ev);
            }
            if (utils.getFingers(ev) >= 2) {
                __initial_angle = parseInt(utils.getAngle180(pos.start[0], pos.start[1]), 10);
            }

            startTime = Date.now();
            startEvent = ev;
            __offset = {};

            var box = el.getBoundingClientRect();
            var docEl = document.documentElement;
            __offset = {
                top: box.top + (window.pageYOffset || docEl.scrollTop) - (docEl.clientTop || 0),
                left: box.left + (window.pageXOffset || docEl.scrollLeft) - (docEl.clientLeft || 0)
            };

            gestures.hold(ev);
            break;
        case 'touchmove':
        case 'mousemove':
            if (!__touchStart || !pos.start) return;
            pos.move = utils.getPosOfEvent(ev);
            if (utils.getFingers(ev) >= 2) {
                gestures.pinch(ev);
            } else if (__rotation_single_finger) {
                gestures.rotateSingleFinger(ev);
            } else {
                gestures.swipe(ev);
            }
            break;
        case 'touchend':
        case 'touchcancel':
        case 'mouseup':
        case 'mouseout':
            if (!__touchStart) return;
            endEvent = ev;

            if (startPinch) {
                gestures.pinch(ev);
            } else if (__rotation_single_finger) {
                gestures.rotateSingleFinger(ev);
            } else if (startSwiping) {
                gestures.swipe(ev);
            } else {
                gestures.tap(ev);
            }

            utils.reset();
            __initial_angle = 0;
            __rotation = 0;
            if (ev.touches && ev.touches.length === 1) {
                __touchStart = true;
                __rotation_single_finger = true;
            }
            break;
    }
};

var _on = function() {

    var evts, handler, evtMap, sel, args = arguments;
    if (args.length < 2 || args > 4) {
        return console.error("unexpected arguments!");
    }
    var els = utils.getType(args[0]) === 'string' ? document.querySelectorAll(args[0]) : args[0];
    els = els.length ? Array.prototype.slice.call(els) : [els];
    //事件绑定
    if (args.length === 3 && utils.getType(args[1]) === 'string') {
        evts = args[1].split(" ");
        handler = args[2];
        evts.forEach(function(evt) {
            if (!utils.hasTouch) {
                evt = utils.getPCevts(evt);
            }
            els.forEach(function(el) {
                engine.bind(el, evt, handler);
            });
        });
        return;
    }

    function evtMapDelegate(evt) {
        if (!utils.hasTouch) {
            evt = utils.getPCevts(evt);
        }
        els.forEach(function(el) {
            engine.delegate(el, evt, sel, evtMap[evt]);
        });
    }
    //mapEvent delegate
    if (args.length === 3 && utils.getType(args[1]) === 'object') {
        evtMap = args[1];
        sel = args[2];
        for (var evt1 in evtMap) {
            evtMapDelegate(evt1);
        }
        return;
    }

    function evtMapBind(evt) {
        if (!utils.hasTouch) {
            evt = utils.getPCevts(evt);
        }
        els.forEach(function(el) {
            engine.bind(el, evt, evtMap[evt]);
        });
    }

    //mapEvent bind
    if (args.length === 2 && utils.getType(args[1]) === 'object') {
        evtMap = args[1];
        for (var evt2 in evtMap) {
            evtMapBind(evt2);
        }
        return;
    }

    //兼容factor config
    if (args.length === 4 && utils.getType(args[2]) === "object") {
        evts = args[1].split(" ");
        handler = args[3];
        evts.forEach(function(evt) {
            if (!utils.hasTouch) {
                evt = utils.getPCevts(evt);
            }
            els.forEach(function(el) {
                engine.bind(el, evt, handler);
            });
        });
        return;
    }

    //事件代理
    if (args.length === 4) {
        var el = els[0];
        evts = args[1].split(" ");
        sel = args[2];
        handler = args[3];
        evts.forEach(function(evt) {
            if (!utils.hasTouch) {
                evt = utils.getPCevts(evt);
            }
            engine.delegate(el, evt, sel, handler);
        });
        return;
    }
};

var _off = function() {
    var evts, handler;
    var args = arguments;
    if (args.length < 1 || args.length > 4) {
        return console.error("unexpected arguments!");
    }
    var els = utils.getType(args[0]) === 'string' ? document.querySelectorAll(args[0]) : args[0];
    els = els.length ? Array.prototype.slice.call(els) : [els];

    if (args.length === 1 || args.length === 2) {
        els.forEach(function(el) {
            evts = args[1] ? args[1].split(" ") : Object.keys(el.listeners);
            if (evts.length) {
                evts.forEach(function(evt) {
                    if (!utils.hasTouch) {
                        evt = utils.getPCevts(evt);
                    }
                    engine.unbind(el, evt);
                    engine.undelegate(el, evt);
                });
            }
        });
        return;
    }

    if (args.length === 3 && utils.getType(args[2]) === 'function') {
        handler = args[2];
        els.forEach(function(el) {
            evts = args[1].split(" ");
            evts.forEach(function(evt) {
                if (!utils.hasTouch) {
                    evt = utils.getPCevts(evt);
                }
                engine.unbind(el, evt, handler);
            });
        });
        return;
    }

    if (args.length === 3 && utils.getType(args[2]) === 'string') {
        var sel = args[2];
        els.forEach(function(el) {
            evts = args[1].split(" ");
            evts.forEach(function(evt) {
                if (!utils.hasTouch) {
                    evt = utils.getPCevts(evt);
                }
                engine.undelegate(el, evt, sel);
            });
        });
        return;
    }

    if (args.length === 4) {
        handler = args[3];
        els.forEach(function(el) {
            evts = args[1].split(" ");
            evts.forEach(function(evt) {
                if (!utils.hasTouch) {
                    evt = utils.getPCevts(evt);
                }
                engine.undelegate(el, evt, sel, handler);
            });
        });
        return;
    }
};

var _dispatch = function(el, evt, detail) {
    var args = arguments;
    if (!utils.hasTouch) {
        evt = utils.getPCevts(evt);
    }
    var els = utils.getType(args[0]) === 'string' ? document.querySelectorAll(args[0]) : args[0];
    els = els.length ? Array.prototype.call(els) : [els];

    els.forEach(function(el) {
        engine.trigger(el, evt, detail);
    });
};

    //init gesture
    function init() {

        var mouseEvents = 'mouseup mousedown mousemove mouseout',
            touchEvents = 'touchstart touchmove touchend touchcancel';
        var bindingEvents = utils.hasTouch ? touchEvents : mouseEvents;

        bindingEvents.split(" ").forEach(function(evt) {
            document.addEventListener(evt, handlerOriginEvent, false);
        });
    }

    init();

    var exports = {};

    exports.on = exports.bind = exports.live = _on;
    exports.off = exports.unbind = exports.die = _off;
    exports.config = config;
    exports.trigger = _dispatch;

    return exports;
});
define("zui/mixin/pagetransition",function(require,exports,module){

	// Avoid repeated callbacks
	var PageTransition={};
	var store = {};
	var root=window;
	// Create local references to array methods we'll want to use later.
	var array = [];
	var slice = array.slice;
	
	// Is it a simple selector, from jQuery
	var isSimple = /^.[^:#\[\.,]*$/
	
	// Is it suppory history API
	var supportHistory = "pushState" in history && "replaceState" in history;
		
	PageTransition.support = supportHistory;
	
	if (supportHistory == false) return PageTransition;
	
	var hasInited = false;
	
	/**
	 * Current version of the library. Keep in sync with `package.json`.
	 *
	 * @type string
	**/
	PageTransition.VERSION = '1.1.8';
	
	/**
	 * Whether catch attribute of href from element with tag 'a'
	 * If the value set to false, jump links in a refresh form(not slide)
	 * In most cases, you do not need to care about this parameter. 
	   Except some special pages that should refresh all links, as test/index.html show.
	   However, if your only want several links refesh, you can use data-ajax="false" or data-rel="external"
	 *
	 * @type boolean
	**/
	PageTransition.captureLink = true;
	
	/**
	 * The root of transition-callback
	 * Default value is 'root', you can consider as window-object. 
	   However, there are may many callbacks, it's impossible that all functions are global function.
	   We may custom a global object to store our callbacks, such as:
	   Callback = {
		 fun1: function() {}, 
		 fun2: function() {}, 
		 fun3: function() {},  
	   }
	   In this case, the value of 'obilebone.rootTransition' should set Callback;
	 *
	 * @type object
	**/
	PageTransition.rootTransition = root;
	
	/**
	 * Whether merge(vs cover) global callback and local callback
	 *
	 * @type boolean
	**/
	PageTransition.mergeCallback = true;
	
	/**
	 *  for mark page element
	 *
	 * @type string
	**/
	PageTransition.classPage = "page";
	/**
	 * className for mark mask element
	 *
	 * @type string
	**/
	PageTransition.classMask = "mask";
	/**
	 * Whether url changes when history changes
	 * If this value is false, the url will be no change.
	 *
	 * @type boolean
	**/
	PageTransition.pushStateEnabled = true;
	
	if (// When running inside a FF iframe, calling replaceState causes an error. So set 'pushStateEnabled = false' 
		(window.navigator.userAgent.indexOf( "Firefox" ) >= 0 && window.top !== window)
	) {
		PageTransition.pushStateEnabled = false;
	}
	
	
	/**
	 * Function for transition
	 * In most cases, you are unnecessary to use this function , unlike PageTransition.createPage
	 
	 * @params  pageInto: dom-object. Element which will transform into. - Necessary
	            pageOut:  dom-object. Element which will transform out.   - Optional
			    back:     boolean.    Direction of transition.          - Optional
			    options:  object.     Cover or add parameters.           - Optional
	 * @returns undefined
	 * @example PageTransition.transition(element);
	            PageTransition.transition(element1, element2);
		        PageTransition.transition(element1, element2, true);
		        PageTransition.transition(element1, element2, { id: "only" });
		        PageTransition.transition(element1, element2, true, { id: "only" });
	**/
	PageTransition.transition = function(pageInto, pageOut, back, options) {
		if (arguments.length == 0 || pageInto == pageOut) return;
		if (arguments.length == 3 && isNaN(back * 1) == true) {
			options = back;
			back = false;
		};
		//if those parameters is missing
		pageOut = pageOut || null, back = back || false, options = options || {};
		
		// defaults parameters
		var defaults = {
			// the value of callback is a key name, and the host is root here. 
			// eg. if the name of animationstart is 'doLoading', so the script will execute 'root.doLoading()'
			// By default, the value of root is 'window'
			root: this.rootTransition,
			// the form of transition, the value (eg. 'slide') will be a className to add or remove. 
			// of course, u can set to other valeu, for example, 'fade' or 'flip'. However, u shou add corresponding CSS3 code.
			form: this.form || 'slide',
			// 'animationstart/animationend/...' are callbacks params
			// Note: those all global callbacks!
			onpagefirstinto: this.onpagefirstinto,
			animationstart: this.animationstart,
			animationend: this.animationend,
			fallback: this.fallback,
			callback: this.callback
		}, params = function(element) {
			if (!element || !element.getAttribute) return {};
			
			var _params = {}, _dataparams = _queryToObject(element.getAttribute("data-params") || '');
			
			// rules as follow:
			// data-* > data-params > options > defaults	
			["title", "root", "form"].forEach(function(key) {
				
				_params[key] = element.getAttribute("data-" + key) || _dataparams[key] || options[key] || defaults[key];
			});
			
			if (typeof _params.root == "string") {
				_params.root = PageTransition.getFunction(_params.root);
			}
			
			["onpagefirstinto", "callback", "fallback", "animationstart", "animationend"].forEach(function(key) {
				if (PageTransition.mergeCallback == true && typeof defaults[key] == "function") {
					// merge global callback
					var local_function_key = element.getAttribute("data-" + key) || _dataparams[key];
					if (typeof _params.root[local_function_key] == "function") {		
						_params[key] = function() {
							defaults[key].apply(null, arguments);
							_params.root[local_function_key].apply(null, arguments);
						}
					} else if (typeof options[key] == "function") {
						_params[key] = function() {
							defaults[key].apply(null, arguments);
							options[key].apply(null, arguments);
						}
					} else {
						_params[key] = defaults[key];
					}
				} else {
					// replace global callback
					_params[key] = element.getAttribute("data-" + key) || _dataparams[key] || options[key] || defaults[key];
				}
			});
			
			
			return _params;
		};
		
		// get params of each 
		var params_out = params(pageOut), params_in = params(pageInto);
		
		if (pageOut != null && pageOut.classList) {
			// do transition
			pageOut.classList.add("out");
			pageOut.classList.add(params_out.form);
			pageOut.classList.remove("in");
			// if reverse direction
			pageOut.classList[back? "add": "remove"]("reverse");
			// do fallback every time
			var fallback = params_out.fallback;
			if (typeof fallback == "string") fallback = params_out.root[fallback];
			if (typeof fallback == "function") fallback(pageInto, pageOut, options.response);
		}
		if (pageInto != null && pageInto.classList) {		
			// for title change
			var title = params_in.title, 
			    header = document.querySelector("h1"), 
			    first_page = document.querySelector("." + this.classPage);		
			// do title change	
			if (title) {
				document.title = title;
				if (header) {
					header.innerHTML = title;
					header.title = title;
				}
			} else if (first_page == pageInto && !pageOut && document.title) {
				// set data-title for first visibie page
				pageInto.setAttribute("data-title", document.title);
			}
			
			// delete page with same id when options.remove !== false
			var pageid = options.id || pageInto.id;

			if (options.remove !== false && store[pageid] && store[pageid] != pageInto && store[pageid].parentElement) {
				store[pageid].parentElement.removeChild(store[pageid]);
				delete store[pageid];
			}
	
			// do transition
			pageInto.style.display = "block";
			pageInto.clientWidth;
			pageInto.classList.remove("out");
			pageInto.classList.add("in");
			pageOut && pageInto.classList.add(params_in.form);
			// if reverse direction
			pageInto.classList[back? "add": "remove"]("reverse");
			
			// do callback when come in first time
			var onpagefirstinto = params_in.onpagefirstinto;
			if (!store[pageid]) {
				if (typeof onpagefirstinto == "string" && params_in.root[onpagefirstinto]) {
					params_in.root[onpagefirstinto](pageInto, pageOut, options.response);
				} else if (typeof onpagefirstinto == "function") {
					onpagefirstinto(pageInto, pageOut, options.response);
				}
			}
			
			// do callback when animation start/end
			var isWebkit = 'WebkitAppearance' in document.documentElement.style || typeof document.webkitHidden != "undefined";
			["animationstart", "animationend"].forEach(function(animationkey, index) {
				var animition = params_in[animationkey], webkitkey = "webkit" + animationkey.replace(/^a|s|e/g, function(matchs) {
					return matchs.toUpperCase();
				});
				if (!store[pageid]) {
					var animateEventName = isWebkit? webkitkey: animationkey;
					index && pageInto.addEventListener(animateEventName, function() {
						if (this.classList.contains("in") == false) {
							this.style.display = "none";
						}						
					});
					
					if (typeof animition == "string" && params_in.root[animition]) {
						pageInto.addEventListener(animateEventName, function() {
							params_in.root[animition](this, this.classList.contains("in")? "into": "out");
						});
					} else if (typeof animition == "function") {
						pageInto.addEventListener(animateEventName, function() {
							animition(this, this.classList.contains("in")? "into": "out");	
						});
					}	
				} 
			});
			
			// history
			var url_push = pageid;
			if (url_push && /^#/.test(url_push) == false) {
				url_push = "#" + url_push;
			}
			if (supportHistory && this.pushStateEnabled && options.history !== false && url_push) {
				// if only pageIn, use 'replaceState'
				history[pageOut? "pushState": "replaceState"](null, document.title, url_push.replace(/^#/, "#&"));
			}

			// store page-id, just once
			if (!store[pageid]) {
				store[pageid] = pageInto;
			}
			
			// do callback every time
			var callback = params_in.callback;
			if (typeof callback == "string") callback = params_in.root[callback];
			if (typeof callback == "function") callback(pageInto, pageOut, options.response);
		}
	};
	
	
	/**
	 * For getting whole ajax url
	 * In most cases, you are unnecessary to use this function
	 
	 * @params  trigger: dom-object. element with tag-"a".  - Optional(at least one)
	            url:     string. ajax url.                  - Optional(at least one)
			    params:  string|object. ajax params.        - Optional
	 * @returns string
	 * @example PageTransition.getCleanUrl(elementOfA);
	            PageTransition.getCleanUrl(elementOfA, '', "a=1&b=2");
		        PageTransition.getCleanUrl(null, "xxx.html");
		        PageTransition.getCleanUrl(null, "xxx.html?a=1&b=2");
		        PageTransition.getCleanUrl(null, "xxx.html", "a=1&b=2");
	**/
	PageTransition.getCleanUrl = function(trigger, url, params) {
		var href = "", formdata = "", clean_url = "";
		if (trigger) {
			 if (trigger.nodeType == 1) {
				href = trigger.getAttribute("href");
				formdata = trigger.getAttribute("data-formdata") || trigger.getAttribute("data-data");
			 } else if (trigger.url) {
				 href = trigger.url;
				 formdata = trigger.data;
			 }
		}

		if (!(href = href || url)) return '';
		
		// get formdata
		formdata = formdata || params || "";
		
		if (typeof formdata == "object") {
			var arr_data = [];
			for (key in params) {
				arr_data.push(key + "=" + encodeURIComponent(params[key]));	
			}
			if (arr_data.length > 0) {
				formdata = arr_data.join("&");
			} else {
				formdata = "";
			}
		}
		
		// get url of root
		clean_url = href.split("#")[0].replace(/&+$/, "");

		if (clean_url.slice(-1) == "?") {
			clean_url = clean_url.split("?")[0];	
		}
		// url = root_url + joiner + formdata
		if (formdata != "") {						
			if (/\?/.test(clean_url)) {
				formdata = formdata.replace(/^&|\?/, "");
				clean_url = clean_url + "&" + formdata;
			} else if (formdata != "") {
				formdata = formdata.replace("?", "");
				clean_url = clean_url + "?" + formdata;
			}
		}
		
		return clean_url;
	};
	
	/**
	 * Create page according to given Dom-element or HTML string. And, notice!!!!! will do transition auto.
	 
	 * @params  dom_or_html:        dom-object|string. Create this to dom element as a role of into-page.               - Necessary
	            element_or_options: dom-object|object. '.page element', or 'a element', or 'options' for get out-page   - Optional
				options:            object.            basically, options = ajax options, of course, u can custom it!   - Optional
	 * @returns undefined
	 * @example PageTransition.createPage(pageDom);
	            PageTransition.createPage(generalDom);
		        PageTransition.createPage('<div class="page out">xxx</div>');
		        PageTransition.createPage('<p>xxx</p>');
		        PageTransition.createPage(pageDom, triggerLink);
		        PageTransition.createPage(pageDom, { response: '<div...>' });
		        PageTransition.createPage(pageDom, triggerLink, { response: '<div...>' });
	 *
	**/
	PageTransition.createPage = function(dom_or_html, element_or_options, options) {
		var response = null;
		// 'element_or_options' can '.page element', or 'a element', or 'options'
		// basically, options = ajax options, of course, u can custom it!		
		if (!dom_or_html) return;
		options = options || {};
		// get current page(will be out) according to 'page_or_child'
		var current_page = document.querySelector(".in." + this.classPage);
		// get page-title from element_or_options or options
		var page_title;
		if (element_or_options) {
			if (element_or_options.nodeType == 1) {
				// legal elements
				if (element_or_options.href) {
					page_title = element_or_options.getAttribute("data-title") || options.title;
				}
				response = options.response;
			} else {
				response = element_or_options.response || options.response;	
				page_title = element_or_options.title || options.title;
			}
		}
		
		// get create page (will be into) according to 'dom_or_html'
		var create_page = null;
		
		var create = document.createElement("div");
		if (typeof dom_or_html == "string") {
			create.innerHTML = dom_or_html;
		} else {
			create.appendChild(dom_or_html);
		}
		var create_title = create.getElementsByTagName("title")[0];
		// get the page element
		if (!(create_page = create.querySelector("." + this.classPage))) {
			create.className = "page out";
			if (typeof page_title == "string") create.setAttribute("data-title", page_title);
			create_page = create;
		} else {
			if (create_title) {
				create_page.setAttribute("data-title", create_title.innerText);
			} else if (typeof page_title == "string") {
				create_page.setAttribute("data-title", page_title);
			}
		}
		// insert create page as a last-child
		document.body.appendChild(create_page);
		
		// release memory
		create = null;
		
		// do transition
		this.transition(create_page, current_page, {
			response: response || dom_or_html,
			id: this.getCleanUrl(element_or_options) || create_page.id || ("unique" + Date.now())
		});
	};
	
	/**
	 * For ajax callback. 
	 * For example, data-success="a.b.c". We can't use 'a.b.c' as a function, because it's a string. We should do some work to get it!
	 
	 * @params  keys:        string. - Necessary
	 * @returns function
	            undefined keys is not string
				window    keys undefined
	 * @example PageTransition.getFunction("a.b.c");
	 *
	**/
	PageTransition.getFunction = function(keys) {
		if (typeof keys != "string") return;
		// eg. 'globalObject.functionName'
		var fun = root, arr_key = keys.split(".");
		for (var index=0; index<arr_key.length; index+=1) {
			if (!(fun = fun[arr_key[index]])) {
				break;
			}
		}
		return fun;
	};
		
	/**
	 * For ajax request to get HTML or JSON. 
	 
	 * @params  trigger_or_options        - Necessary  
	            1. dom-object. or~
				2. object.  
	 * @returns undefined
	 * @example PageTransition.ajax(document.querySelector("a"));
	            PageTransition.ajax({
				  url: 'xxx.html',
				  success: function() {}
		    	});
	 *
	**/
	PageTransition.ajax = function(trigger_or_options) {
		if (!trigger_or_options) return;
		
		// default params
		var defaults = {
			url: "",
			dataType: "",
			data: {},
			timeout: 10000,
			async: true,
			username: "",
			password: "",
			success: function() {},
			error: function() {},
			complete: function() {}	
		};
		
		var params = {}, ele_mask = null;
		
		// if 'trigger_or_options' is a element, we should turn it to options-object
		var params_from_trigger = {}, attr_mask;
		if (trigger_or_options.nodeType == 1) {
			params_from_trigger = _queryToObject(trigger_or_options.getAttribute("data-params") || "");
			// get params
			for (key in defaults) {
				// data-* > data-params > defaults
				params[key] = trigger_or_options.getAttribute("data-" + key) || params_from_trigger[key] || defaults[key];
				if (typeof defaults[key] == "function" && typeof params[key] == "string") {
					// eg. globalObject.functionName
					params[key] = this.getFunction(params[key]);
					if (typeof params[key] != "function") {
						params[key] = defaults[key];
					}
				}
			}
			
			// the ajax url is special, we need special treatment
			params.url = this.getCleanUrl(trigger_or_options, params.url);	
			
			// get mask element
			attr_mask = trigger_or_options.getAttribute("data-mask");
			if (attr_mask == "true" || attr_mask == "") {
				ele_mask = trigger_or_options.querySelector("." + this.classMask);
			}
		}
		// if 'trigger_or_options' is a object
		else if (trigger_or_options.url) {
			// get params
			for (key2 in defaults) {
				params[key2] = trigger_or_options[key2] || defaults[key2];
			}
			// get url
			params.url = this.getCleanUrl(null, params.url, params.data);
			// here params.title will become page title;
			params.title = trigger_or_options.title;
		} else {
			return;	
		}
		
		// do ajax
		// get mask and loading element
		if (typeof attr_mask != "string") {
			ele_mask = document.querySelector("body > ." + this.classMask);
		}
		if (ele_mask == null) {
			ele_mask = document.createElement("div");
			ele_mask.className = this.classMask;
			ele_mask.innerHTML = '<i class="loading"></i>';
			if (typeof attr_mask == "string") {
				trigger_or_options.appendChild(ele_mask);
			} else {
				document.body.appendChild(ele_mask);
			}
		}
		// show loading
		ele_mask.style.visibility = "visible";
		
		// ajax request
		var xhr = new XMLHttpRequest();		
		xhr.open("GET", params.url + (/\?/.test(params.url)? "&" : "?") + "r=" + Date.now(), params.async, params.username, params.password);
		xhr.timeout = params.timeout;
		
		xhr.onload = function() {
			// so far, many browser hasn't supported responseType = 'json', so, use JSON.parse instead
			var response = null;
			
			if (xhr.status == 200) {
				if (params.dataType == "json" || params.dataType == "JSON") {
					try {
						response = JSON.parse(xhr.response);
						params.response = response;
						PageTransition.createPage(PageTransition.jsonHandle(response), trigger_or_options, params);
					} catch (e) {
						params.message = "JSON parse error：" + e.message;
						params.error.call(params, xhr, xhr.status);
					}
				} else if (params.dataType == "unknown") {
					try {
						// as json
						response = JSON.parse(xhr.response);
						params.response = response;
						PageTransition.createPage(PageTransition.jsonHandle(response), trigger_or_options, params);
					} catch (e) {
						// as html
						response = xhr.response;
						PageTransition.createPage(response, trigger_or_options, params);
					}
				} else {
					response = xhr.response;
					// 'response' is string
					PageTransition.createPage(response, trigger_or_options, params);
				}
				params.success.call(params, response, xhr.status);
			} else {
				params.message = "The status code exception!";
				params.error.call(params, xhr, xhr.status);
			}
			
			params.complete.call(params, xhr, xhr.status);
			
			// hide loading
			ele_mask.style.visibility = "hidden";
		}
		
		xhr.onerror = function(e) {
			params.message = "Illegal request address or an unexpected network error!";
			params.error.call(params, xhr, xhr.status);
			// hide loading
			ele_mask.style.visibility = "hidden";
		}
		
		xhr.ontimeout = function() {
			params.message = "The request timeout!";
			params.error.call(params, xhr, xhr.status);
			// hide loading
			ele_mask.style.visibility = "hidden";
		};
		
		xhr.send(null);
	};
	
	
	/**
	 * Sometime we don't know direction of transition. Such as browser history change, or data-rel="auto".
	   In this case, we ensure the direction(back or prev) by the sorts of two pages(into or out)
	 
	 * @params  page_in  dom-object      - Necessary  
	            page_out  dom-object      - Optional 
				
	 * @returns boolean
	 *
	**/
	PageTransition.isBack = function(page_in, page_out) {
		// back or forword, according to the order of two pages
		var index_in = -1, index_out = -1;
		if (history.tempBack == true) {
			// backwords
			index_out = 0;
		} else {
			slice.call(document.querySelectorAll("." + PageTransition.classPage)).forEach(function(page, index) {
				if (page == page_in) {
					index_in = index;
				} else if (page == page_out) {
					index_out = index;
				}
			});	
		}
		history.tempBack = null;
		return index_in < index_out;
	};
	
	/**
	 * If dataType of ajax is 'json', we can't convert json-data to page-element. 
	   So, we export a function names 'jsonHandle' to handle json-data.
	 * Attention, it's a global interface. If your project has many json call, you should use JSON itself to make a distinction.
	   For example, every JSON include the only json-id:
	   {
		  "id": "homePage" ,
		  "data": []  
	   }
	   different with
	   {
		  "id": "listPage" ,
		  "data": []  
	   }
	 *
	 * @params  json    - Necessary 		
	 * @returns dom-object|string
	 *
	**/
	PageTransition.jsonHandle = function(json) {
		return '<p style="text-align:center;">Dear master, if you see me, show that JSON parsing function is undefined!</p>';
	},
	
	/**
	 * Initialization. Load page according to location.hash. And bind link-catch events.
	**/
	PageTransition.init = function() {	
		if (hasInited == true) return 'Don\'t repeat initialization!';	
		var hash = location.hash.replace("#&", "#"), ele_in = null;
		if (hash == "" || hash == "#") {
			this.transition(document.querySelector("." + this.classPage));
		} else if (isSimple.test(hash) == true && (ele_in = document.querySelector(hash)) && ele_in.classList.contains(this.classPage)) { // 'ele_in' must be a page element
			this.transition(ele_in);	
		} else {
			// as a ajax
			this.ajax({
				url: hash.replace("#", ""),
				dataType: "unknown",
				error: function() {
					ele_in = document.querySelector("." + PageTransition.classPage);	
					PageTransition.transition(ele_in);
				}
			});	
		}
		
		// Initialization link-catch events.
		var eventName = "click", $ = root.$ || root.jQuery || root.Zepto;
		if ($ && $.fn && $.fn.tap) eventName = "tap"; 
	
		if (this.captureLink == true) {
			document.addEventListener(eventName, this.handleTapEvent);	
			if (eventName == "tap") {
				// zepto tap event.preventDefault can't prevent default click-events
				document.addEventListener("click", function(event) {
					var target = event.target;
					if (!target) return;
					if (target.tagName.toLowerCase() != "a" && !(target = target.getParentElementByTag("a"))) {
						return;
					}
					var ajax = target.getAttribute("data-ajax"), href = target.href;
					// if not ajax request
					if (target.getAttribute("data-rel") == "external" 
						|| ajax == "false"
						|| (href.split("/")[0] !== location.href.split("/")[0] && ajax != "true")
						|| (PageTransition.captureLink == false && ajax != "true")
					) return;
					
					event.preventDefault();
				});		
			}
		}
		// change flag-var for avoiding repeat init
		hasInited = true;
	};
	
	/**
	 * If 'a' element has href, slide auto when tapping~
	**/
	PageTransition.handleTapEvent = function(event) {
		// get target and href
		var target = event.target || event.touches[0], href = target.href;
		if ((!href || /a/i.test(target.tagName) == false) && (target = target.getParentElementByTag("a"))) {
			href = target.href;
		}

		// the page that current touched or actived
		var self_page = document.querySelector(".in." + PageTransition.classPage);
		
		if (self_page == null || !target) return;
		
		// if mask element exist and displaying, prevent double trigger
		var ele_mask = target.getElementsByClassName(PageTransition.classMask)[0];
		if (ele_mask && ele_mask.style.visibility != "hidden") {
			event.preventDefault();
			return false;
		}
		
		// if captureLink
		var capture = (PageTransition.captureLink == true);
		// get rel
		var rel = target.getAttribute("data-rel");
		// if back
		var back = false;
		if (rel == "back") {
			back = true;
		}
		// if external link
		var external = (rel == "external");
		
		// if the 'href' is not legal, return
		// include:
		// 1. undefined
		// 2. javascript: (except data-rel="back")
		// 3. cros, or not capture (except data-ajax="true")
		if (!href) return;
		if (target.getAttribute("href").replace(/#/g, "") === "") {
			event.preventDefault();
			return;
		}
		if (/^javascript/.test(href)) {
			if (back == false) return;	
		} else {
			external = external || (href.split("/")[0] !== location.href.split("/")[0]);
			if ((external == true || capture == false) && target.getAttribute("data-ajax") != "true") return;
		}
		
		// judge that if it's a ajax request
		if (/^#/.test(target.getAttribute("href")) == true) {
			// hash slide
			var idTargetPage = href.split("#")[1], eleTargetPage = idTargetPage && document.getElementById(idTargetPage);
			if (back == false && rel == "auto") {
				back = PageTransition.isBack(eleTargetPage, self_page);
			}
			if (eleTargetPage) PageTransition.transition(eleTargetPage, self_page, back);
			event.preventDefault();
		} else if (/^javascript/.test(href)) {
			// back
			history.tempBack = true;
			history.back();
		} else if (target.getAttribute("data-ajax") != "false") {				
			// get a clean ajax url as page id
			var clean_url = PageTransition.getCleanUrl(target);
			
			// if has loaded and the value of 'data-reload' is not 'true'
			var attr_reload = target.getAttribute("data-reload"), id = target.getAttribute("href");
			if ((attr_reload == null || attr_reload == "false") && store[clean_url]) {
				if (back == false && rel == "auto") {
					back = PageTransition.isBack(store[clean_url], self_page);
				}
				PageTransition.transition(store[clean_url], self_page, back, {
					id: clean_url	
				});
			} else {
				PageTransition.ajax(target);
			}
			event.preventDefault();	
		}
	};
	
	
	/**
	 * prototype extend method: get parent element by tagName
	**/
	Element.prototype.getParentElementByTag = function(tag) {
		if (!tag) return null;
		var element = null, parent = this;
		//if(parent===window) return null;
		var popup = function() {
			parent = parent.parentElement;
			if(!parent) return null;
			var tagParent = parent.tagName.toLowerCase();
			if (tagParent === tag) {
				element = parent;
			} else if (tagParent == "body") {
				element = null;
			} else {
				popup();
			}
		};
		popup();
		return element;
	};
	/**
	 * private method: convert query string to key-value object
	**/
	var _queryToObject = function(string) {
		var obj = {};
		if (typeof string == "string") {
			string.split("&").forEach(function(part) {
				var arr_part = part.split("=");
				if (arr_part.length > 1) {
					obj[arr_part[0]] = part.replace(arr_part[0] + "=", "");
				}
			});
		}
		return obj;
	};
	
	
	/**
	 * page change when history change
	**/
	window.addEventListener("popstate", function() {
		var hash = location.hash.replace("#&", "").replace("#", "");
		
		var page_in = store[hash];
		
		if (!page_in) {
			if(isSimple.test(hash) == false) {
				return;
			}
			page_in =  document.querySelector("#" + hash)
		}
		
		var page_out = document.querySelector(".in." + PageTransition.classPage);
		
		if ((page_in && page_in == page_out) || PageTransition.pushStateEnabled == false) return;
		

		// hash ↔ id													
		if (page_in) {
			PageTransition.transition(page_in, page_out, PageTransition.isBack(page_in, page_out), {
				history: false,
				remove: false
			});
		}
	});
	
	return PageTransition;


});
define("zui/mixin/event",["zui/base"],function(require){
	  var  zBase=require("zui/base");
	  var  zUtil=zBase;
	  var zEvent={
	  			/**阻止默认行为*/
	  			preventDefault:function(ev){
	   				 ev.preventDefault();
	  			},
	  			/** 阻止事件蔓延 */
		        stopPropagation: function(ev) {
		             ev.stopPropagation();
		        },
	   			/*禁用document滚动事件*/
	   			enableTouchMove:function(dom,enableStatus){

	   				  if(enableStatus==false){
	   				  	 $(dom).on("touchmove",this.preventDefault);
	   				  }
	   				  if(enableStatus==true){
	   				  	 $(dom).off("touchmove",this.preventDefault);
	   				  }
	   				 
	   			},
	   			//移动转屏事件监听
	   			ortChange:function(func,args){
	   				$(window).on('onorientationchange' in window ? 'orientationchange' : 'resize',function(){
						if(zUtil.isFunction(func)){
							func(args);
						}
						
					});
	   			},
	   			//创建自定义事件
	   			createEvent:function(eventName,func,dom,args){
	   				if(zUtil.isFunction(func)){
	   					$(dom).on(eventName,function(){
	   						func(args);
	   					});
	   				}
	   			},
	   			//触发自定义事件
	   			trigger:function(eventName,dom,args){
	   				$(dom).trigger(eventName,args);
	   			},
	   			//移除自定义事件
	   			removeEvent:function(eventName,dom){
	   				$(dom).off(eventName);
	   			},
	   			isSuportAnimation:function(){
	   				var rAF = window.requestAnimationFrame	||
	   				window.webkitRequestAnimationFrame	||
	   				window.mozRequestAnimationFrame		||
	   				window.oRequestAnimationFrame		||
	   				window.msRequestAnimationFrame;
	   				return rAF;
	   			}
	   			/**禁止屏幕横竖屏切换**/
	   			// enableOrtChange:function(status){

	   			// 	  if(enableStatus==false){
	   			// 	  	 $(dom).on("onorientationchange",this._preventDefault);
	   			// 	  }
	   			// 	  if(enableStatus==true){
	   			// 	  	 $(dom).off("onorientationchange",this._preventDefault);
	   			// 	  }
	   			// }
	   			


	   }


	   return zEvent;


});