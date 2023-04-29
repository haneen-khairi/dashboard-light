(function($) {
    function maybeCall(thing, ctx) {
        return (typeof thing == 'function') ? (thing.call(ctx)) : thing;
    }
    ;function isElementInDOM(ele) {
        while (ele = ele.parentNode) {
            if (ele == document)
                return true;
        }
        return false;
    }
    ;function Tipsy(element, options) {
        this.$element = $(element);
        this.options = options;
        this.enabled = true;
        this.fixTitle();
    }
    ;Tipsy.prototype = {
        show: function() {
            var title = this.getTitle();
            if (title && this.enabled) {
                var $tip = this.tip();
                $tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
                $tip[0].className = 'tipsy';
                $tip.remove().css({
                    top: 0,
                    left: 0,
                    visibility: 'hidden',
                    display: 'block'
                }).prependTo(document.body);
                var pos = $.extend({}, this.$element.offset(), {
                    width: this.$element[0].offsetWidth,
                    height: this.$element[0].offsetHeight
                });
                var actualWidth = $tip[0].offsetWidth
                  , actualHeight = $tip[0].offsetHeight
                  , gravity = maybeCall(this.options.gravity, this.$element[0]);
                var tp;
                switch (gravity.charAt(0)) {
                case 'n':
                    tp = {
                        top: pos.top + pos.height + this.options.offset,
                        left: pos.left + pos.width / 2 - actualWidth / 2
                    };
                    break;
                case 's':
                    tp = {
                        top: pos.top - actualHeight - this.options.offset,
                        left: pos.left + pos.width / 2 - actualWidth / 2
                    };
                    break;
                case 'e':
                    tp = {
                        top: pos.top + pos.height / 2 - actualHeight / 2,
                        left: pos.left - actualWidth - this.options.offset
                    };
                    break;
                case 'w':
                    tp = {
                        top: pos.top + pos.height / 2 - actualHeight / 2,
                        left: pos.left + pos.width + this.options.offset
                    };
                    break;
                }
                if (gravity.length == 2) {
                    if (gravity.charAt(1) == 'w') {
                        tp.left = pos.left + pos.width / 2 - 15;
                    } else {
                        tp.left = pos.left + pos.width / 2 - actualWidth + 15;
                    }
                }
                $tip.css(tp).addClass('tipsy-' + gravity);
                $tip.find('.tipsy-arrow')[0].className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0);
                if (this.options.className) {
                    $tip.addClass(maybeCall(this.options.className, this.$element[0]));
                }
                if (this.options.fade) {
                    $tip.stop().css({
                        opacity: 0,
                        display: 'block',
                        visibility: 'visible'
                    }).animate({
                        opacity: this.options.opacity
                    });
                } else {
                    $tip.css({
                        visibility: 'visible',
                        opacity: this.options.opacity
                    });
                }
            }
        },
        hide: function() {
            if (this.options.fade) {
                this.tip().stop().fadeOut(function() {
                    $(this).remove();
                });
            } else {
                this.tip().remove();
            }
        },
        fixTitle: function() {
            var $e = this.$element;
            if ($e.attr('title') || typeof ($e.attr('original-title')) != 'string') {
                $e.attr('original-title', $e.attr('title') || '').removeAttr('title');
            }
        },
        getTitle: function() {
            var title, $e = this.$element, o = this.options;
            this.fixTitle();
            var title, o = this.options;
            if (typeof o.title == 'string') {
                title = $e.attr(o.title == 'title' ? 'original-title' : o.title);
            } else if (typeof o.title == 'function') {
                title = o.title.call($e[0]);
            }
            title = ('' + title).replace(/(^\s*|\s*$)/, "");
            return title || o.fallback;
        },
        tip: function() {
            if (!this.$tip) {
                this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');
                this.$tip.data('tipsy-pointee', this.$element[0]);
            }
            return this.$tip;
        },
        validate: function() {
            if (!this.$element[0].parentNode) {
                this.hide();
                this.$element = null;
                this.options = null;
            }
        },
        enable: function() {
            this.enabled = true;
        },
        disable: function() {
            this.enabled = false;
        },
        toggleEnabled: function() {
            this.enabled = !this.enabled;
        }
    };
    $.fn.tipsy = function(options) {
        if (options === true) {
            return this.data('tipsy');
        } else if (typeof options == 'string') {
            var tipsy = this.data('tipsy');
            if (tipsy)
                tipsy[options]();
            return this;
        }
        options = $.extend({}, $.fn.tipsy.defaults, options);
        function get(ele) {
            var tipsy = $.data(ele, 'tipsy');
            if (!tipsy) {
                tipsy = new Tipsy(ele,$.fn.tipsy.elementOptions(ele, options));
                $.data(ele, 'tipsy', tipsy);
            }
            return tipsy;
        }
        function enter() {
            var tipsy = get(this);
            tipsy.hoverState = 'in';
            if (options.delayIn == 0) {
                if ($('.tipsy:visible').length != '1')
                    tipsy.show();
            } else {
                tipsy.fixTitle();
                setTimeout(function() {
                    if (tipsy.hoverState == 'in')
                        tipsy.show();
                }, options.delayIn);
            }
        }
        ;function leave() {
            var tipsy = get(this);
            tipsy.hoverState = 'out';
            if (options.delayOut == 0) {
                tipsy.hide();
            } else {
                setTimeout(function() {
                    if (tipsy.hoverState == 'out')
                        tipsy.hide();
                }, options.delayOut);
            }
        }
        ;if (!options.live)
            this.each(function() {
                get(this);
            });
        if (options.trigger != 'manual') {
            var binder = options.live ? 'live' : 'bind'
              , eventIn = options.trigger == 'hover' ? 'mouseenter' : 'focus'
              , eventOut = options.trigger == 'hover' ? 'mouseleave' : 'blur';
            this[binder](eventIn, enter)[binder](eventOut, leave);
        }
        return this;
    }
    ;
    $.fn.tipsy.defaults = {
        className: null,
        delayIn: 0,
        delayOut: 0,
        fade: false,
        fallback: '',
        gravity: 'n',
        html: false,
        live: false,
        offset: 0,
        opacity: 1,
        title: 'title',
        trigger: 'hover'
    };
    $.fn.tipsy.revalidate = function() {
        $('.tipsy').each(function() {
            var pointee = $.data(this, 'tipsy-pointee');
            if (!pointee || !isElementInDOM(pointee)) {
                $(this).remove();
            }
        });
    }
    ;
    $.fn.tipsy.elementOptions = function(ele, options) {
        return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
    }
    ;
    $.fn.tipsy.autoNS = function() {
        return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2) ? 's' : 'n';
    }
    ;
    $.fn.tipsy.autoWE = function() {
        return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2) ? 'e' : 'w';
    }
    ;
    $.fn.tipsy.autoBounds = function(margin, prefer) {
        return function() {
            var dir = {
                ns: prefer[0],
                ew: (prefer.length > 1 ? prefer[1] : false)
            }
              , boundTop = $(document).scrollTop() + margin
              , boundLeft = $(document).scrollLeft() + margin
              , $this = $(this);
            if ($this.offset().top < boundTop)
                dir.ns = 'n';
            if ($this.offset().left < boundLeft)
                dir.ew = 'w';
            if ($(window).width() + $(document).scrollLeft() - $this.offset().left < margin)
                dir.ew = 'e';
            if ($(window).height() + $(document).scrollTop() - $this.offset().top < margin)
                dir.ns = 's';
            return dir.ns + (dir.ew ? dir.ew : '');
        }
    }
    ;
}
)(jQuery);

(function($) {
    function maybeCall(thing, ctx) {
        return (typeof thing == 'function') ? (thing.call(ctx)) : thing;
    }
    ;function isElementInDOM(ele) {
        while (ele = ele.parentNode) {
            if (ele == document)
                return true;
        }
        return false;
    }
    ;function Tipsy(element, options) {
        this.$element = $(element);
        this.options = options;
        this.enabled = true;
        this.fixTitle();
    }
    ;Tipsy.prototype = {
        show: function() {
            var title = this.getTitle();
            if (title && this.enabled) {
                var $tip = this.tip();
                $tip.find('.tipsydb-inner')[this.options.html ? 'html' : 'text'](title);
                $tip[0].className = 'tipsydb';
                $tip.remove().css({
                    top: 0,
                    left: 0,
                    visibility: 'hidden',
                    display: 'block'
                }).prependTo(document.body);
                var pos = $.extend({}, this.$element.offset(), {
                    width: this.$element[0].offsetWidth,
                    height: this.$element[0].offsetHeight
                });
                var actualWidth = $tip[0].offsetWidth
                  , actualHeight = $tip[0].offsetHeight
                  , gravity = maybeCall(this.options.gravity, this.$element[0]);
                var tp;
                switch (gravity.charAt(0)) {
                case 'n':
                    tp = {
                        top: pos.top + pos.height + this.options.offset,
                        left: pos.left + pos.width / 2 - actualWidth / 2
                    };
                    break;
                case 's':
                    tp = {
                        top: pos.top - actualHeight - this.options.offset,
                        left: pos.left + pos.width / 2 - actualWidth / 2
                    };
                    break;
                case 'e':
                    tp = {
                        top: pos.top + pos.height / 2 - actualHeight / 2,
                        left: pos.left - actualWidth - this.options.offset
                    };
                    break;
                case 'w':
                    tp = {
                        top: pos.top + pos.height / 2 - actualHeight / 2,
                        left: pos.left + pos.width + this.options.offset
                    };
                    break;
                }
                if (gravity.length == 2) {
                    if (gravity.charAt(1) == 'w') {
                        tp.left = pos.left + pos.width / 2 - 15;
                    } else {
                        tp.left = pos.left + pos.width / 2 - actualWidth + 15;
                    }
                }
                $tip.css(tp).addClass('tipsydb-' + gravity);
                $tip.find('.tipsydb-arrow')[0].className = 'tipsydb-arrow tipsydb-arrow-' + gravity.charAt(0);
                if (this.options.className) {
                    $tip.addClass(maybeCall(this.options.className, this.$element[0]));
                }
                if (this.options.fade) {
                    $tip.stop().css({
                        opacity: 0,
                        display: 'block',
                        visibility: 'visible'
                    }).animate({
                        opacity: this.options.opacity
                    });
                } else {
                    $tip.css({
                        visibility: 'visible',
                        opacity: this.options.opacity
                    });
                }
            }
        },
        hide: function() {
            if (this.options.fade) {
                this.tip().stop().fadeOut(function() {
                    $(this).remove();
                });
            } else {
                this.tip().remove();
            }
        },
        fixTitle: function() {
            var $e = this.$element;
            if ($e.attr('title') || typeof ($e.attr('original-title')) != 'string') {
                $e.attr('original-title', $e.attr('title') || '').removeAttr('title');
            }
        },
        getTitle: function() {
            var title, $e = this.$element, o = this.options;
            this.fixTitle();
            var title, o = this.options;
            if (typeof o.title == 'string') {
                title = $e.attr(o.title == 'title' ? 'original-title' : o.title);
            } else if (typeof o.title == 'function') {
                title = o.title.call($e[0]);
            }
            title = ('' + title).replace(/(^\s*|\s*$)/, "");
            return title || o.fallback;
        },
        tip: function() {
            if (!this.$tip) {
                this.$tip = $('<div class="tipsydb"></div>').html('<div class="tipsydb-arrow"></div><div class="tipsydb-inner"></div>');
                this.$tip.data('tipsydb-pointee', this.$element[0]);
            }
            return this.$tip;
        },
        validate: function() {
            if (!this.$element[0].parentNode) {
                this.hide();
                this.$element = null;
                this.options = null;
            }
        },
        enable: function() {
            this.enabled = true;
        },
        disable: function() {
            this.enabled = false;
        },
        toggleEnabled: function() {
            this.enabled = !this.enabled;
        }
    };
    $.fn.tipsydb = function(options) {
        if (options === true) {
            return this.data('tipsydb');
        } else if (typeof options == 'string') {
            var tipsydb = this.data('tipsydb');
            if (tipsydb)
                tipsydb[options]();
            return this;
        }
        options = $.extend({}, $.fn.tipsydb.defaults, options);
        function get(ele) {
            var tipsydb = $.data(ele, 'tipsydb');
            if (!tipsydb) {
                tipsydb = new Tipsy(ele,$.fn.tipsydb.elementOptions(ele, options));
                $.data(ele, 'tipsydb', tipsydb);
            }
            return tipsydb;
        }
        function enter() {
            var tipsydb = get(this);
            tipsydb.hoverState = 'in';
            if (options.delayIn == 0) {
                tipsydb.show();
            } else {
                tipsydb.fixTitle();
                setTimeout(function() {
                    if (tipsydb.hoverState == 'in')
                        tipsydb.show();
                }, options.delayIn);
            }
        }
        ;function leave() {
            var tipsydb = get(this);
            tipsydb.hoverState = 'out';
            if (options.delayOut == 0) {
                tipsydb.hide();
            } else {
                setTimeout(function() {
                    if (tipsydb.hoverState == 'out')
                        tipsydb.hide();
                }, options.delayOut);
            }
        }
        ;if (!options.live)
            this.each(function() {
                get(this);
            });
        if (options.trigger != 'manual') {
            var binder = options.live ? 'live' : 'bind'
              , eventIn = options.trigger == 'hover' ? 'mouseenter' : 'focus'
              , eventOut = options.trigger == 'hover' ? 'mouseleave' : 'blur';
            this[binder](eventIn, enter)[binder](eventOut, leave);
        }
        return this;
    }
    ;
    $.fn.tipsydb.defaults = {
        className: null,
        delayIn: 0,
        delayOut: 0,
        fade: false,
        fallback: '',
        gravity: 'n',
        html: true,
        live: false,
        offset: 0,
        opacity: 1,
        title: 'title',
        trigger: 'hover'
    };
    $.fn.tipsydb.revalidate = function() {
        $('.tipsydb').each(function() {
            var pointee = $.data(this, 'tipsydb-pointee');
            if (!pointee || !isElementInDOM(pointee)) {
                $(this).remove();
            }
        });
    }
    ;
    $.fn.tipsydb.elementOptions = function(ele, options) {
        return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
    }
    ;
    $.fn.tipsydb.autoNS = function() {
        return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2) ? 's' : 'n';
    }
    ;
    $.fn.tipsydb.autoWE = function() {
        return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2) ? 'e' : 'w';
    }
    ;
    $.fn.tipsydb.autoBounds = function(margin, prefer) {
        return function() {
            var dir = {
                ns: prefer[0],
                ew: (prefer.length > 1 ? prefer[1] : false)
            }
              , boundTop = $(document).scrollTop() + margin
              , boundLeft = $(document).scrollLeft() + margin
              , $this = $(this);
            if ($this.offset().top < boundTop)
                dir.ns = 'n';
            if ($this.offset().left < boundLeft)
                dir.ew = 'w';
            if ($(window).width() + $(document).scrollLeft() - $this.offset().left < margin)
                dir.ew = 'e';
            if ($(window).height() + $(document).scrollTop() - $this.offset().top < margin)
                dir.ns = 's';
            return dir.ns + (dir.ew ? dir.ew : '');
        }
    }
    ;
}
)(jQuery);

(function($, document, window) {
    var defaults = {
        html: false,
        photo: false,
        iframe: false,
        inline: false,
        transition: "elastic",
        speed: 300,
        fadeOut: 300,
        width: false,
        initialWidth: "600",
        innerWidth: false,
        maxWidth: false,
        height: false,
        initialHeight: "450",
        innerHeight: false,
        maxHeight: false,
        scalePhotos: true,
        scrolling: true,
        opacity: 0.3,
        preloading: true,
        className: false,
        overlayClose: true,
        escKey: true,
        arrowKey: true,
        top: false,
        bottom: false,
        left: false,
        right: false,
        fixed: false,
        data: undefined,
        closeButton: true,
        fastIframe: true,
        open: false,
        reposition: true,
        loop: true,
        slideshow: false,
        slideshowAuto: true,
        slideshowSpeed: 2500,
        slideshowStart: "start slideshow",
        slideshowStop: "stop slideshow",
        photoRegex: /\.(gif|png|jp(e|g|eg)|bmp|ico|webp|jxr|svg)((#|\?).*)?$/i,
        retinaImage: false,
        retinaUrl: false,
        retinaSuffix: '@2x.$1',
        current: "image {current} of {total}",
        previous: "previous",
        next: "next",
        close: "close",
        xhrError: "This content failed to load.",
        imgError: "This image failed to load.",
        returnFocus: true,
        trapFocus: true,
        onOpen: false,
        onLoad: false,
        onComplete: false,
        onCleanup: false,
        onClosed: false,
        rel: function() {
            return this.rel;
        },
        href: function() {
            return $(this).attr('href');
        },
        title: function() {
            return this.title;
        },
        createImg: function() {
            var img = new Image();
            var attrs = $(this).data('cbox-img-attrs');
            if (typeof attrs === 'object') {
                $.each(attrs, function(key, val) {
                    img[key] = val;
                });
            }
            return img;
        },
        createIframe: function() {
            var iframe = document.createElement('iframe');
            var attrs = $(this).data('cbox-iframe-attrs');
            if (typeof attrs === 'object') {
                $.each(attrs, function(key, val) {
                    iframe[key] = val;
                });
            }
            if ('frameBorder'in iframe) {
                iframe.frameBorder = 0;
            }
            if ('allowTransparency'in iframe) {
                iframe.allowTransparency = "true";
            }
            iframe.name = (new Date()).getTime();
            iframe.allowFullscreen = true;
            return iframe;
        }
    }, colorbox = 'colorbox', prefix = 'cbox', boxElement = prefix + 'Element', event_open = prefix + '_open', event_load = prefix + '_load', event_complete = prefix + '_complete', event_cleanup = prefix + '_cleanup', event_closed = prefix + '_closed', event_purge = prefix + '_purge', $overlay, $box, $wrap, $content, $topBorder, $leftBorder, $rightBorder, $bottomBorder, $related, $window, $loaded, $loadingBay, $loadingOverlay, $title, $current, $slideshow, $next, $prev, $close, $groupControls, $events = $('<a/>'), settings, interfaceHeight, interfaceWidth, loadedHeight, loadedWidth, index, photo, open, active, closing, loadingTimer, publicMethod, div = "div", requests = 0, previousCSS = {}, init;
    function $tag(tag, id, css) {
        var element = document.createElement(tag);
        if (id) {
            element.id = prefix + id;
        }
        if (css) {
            element.style.cssText = css;
        }
        return $(element);
    }
    function winheight() {
        return window.innerHeight ? window.innerHeight : $(window).height();
    }
    function Settings(element, options) {
        if (options !== Object(options)) {
            options = {};
        }
        this.cache = {};
        this.el = element;
        this.value = function(key) {
            var dataAttr;
            if (this.cache[key] === undefined) {
                dataAttr = $(this.el).attr('data-cbox-' + key);
                if (dataAttr !== undefined) {
                    this.cache[key] = dataAttr;
                } else if (options[key] !== undefined) {
                    this.cache[key] = options[key];
                } else if (defaults[key] !== undefined) {
                    this.cache[key] = defaults[key];
                }
            }
            return this.cache[key];
        }
        ;
        this.get = function(key) {
            var value = this.value(key);
            return $.isFunction(value) ? value.call(this.el, this) : value;
        }
        ;
    }
    function getIndex(increment) {
        var max = $related.length
          , newIndex = (index + increment) % max;
        return (newIndex < 0) ? max + newIndex : newIndex;
    }
    function setSize(size, dimension) {
        return Math.round((/%/.test(size) ? ((dimension === 'x' ? $window.width() : winheight()) / 100) : 1) * parseInt(size, 10));
    }
    function isImage(settings, url) {
        return settings.get('photo') || settings.get('photoRegex').test(url);
    }
    function retinaUrl(settings, url) {
        return settings.get('retinaUrl') && window.devicePixelRatio > 1 ? url.replace(settings.get('photoRegex'), settings.get('retinaSuffix')) : url;
    }
    function trapFocus(e) {
        if ('contains'in $box[0] && !$box[0].contains(e.target) && e.target !== $overlay[0]) {
            e.stopPropagation();
            $box.focus();
        }
    }
    function setClass(str) {
        if (setClass.str !== str) {
            $box.add($overlay).removeClass(setClass.str).addClass(str);
            setClass.str = str;
        }
    }
    function getRelated(rel) {
        index = 0;
        if (rel && rel !== false && rel !== 'nofollow') {
            $related = $('.' + boxElement).filter(function() {
                var options = $.data(this, colorbox);
                var settings = new Settings(this,options);
                return (settings.get('rel') === rel);
            });
            index = $related.index(settings.el);
            if (index === -1) {
                $related = $related.add(settings.el);
                index = $related.length - 1;
            }
        } else {
            $related = $(settings.el);
        }
    }
    function trigger(event) {
        $(document).trigger(event);
        $events.triggerHandler(event);
    }
    var slideshow = (function() {
        var active, className = prefix + "Slideshow_", click = "click." + prefix, timeOut;
        function clear() {
            clearTimeout(timeOut);
        }
        function set() {
            if (settings.get('loop') || $related[index + 1]) {
                clear();
                timeOut = setTimeout(publicMethod.next, settings.get('slideshowSpeed'));
            }
        }
        function start() {
            $slideshow.html(settings.get('slideshowStop')).unbind(click).one(click, stop);
            $events.bind(event_complete, set).bind(event_load, clear);
            $box.removeClass(className + "off").addClass(className + "on");
        }
        function stop() {
            clear();
            $events.unbind(event_complete, set).unbind(event_load, clear);
            $slideshow.html(settings.get('slideshowStart')).unbind(click).one(click, function() {
                publicMethod.next();
                start();
            });
            $box.removeClass(className + "on").addClass(className + "off");
        }
        function reset() {
            active = false;
            $slideshow.hide();
            clear();
            $events.unbind(event_complete, set).unbind(event_load, clear);
            $box.removeClass(className + "off " + className + "on");
        }
        return function() {
            if (active) {
                if (!settings.get('slideshow')) {
                    $events.unbind(event_cleanup, reset);
                    reset();
                }
            } else {
                if (settings.get('slideshow') && $related[1]) {
                    active = true;
                    $events.one(event_cleanup, reset);
                    if (settings.get('slideshowAuto')) {
                        start();
                    } else {
                        stop();
                    }
                    $slideshow.show();
                }
            }
        }
        ;
    }());
    function launch(element) {
        var options;
        if (!closing) {
            options = $(element).data(colorbox);
            settings = new Settings(element,options);
            getRelated(settings.get('rel'));
            if (!open) {
                open = active = true;
                setClass(settings.get('className'));
                $box.css({
                    visibility: 'hidden',
                    display: 'block',
                    opacity: ''
                });
                $loaded = $tag(div, 'LoadedContent', 'width:0; height:0; overflow:hidden; visibility:hidden');
                $content.css({
                    width: '',
                    height: ''
                }).append($loaded);
                interfaceHeight = $topBorder.height() + $bottomBorder.height() + $content.outerHeight(true) - $content.height();
                interfaceWidth = $leftBorder.width() + $rightBorder.width() + $content.outerWidth(true) - $content.width();
                loadedHeight = $loaded.outerHeight(true);
                loadedWidth = $loaded.outerWidth(true);
                var initialWidth = setSize(settings.get('initialWidth'), 'x');
                var initialHeight = setSize(settings.get('initialHeight'), 'y');
                var maxWidth = settings.get('maxWidth');
                var maxHeight = settings.get('maxHeight');
                settings.w = Math.max((maxWidth !== false ? Math.min(initialWidth, setSize(maxWidth, 'x')) : initialWidth) - loadedWidth - interfaceWidth, 0);
                settings.h = Math.max((maxHeight !== false ? Math.min(initialHeight, setSize(maxHeight, 'y')) : initialHeight) - loadedHeight - interfaceHeight, 0);
                $loaded.css({
                    width: '',
                    height: settings.h
                });
                publicMethod.position();
                trigger(event_open);
                settings.get('onOpen');
                $groupControls.add($title).hide();
                $box.focus();
                if (settings.get('trapFocus')) {
                    if (document.addEventListener) {
                        document.addEventListener('focus', trapFocus, true);
                        $events.one(event_closed, function() {
                            document.removeEventListener('focus', trapFocus, true);
                        });
                    }
                }
                if (settings.get('returnFocus')) {
                    $events.one(event_closed, function() {
                        $(settings.el).focus();
                    });
                }
            }
            var opacity = parseFloat(settings.get('opacity'));
            $overlay.css({
                opacity: opacity === opacity ? opacity : '',
                cursor: settings.get('overlayClose') ? 'pointer' : '',
                visibility: 'visible'
            }).show();
            if (settings.get('closeButton')) {
                $close.html(settings.get('close')).appendTo($content);
            } else {
                $close.appendTo('<div/>');
            }
            load();
        }
    }
    function appendHTML() {
        if (!$box) {
            init = false;
            $window = $(window);
            $box = $tag(div).attr({
                id: colorbox,
                'class': $.support.opacity === false ? prefix + 'IE' : '',
                role: 'dialog',
                tabindex: '-1'
            }).hide();
            $overlay = $tag(div, "Overlay").hide();
            $loadingOverlay = $([$tag(div, "LoadingOverlay")[0], $tag(div, "LoadingGraphic")[0]]);
            $wrap = $tag(div, "Wrapper");
            $content = $tag(div, "Content").append($title = $tag(div, "Title"), $current = $tag(div, "Current"), $prev = $('<button type="button"/>').attr({
                id: prefix + 'Previous'
            }), $next = $('<button type="button"/>').attr({
                id: prefix + 'Next'
            }), $slideshow = $('<button type="button"/>').attr({
                id: prefix + 'Slideshow'
            }), $loadingOverlay);
            $close = $('<button type="button"/>').attr({
                id: prefix + 'Close'
            });
            $wrap.append($tag(div).append($tag(div, "TopLeft"), $topBorder = $tag(div, "TopCenter"), $tag(div, "TopRight")), $tag(div, false, 'clear:left').append($leftBorder = $tag(div, "MiddleLeft"), $content, $rightBorder = $tag(div, "MiddleRight")), $tag(div, false, 'clear:left').append($tag(div, "BottomLeft"), $bottomBorder = $tag(div, "BottomCenter"), $tag(div, "BottomRight"))).find('div div').css({
                'float': 'left'
            });
            $loadingBay = $tag(div, false, 'position:absolute; width:9999px; visibility:hidden; display:none; max-width:none;');
            $groupControls = $next.add($prev).add($current).add($slideshow);
        }
        if (document.body && !$box.parent().length) {
            $(document.body).append($overlay, $box.append($wrap, $loadingBay));
        }
    }
    function addBindings() {
        function clickHandler(e) {
            if (!(e.which > 1 || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                launch(this);
            }
        }
        if ($box) {
            if (!init) {
                init = true;
                $next.click(function() {
                    publicMethod.next();
                });
                $prev.click(function() {
                    publicMethod.prev();
                });
                $close.click(function() {
                    publicMethod.close();
                });
                $overlay.click(function() {
                    if (settings.get('overlayClose')) {
                        publicMethod.close();
                    }
                });
                $(document).bind('keydown.' + prefix, function(e) {
                    var key = e.keyCode;
                    if (open && settings.get('escKey') && key === 27) {
                        e.preventDefault();
                        publicMethod.close();
                    }
                    if (open && settings.get('arrowKey') && $related[1] && !e.altKey) {
                        if (key === 37) {
                            e.preventDefault();
                            $prev.click();
                        } else if (key === 39) {
                            e.preventDefault();
                            $next.click();
                        }
                    }
                });
                if ($.isFunction($.fn.on)) {
                    $(document).on('click.' + prefix, '.' + boxElement, clickHandler);
                } else {
                    $('.' + boxElement).live('click.' + prefix, clickHandler);
                }
            }
            return true;
        }
        return false;
    }
    if ($[colorbox]) {
        return;
    }
    $(appendHTML);
    publicMethod = $.fn[colorbox] = $[colorbox] = function(options, callback) {
        var settings;
        var $obj = this;
        options = options || {};
        if ($.isFunction($obj)) {
            $obj = $('<a/>');
            options.open = true;
        }
        if (!$obj[0]) {
            return $obj;
        }
        appendHTML();
        if (addBindings()) {
            if (callback) {
                options.onComplete = callback;
            }
            $obj.each(function() {
                var old = $.data(this, colorbox) || {};
                $.data(this, colorbox, $.extend(old, options));
            }).addClass(boxElement);
            settings = new Settings($obj[0],options);
            if (settings.get('open')) {
                launch($obj[0]);
            }
        }
        return $obj;
    }
    ;
    publicMethod.position = function(speed, loadedCallback) {
        var css, top = 0, left = 0, offset = $box.offset(), scrollTop, scrollLeft;
        $window.unbind('resize.' + prefix);
        $box.css({
            top: -9e4,
            left: -9e4
        });
        scrollTop = $window.scrollTop();
        scrollLeft = $window.scrollLeft();
        if (settings.get('fixed')) {
            offset.top -= scrollTop;
            offset.left -= scrollLeft;
            $box.css({
                position: 'fixed'
            });
        } else {
            top = scrollTop;
            left = scrollLeft;
            $box.css({
                position: 'absolute'
            });
        }
        if (settings.get('right') !== false) {
            left += Math.max($window.width() - settings.w - loadedWidth - interfaceWidth - setSize(settings.get('right'), 'x'), 0);
        } else if (settings.get('left') !== false) {
            left += setSize(settings.get('left'), 'x');
        } else {
            left += Math.round(Math.max($window.width() - settings.w - loadedWidth - interfaceWidth, 0) / 2);
        }
        if (settings.get('bottom') !== false) {
            top += Math.max(winheight() - settings.h - loadedHeight - interfaceHeight - setSize(settings.get('bottom'), 'y'), 0);
        } else if (settings.get('top') !== false) {
            top += setSize(settings.get('top'), 'y');
        } else {
            top += Math.round(Math.max(winheight() - settings.h - loadedHeight - interfaceHeight, 0) / 2);
        }
        $box.css({
            top: offset.top,
            left: offset.left,
            visibility: 'visible'
        });
        $wrap[0].style.width = $wrap[0].style.height = "9999px";
        function modalDimensions() {
            $topBorder[0].style.width = $bottomBorder[0].style.width = $content[0].style.width = (parseInt($box[0].style.width, 10) - interfaceWidth) + 'px';
            $content[0].style.height = $leftBorder[0].style.height = $rightBorder[0].style.height = (parseInt($box[0].style.height, 10) - interfaceHeight) + 'px';
        }
        css = {
            width: settings.w + loadedWidth + interfaceWidth,
            height: settings.h + loadedHeight + interfaceHeight,
            top: top,
            left: left
        };
        if (speed) {
            var tempSpeed = 0;
            $.each(css, function(i) {
                if (css[i] !== previousCSS[i]) {
                    tempSpeed = speed;
                    return;
                }
            });
            speed = tempSpeed;
        }
        previousCSS = css;
        if (!speed) {
            $box.css(css);
        }
        $box.dequeue().animate(css, {
            duration: speed || 0,
            complete: function() {
                modalDimensions();
                active = false;
                $wrap[0].style.width = (settings.w + loadedWidth + interfaceWidth) + "px";
                $wrap[0].style.height = (settings.h + loadedHeight + interfaceHeight) + "px";
                if (settings.get('reposition')) {
                    setTimeout(function() {
                        $window.bind('resize.' + prefix, publicMethod.position);
                    }, 1);
                }
                if ($.isFunction(loadedCallback)) {
                    loadedCallback();
                }
            },
            step: modalDimensions
        });
    }
    ;
    publicMethod.resize = function(options) {
        var scrolltop;
        if (open) {
            options = options || {};
            if (options.width) {
                settings.w = setSize(options.width, 'x') - loadedWidth - interfaceWidth;
            }
            if (options.innerWidth) {
                settings.w = setSize(options.innerWidth, 'x');
            }
            $loaded.css({
                width: settings.w
            });
            if (options.height) {
                settings.h = setSize(options.height, 'y') - loadedHeight - interfaceHeight;
            }
            if (options.innerHeight) {
                settings.h = setSize(options.innerHeight, 'y');
            }
            if (!options.innerHeight && !options.height) {
                scrolltop = $loaded.scrollTop();
                $loaded.css({
                    height: "auto"
                });
                settings.h = $loaded.height();
            }
            $loaded.css({
                height: settings.h
            });
            if (scrolltop) {
                $loaded.scrollTop(scrolltop);
            }
            publicMethod.position(settings.get('transition') === "none" ? 0 : settings.get('speed'));
        }
    }
    ;
    publicMethod.prep = function(object) {
        if (!open) {
            return;
        }
        var callback, speed = settings.get('transition') === "none" ? 0 : settings.get('speed');
        $loaded.remove();
        $loaded = $tag(div, 'LoadedContent').append(object);
        function getWidth() {
            settings.w = settings.w || $loaded.width();
            settings.w = settings.mw && settings.mw < settings.w ? settings.mw : settings.w;
            return settings.w;
        }
        function getHeight() {
            settings.h = settings.h || $loaded.height();
            settings.h = settings.mh && settings.mh < settings.h ? settings.mh : settings.h;
            return settings.h;
        }
        $loaded.hide().appendTo($loadingBay.show()).css({
            width: getWidth(),
            overflow: settings.get('scrolling') ? 'auto' : 'hidden'
        }).css({
            height: getHeight()
        }).prependTo($content);
        $loadingBay.hide();
        $(photo).css({
            'float': 'none'
        });
        setClass(settings.get('className'));
        callback = function() {
            var total = $related.length, iframe, complete;
            if (!open) {
                return;
            }
            function removeFilter() {
                if ($.support.opacity === false) {
                    $box[0].style.removeAttribute('filter');
                }
            }
            complete = function() {
                clearTimeout(loadingTimer);
                $loadingOverlay.hide();
                trigger(event_complete);
                settings.get('onComplete');
            }
            ;
            $title.html(settings.get('title')).show();
            $loaded.show();
            if (total > 1) {
                if (typeof settings.get('current') === "string") {
                    $current.html(settings.get('current').replace('{current}', index + 1).replace('{total}', total)).show();
                }
                $next[(settings.get('loop') || index < total - 1) ? "show" : "hide"]().html(settings.get('next'));
                $prev[(settings.get('loop') || index) ? "show" : "hide"]().html(settings.get('previous'));
                slideshow();
                if (settings.get('preloading')) {
                    $.each([getIndex(-1), getIndex(1)], function() {
                        var img, i = $related[this], settings = new Settings(i,$.data(i, colorbox)), src = settings.get('href');
                        if (src && isImage(settings, src)) {
                            src = retinaUrl(settings, src);
                            img = document.createElement('img');
                            img.src = src;
                        }
                    });
                }
            } else {
                $groupControls.hide();
            }
            if (settings.get('iframe')) {
                iframe = settings.get('createIframe');
                if (!settings.get('scrolling')) {
                    iframe.scrolling = "no";
                }
                $(iframe).attr({
                    src: settings.get('href'),
                    'class': prefix + 'Iframe'
                }).one('load', complete).appendTo($loaded);
                $events.one(event_purge, function() {
                    iframe.src = "//about:blank";
                });
                if (settings.get('fastIframe')) {
                    $(iframe).trigger('load');
                }
            } else {
                complete();
            }
            if (settings.get('transition') === 'fade') {
                $box.fadeTo(speed, 1, removeFilter);
            } else {
                removeFilter();
            }
        }
        ;
        if (settings.get('transition') === 'fade') {
            $box.fadeTo(speed, 0, function() {
                publicMethod.position(0, callback);
            });
        } else {
            publicMethod.position(speed, callback);
        }
    }
    ;
    function load() {
        var href, setResize, prep = publicMethod.prep, $inline, request = ++requests;
        active = true;
        photo = false;
        trigger(event_purge);
        trigger(event_load);
        settings.get('onLoad');
        settings.h = settings.get('height') ? setSize(settings.get('height'), 'y') - loadedHeight - interfaceHeight : settings.get('innerHeight') && setSize(settings.get('innerHeight'), 'y');
        settings.w = settings.get('width') ? setSize(settings.get('width'), 'x') - loadedWidth - interfaceWidth : settings.get('innerWidth') && setSize(settings.get('innerWidth'), 'x');
        settings.mw = settings.w;
        settings.mh = settings.h;
        if (settings.get('maxWidth')) {
            settings.mw = setSize(settings.get('maxWidth'), 'x') - loadedWidth - interfaceWidth;
            settings.mw = settings.w && settings.w < settings.mw ? settings.w : settings.mw;
        }
        if (settings.get('maxHeight')) {
            settings.mh = setSize(settings.get('maxHeight'), 'y') - loadedHeight - interfaceHeight;
            settings.mh = settings.h && settings.h < settings.mh ? settings.h : settings.mh;
        }
        href = settings.get('href');
        loadingTimer = setTimeout(function() {
            $loadingOverlay.show();
        }, 100);
        if (settings.get('inline')) {
            var $target = $(href).eq(0);
            $inline = $('<div>').hide().insertBefore($target);
            $events.one(event_purge, function() {
                $inline.replaceWith($target);
            });
            prep($target);
        } else if (settings.get('iframe')) {
            prep(" ");
        } else if (settings.get('html')) {
            prep(settings.get('html'));
        } else if (isImage(settings, href)) {
            href = retinaUrl(settings, href);
            photo = settings.get('createImg');
            $(photo).addClass(prefix + 'Photo').bind('error.' + prefix, function() {
                prep($tag(div, 'Error').html(settings.get('imgError')));
            }).one('load', function() {
                if (request !== requests) {
                    return;
                }
                setTimeout(function() {
                    var percent;
                    if (settings.get('retinaImage') && window.devicePixelRatio > 1) {
                        photo.height = photo.height / window.devicePixelRatio;
                        photo.width = photo.width / window.devicePixelRatio;
                    }
                    if (settings.get('scalePhotos')) {
                        setResize = function() {
                            photo.height -= photo.height * percent;
                            photo.width -= photo.width * percent;
                        }
                        ;
                        if (settings.mw && photo.width > settings.mw) {
                            percent = (photo.width - settings.mw) / photo.width;
                            setResize();
                        }
                        if (settings.mh && photo.height > settings.mh) {
                            percent = (photo.height - settings.mh) / photo.height;
                            setResize();
                        }
                    }
                    if (settings.h) {
                        photo.style.marginTop = Math.max(settings.mh - photo.height, 0) / 2 + 'px';
                    }
                    if ($related[1] && (settings.get('loop') || $related[index + 1])) {
                        photo.style.cursor = 'pointer';
                        $(photo).bind('click.' + prefix, function() {
                            publicMethod.next();
                        });
                    }
                    photo.style.width = photo.width + 'px';
                    photo.style.height = photo.height + 'px';
                    prep(photo);
                }, 1);
            });
            photo.src = href;
        } else if (href) {
            $loadingBay.load(href, settings.get('data'), function(data, status) {
                if (request === requests) {
                    prep(status === 'error' ? $tag(div, 'Error').html(settings.get('xhrError')) : $(this).contents());
                }
            });
        }
    }
    publicMethod.next = function() {
        if (!active && $related[1] && (settings.get('loop') || $related[index + 1])) {
            index = getIndex(1);
            launch($related[index]);
        }
    }
    ;
    publicMethod.prev = function() {
        if (!active && $related[1] && (settings.get('loop') || index)) {
            index = getIndex(-1);
            launch($related[index]);
        }
    }
    ;
    publicMethod.close = function() {
        if (open && !closing) {
            closing = true;
            open = false;
            trigger(event_cleanup);
            settings.get('onCleanup');
            $window.unbind('.' + prefix);
            $overlay.fadeTo(settings.get('fadeOut') || 0, 0);
            $box.stop().fadeTo(settings.get('fadeOut') || 0, 0, function() {
                $box.hide();
                $overlay.hide();
                trigger(event_purge);
                $loaded.remove();
                setTimeout(function() {
                    closing = false;
                    trigger(event_closed);
                    settings.get('onClosed');
                }, 1);
            });
        }
    }
    ;
    publicMethod.remove = function() {
        if (!$box) {
            return;
        }
        $box.stop();
        $[colorbox].close();
        $box.stop(false, true).remove();
        $overlay.remove();
        closing = false;
        $box = null;
        $('.' + boxElement).removeData(colorbox).removeClass(boxElement);
        $(document).unbind('click.' + prefix).unbind('keydown.' + prefix);
    }
    ;
    publicMethod.element = function() {
        return $(settings.el);
    }
    ;
    publicMethod.settings = defaults;
}(jQuery, document, window));

document.addEventListener("DOMContentLoaded", function(event) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/getkarmadata');
    xhr.send();
    xhr.responseType = 'json';
    xhr.onload = function() {
        if (xhr.status != 200) {} else {
            let responseObj = xhr.response;
            document.getElementById('karmahpiecealltime').innerHTML = responseObj.alltime;
            document.getElementById('karmaipiecealltime').innerHTML = responseObj.alltime;
            document.getElementById('karmaipiecethismonth').innerHTML = responseObj.thismonth;
        }
    }
});
window.addEventListener('load', function() {
    $('a.track').removeClass('trackdisabled');
    $('input#track').removeClass('trackdisabled');
});
var wwidth = window.screen.availWidth;
if (wwidth > 500) {
    $(function() {
        $('#tipsyemail [rel=tipsy]').tipsy({
            fade: true,
            gravity: 's'
        });
        $('[rel=tipsy]').tipsy({
            fade: true,
            gravity: 'n'
        });
    });
} else {
    $(function() {
        $('#tipsyemail [rel=tipsy]').tipsy({
            fade: true,
            gravity: 'n'
        });
        $('[rel=tipsy]').tipsy({
            fade: true,
            gravity: 'nw'
        });
    });
}
$(document).on('mousedown touchstart', function(e) {
    if ($('#header .dropdown:visible').length) {
        var container = $('#header .dropdown:visible');
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            $('#header .dropdown:visible').stop().slideUp('fast').parent().removeClass('active');
        }
    }
    if (($('#ttaber1').length != 0) || ($('#ttaber2').length != 0)) {
        if (isScrolledIntoView(document.getElementById('ttaber1')) || isScrolledIntoView(document.getElementById('ttaber2')))
            $('.footerstorelink').css('display', 'block');
        else
            $('.footerstorelink').css('display', 'none');
    }
});
$(document).on('mouseup touchend', function(e) {
    if ($('.tipsy:visible').length) {
        var container = $('[rel=tipsy]');
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            $('[rel=tipsy]').each(function() {
                $(this).tipsy('hide');
            });
        }
    }
    if ($('.tipsydb:visible').length) {
        var container = $('[rel=tipsydb]');
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            $('[rel=tipsydb]').each(function() {
                $(this).tipsydb('hide');
            });
        }
    }
    if (($('#ttaber1').length != 0) || ($('#ttaber2').length != 0)) {
        if (isScrolledIntoView(document.getElementById('ttaber1')) || isScrolledIntoView(document.getElementById('ttaber2')))
            $('.footerstorelink').css('display', 'block');
        else
            $('.footerstorelink').css('display', 'none');
    }
});
function isScrolledIntoView(el) {
    var rect = el.getBoundingClientRect();
    var elemTop = rect.top;
    var elemBottom = rect.bottom;
    var isVisible = (elemTop < window.innerHeight) && (elemBottom >= 0);
    return isVisible;
}
$(document).on('touchmove', function(e) {
    if ($("div").is("#photos1"))
        document.getElementById('photos1').style.overflowX = 'scroll';
    if ($("div").is("#photos2"))
        document.getElementById('photos2').style.overflowX = 'scroll';
    if ($("div").is("#photos3"))
        document.getElementById('photos3').style.overflowX = 'scroll';
    if ($("div").is("#photos4"))
        document.getElementById('photos4').style.overflowX = 'scroll';
    if ($("div").is("#photos5"))
        document.getElementById('photos5').style.overflowX = 'scroll';
    if ($("div").is("#photos6"))
        document.getElementById('photos6').style.overflowX = 'scroll';
    if ($("div").is("#photos7"))
        document.getElementById('photos7').style.overflowX = 'scroll';
    if ($("div").is("#photos8"))
        document.getElementById('photos8').style.overflowX = 'scroll';
    if ($("div").is("#photos9"))
        document.getElementById('photos9').style.overflowX = 'scroll';
    if ($("div").is("#photos10"))
        document.getElementById('photos10').style.overflowX = 'scroll';
});
$(document).ready(function() {
    var menuTimeout;
    $('.price').on('click', function() {
        if ($('.tipsy:visible').length == 0) {
            $(this).find('[rel=tipsy]').tipsy('show');
        }
    });
    $('#tipsyprice').on('click', function() {
        $(this).find('[rel=tipsy]').tipsy('hide');
    });
    $('#tipsyemail').on('click', function() {
        $(this).find('[rel=tipsy]').tipsy('hide');
    });
    $('.pricebig').on('click', function() {
        if ($('.tipsy:visible').length == 0) {
            $(this).find('[rel=tipsy]').tipsy('show');
        }
    });
    $('.rating').on('click', function() {
        if ($('.tipsy:visible').length == 0) {
            $(this).find('[rel=tipsy]').tipsy('show');
        }
    });
    $('.cell').on('click', function() {
        if ($('.tipsy:visible').length == 0) {
            $(this).find('[rel=tipsy]').tipsy('show');
        }
    });
    $('.info [rel=tipsy]').on('click', function() {
        if ($('.tipsy:visible').length == 0) {
            $(this).tipsy('show');
        }
    });
    $('.bottom [rel=tipsydb]').on('click', function() {
        if ($('.tipsydb:visible').length == 0) {
            $(this).tipsydb('show');
        }
    });
    $('.pctableset1 [rel=tipsydb]').on('click', function() {
        if ($('.tipsydb:visible').length == 0) {
            $(this).tipsydb('show');
        }
    });
    $('#header .rSide .menu li a.drop').on('click', function() {
        clearTimeout(menuTimeout);
        if ($('#header .dropdown:visible').length) {
            $('#header .dropdown:visible').stop().slideUp('fast').parent().removeClass('active');
        }
        $(this).parent().toggleClass('active');
        $(this).next('.dropdown').stop().slideDown('fast');
        return false;
    });
    $('#header .top').on('mouseleave', function() {
        if ($('#header .dropdown:visible').length) {
            menuTimeout = setTimeout(function() {
                $('#header .dropdown:visible').stop().slideUp('fast').parent().removeClass('active');
            }, 30000);
        }
    });
    $('#header .top').on('mouseenter', function() {
        clearTimeout(menuTimeout);
    });
    $('#header .search .categories a.value').on('click', function() {
        $(this).next('.options').slideToggle('fast');
        return false;
    });
    $('#header .search .categories a.values').on('click', function() {
        $(this).next('.options').slideToggle('fast');
        return false;
    });
    $('#header .search .categories').on('mouseleave', function() {
        if ($('#header .search .categories .options:visible').length) {
            $('#header .search .categories .options').slideUp('fast');
        }
    });
    $('#header .search .categories .options a').on('click', function() {
        var text = $(this).text();
        var value = $(this).attr('data-value');
        $('#header .search .categories .options a').removeClass('active');
        $(this).addClass('active');
        $('#header .search .categories .options').slideUp('fast');
        $('#header .search .categories input').val(value);
        $('#header .search .categories a.value').addClass('selected').text(text);
        $('#header .search .categories a.values').addClass('selected').text(text);
        var parts = window.location.href;
        parts = parts.split(window.location.hostname);
        if (value == '3') {
            var swparcels = $('.ilft .icnt #swparcels').attr('value');
            $('.ilft .icnt .txt').attr('placeholder', swparcels);
            if (parts[1] == '/')
                $('#header .bottom .search input.txt').css('font-size', '16px');
            else
                $('#header .bottom .search input.txt').css('font-size', '14px');
        } else {
            var swaliexpress = $('.ilft .icnt #swaliexpress').attr('value');
            $('.ilft .icnt .txt').attr('placeholder', swaliexpress);
            $('#header .bottom .search input.txt').css('font-size', '18px');
        }
        return false;
    });
    $('a.toggle-info').on('click', function() {
        $('#wrapper .categories .info').toggle();
        return false;
    });
    $('.products .lSide .block a.caption').on('click', function() {
        $(this).next('.collapse').slideToggle('fast');
        return false;
    });
    $('.products .cSide .top .select a.value').on('click', function() {
        $(this).next('.options').slideToggle('fast');
        return false;
    });
    $('.products .cSide .top .select').on('mouseleave', function() {
        if ($('.products .cSide .top .select .options:visible').length) {
            $('.products .cSide .top .select .options').slideUp('fast');
        }
    });
    $('.products .cSide .top .select .options a').on('click', function() {
        var text = $(this).text();
        var value = $(this).attr('data-value');
        $('.products .cSide .top .select .options a').removeClass('active');
        $(this).addClass('active');
        $('.products .cSide .top .select .options').slideUp('fast');
        $('.products .cSide .top .select input:first').val(value);
        $('.products .cSide .top .select a.value').addClass('selected').text(text);
        return false;
    });
    $('.products .cSide .top .myset1 .myselect a.value').on('click', function() {
        $(this).next('.options').slideToggle('fast');
        return false;
    });
    $('.products .cSide .top .myset1 .myselect').on('mouseleave', function() {
        if ($('.products .cSide .top .myset1 .myselect .options:visible').length) {
            $('.products .cSide .top .myset1 .myselect .options').slideUp('fast');
        }
    });
    $('.products .cSide .top .myset1 .myselect .options a').on('click', function() {
        var text = $(this).text();
        var value = $(this).attr('data-value');
        $('.products .cSide .top .myset1 .myselect .options a').removeClass('active');
        $(this).addClass('active');
        $('.products .cSide .top .myset1 .myselect .options').slideUp('fast');
        $('.products .cSide .top .myset1 .myselect input:first').val(value);
        $('.products .cSide .top .myset1 .myselect a.value').addClass('selected').text(text);
        myselectheight();
        return false;
    });
    myselectheight();
    $('.products .mdl .cnt a.ainfoicont').on('click', function() {
        ptitlebigh = $('.products .mdl .cnt h1').height();
        if (ptitlebigh < 30)
            $('.pctoiconinfo').css('top', '27px');
        if ((ptitlebigh > 60) && (ptitlebigh < 80))
            $('.pctoiconinfo').css('top', '70px');
        if ((ptitlebigh >= 80) && (ptitlebigh < 100))
            $('.pctoiconinfo').css('top', '90px');
        if (ptitlebigh >= 100)
            $('.pctoiconinfo').css('top', '110px');
        $('.pctoiconinfo').fadeToggle('fast');
        return false;
    });
    $('.products .mdl .cnt .pctoiconinfo .choicebox').on('mouseleave', function() {
        if ($('.products .mdl .cnt .pctoiconinfo:visible').length) {
            $('.products .mdl .cnt .pctoiconinfo').fadeOut(400);
        }
    });
    $(document).on('touchstart', function(e) {
        if ($('.pctoiconinfo:visible').length) {
            var container = $('.pctoiconinfo:visible');
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                $('.products .mdl .cnt .pctoiconinfo').fadeOut(400);
            }
        }
    });
    $('.products .pctable #pctableset1 .pctableselect a.pctablevalue').on('click', function() {
        $(this).next('.pctableoptions').slideToggle('fast');
        tabpcallsetheight();
        return false;
    });
    $('.products .pctable #pctableset1 .pctableselect').on('mouseleave', function() {
        if ($('.products .pctable #pctableset1 .pctableselect .pctableoptions:visible').length) {
            $('.products .pctable #pctableset1 .pctableselect .pctableoptions').slideUp('fast');
            tabpcallsetheightauto();
        }
    });
    $('.products .pctable #pctableset1 .pctableselect .pctableoptions a').on('click', function() {
        var text = $(this).text();
        var value = $(this).attr('data-value');
        $('#pct1 .showpriceranged [name=dateformat]').val(value);
        $('#pct2 .showpriceranged [name=dateformat]').val(value);
        getpasteor();
        $('.products .pctable #pctableset1 .pctableselect .pctableoptions a').removeClass('active');
        $(this).addClass('active');
        $('.products .pctable #pctableset1 .pctableselect .pctableoptions').slideUp('fast');
        $('.products .pctable #pctableset1 .pctableselect a.pctablevalue').addClass('selected').text(text);
        return false;
    });
    $('.products .pctable #pctableset2 .pctableselect a.pctablevalue').on('click', function() {
        $(this).next('.pctableoptions').slideToggle('fast');
        tabpcallsetheight();
        return false;
    });
    $('.products .pctable #pctableset2 .pctableselect').on('mouseleave', function() {
        if ($('.products .pctable #pctableset2 .pctableselect .pctableoptions:visible').length) {
            $('.products .pctable #pctableset2 .pctableselect .pctableoptions').slideUp('fast');
            tabpcallsetheightauto();
        }
    });
    $('.products .pctable #pctableset2 .pctableselect .pctableoptions a').on('click', function() {
        var text = $(this).text();
        var value = $(this).attr('data-value');
        $('#pct1 .showpriceranged [name=priceformat]').val(value);
        $('#pct2 .showpriceranged [name=priceformat]').val(value);
        getpasteor();
        $('.products .pctable #pctableset2 .pctableselect .pctableoptions a').removeClass('active');
        $(this).addClass('active');
        $('.products .pctable #pctableset2 .pctableselect .pctableoptions').slideUp('fast');
        $('.products .pctable #pctableset2 .pctableselect a.pctablevalue').addClass('selected').text(text);
        return false;
    });
    $('.products .pctable #pctableset3 .pctableselect a.pctablevalue').on('click', function() {
        $(this).next('.pctableoptions').slideToggle('fast');
        tabpcallsetheight();
        return false;
    });
    $('.products .pctable #pctableset3 .pctableselect').on('mouseleave', function() {
        if ($('.products .pctable #pctableset3 .pctableselect .pctableoptions:visible').length) {
            $('.products .pctable #pctableset3 .pctableselect .pctableoptions').slideUp('fast');
            tabpcallsetheightauto();
        }
    });
    $('.products .pctable #pctableset3 .pctableselect .pctableoptions a').on('click', function() {
        var text = $(this).text();
        var value = $(this).attr('data-value');
        $('#pct1 .showpriceranged [name=delimitersformat]').val(value);
        $('#pct2 .showpriceranged [name=delimitersformat]').val(value);
        getpasteor();
        $('.products .pctable #pctableset3 .pctableselect .pctableoptions a').removeClass('active');
        $(this).addClass('active');
        $('.products .pctable #pctableset3 .pctableselect .pctableoptions').slideUp('fast');
        $('.products .pctable #pctableset3 .pctableselect a.pctablevalue').addClass('selected').text(text);
        return false;
    });
    $('.products .pctable #pctableset4 .pctableselect a.pctablevalue').on('click', function() {
        $(this).next('.pctableoptions').slideToggle('fast');
        tabpcallsetheight();
        return false;
    });
    $('.products .pctable #pctableset4 .pctableselect').on('mouseleave', function() {
        if ($('.products .pctable #pctableset4 .pctableselect .pctableoptions:visible').length) {
            $('.products .pctable #pctableset4 .pctableselect .pctableoptions').slideUp('fast');
            tabpcallsetheightauto();
        }
    });
    $('.products .pctable #pctableset4 .pctableselect .pctableoptions a').on('click', function() {
        var text = $(this).text();
        var value = $(this).attr('data-value');
        $('#pct1 .showpriceranged [name=nodatadays]').val(value);
        $('#pct2 .showpriceranged [name=nodatadays]').val(value);
        if (value == 0)
            $('.pcex .emptydays').addClass('hidden');
        if (value == 1)
            $('.pcex .emptydays').removeClass('hidden');
        $('.products .pctable #pctableset4 .pctableselect .pctableoptions a').removeClass('active');
        $(this).addClass('active');
        $('.products .pctable #pctableset4 .pctableselect .pctableoptions').slideUp('fast');
        $('.products .pctable #pctableset4 .pctableselect a.pctablevalue').addClass('selected').text(text);
        return false;
    });
    $('.products .pctable #pctableset5 .pctableselect a.pctablevalue').on('click', function() {
        $(this).next('.pctableoptions').slideToggle('fast');
        tabpcallsetheight();
        return false;
    });
    $('.products .pctable #pctableset5 .pctableselect').on('mouseleave', function() {
        if ($('.products .pctable #pctableset5 .pctableselect .pctableoptions:visible').length) {
            $('.products .pctable #pctableset5 .pctableselect .pctableoptions').slideUp('fast');
            tabpcallsetheightauto();
        }
    });
    $('.products .pctable #pctableset5 .pctableselect .pctableoptions a').on('click', function() {
        var text = $(this).text();
        var value = $(this).attr('data-value');
        $('#pct1 .showpriceranged [name=fileformat]').val(value);
        $('#pct2 .showpriceranged [name=fileformat]').val(value);
        $('.products .pctable #pctableset5 .pctableselect .pctableoptions a').removeClass('active');
        $(this).addClass('active');
        $('.products .pctable #pctableset5 .pctableselect .pctableoptions').slideUp('fast');
        $('.products .pctable #pctableset5 .pctableselect a.pctablevalue').addClass('selected').text(text);
        return false;
    });
    $('.products .cSide .top .myset2 .myselect a.value').on('click', function() {
        $(this).next('.options').slideToggle('fast');
        return false;
    });
    $('.products .cSide .top .myset2 .myselect').on('mouseleave', function() {
        if ($('.products .cSide .top .myset2 .myselect .options:visible').length) {
            $('.products .cSide .top .myset2 .myselect .options').slideUp('fast');
        }
    });
    $('.products .cSide .top .myset2 .myselect .options a').on('click', function() {
        var text = $(this).text();
        var value = $(this).attr('data-value');
        $('.products .cSide .top .myset2 .myselect .options a').removeClass('active');
        $(this).addClass('active');
        $('.products .cSide .top .myset2 .myselect .options').slideUp('fast');
        $('.products .cSide .top .myset2 .myselect input:first').val(value);
        $('.products .cSide .top .myset2 .myselect a.value').addClass('selected').text(text);
        return false;
    });
    $('.products .element.wide .lft a').colorbox({
        maxWidth: '95%',
        maxHeight: '95%',
        onComplete: function() {
            $.colorbox.resize();
        }
    });
    $('.products .taber .links a, .products .taber .linkstaber a').on('click', function() {
        var which = $(this).index();
        $(this).addClass('active').siblings().removeClass('active');
        $(this).parent().next('.content').find('.tab:eq(' + which + ')').show().siblings().hide();
        return false;
    });
    if ($("span").is("#eye")) {
        document.getElementById("eye").addEventListener("click", function(e) {
            var pwda = document.getElementById("pid1");
            if (pwda.getAttribute("type") == "password") {
                pwda.setAttribute("type", "text");
            } else {
                pwda.setAttribute("type", "password");
            }
            var pwdb = document.getElementById("pid2");
            if (pwdb.getAttribute("type") == "password") {
                pwdb.setAttribute("type", "text");
            } else {
                pwdb.setAttribute("type", "password");
            }
            var pwdc = document.getElementById("pid3");
            if (pwdc.getAttribute("type") == "password") {
                pwdc.setAttribute("type", "text");
            } else {
                pwdc.setAttribute("type", "password");
            }
        });
    }
    ;if ($("span").is("#eyep")) {
        document.getElementById("eyep").addEventListener("click", function(e) {
            var pwdb = document.getElementById("pid2");
            if (pwdb.getAttribute("type") == "password") {
                pwdb.setAttribute("type", "text");
            } else {
                pwdb.setAttribute("type", "password");
            }
            var pwdc = document.getElementById("pid3");
            if (pwdc.getAttribute("type") == "password") {
                pwdc.setAttribute("type", "text");
            } else {
                pwdc.setAttribute("type", "password");
            }
        });
    }
    ;if ($("span").is("#showpasswords")) {
        document.getElementById("showpasswords").addEventListener("click", function(e) {
            if (document.getElementById("password").type == 'password')
                document.getElementById("password").type = 'text';
            else
                document.getElementById("password").type = 'password';
            if (document.getElementById("confirmpassword").type == 'password')
                document.getElementById("confirmpassword").type = 'text';
            else
                document.getElementById("confirmpassword").type = 'password';
        });
    }
    ;if ($("span").is("#showpassword")) {
        document.getElementById("showpassword").addEventListener("click", function(e) {
            if (document.getElementById("password").type == 'password')
                document.getElementById("password").type = 'text';
            else
                document.getElementById("password").type = 'password';
        });
    }
    ;$('#mywonpage div ul li a').on('click', function() {
        document.forms["mywonpage"].submit();
    });
    $('#myponpage div ul li a').on('click', function() {
        document.forms["myponpage"].submit();
    });
    $('#sortbox div ul li a').on('click', function() {
        document.forms["sortbox"].submit();
    });
    $('.filter a').on('click', function(e) {
        e.preventDefault();
        document.forms["pricefromto"].submit();
    });
    $('.showpricerange a').on('click', function(e) {
        e.preventDefault();
        document.forms["pricefromtohead"].submit();
    });
    var input = document.getElementById("email");
    var list = document.getElementById("list");
    var sb2 = document.getElementById("idsb2");
    var listItems = Array.prototype.slice.call(document.querySelectorAll(".boxcontainer #list > div"));
    if (input !== null) {
        input.addEventListener("click", function() {
            list.classList.remove("hidden");
        });
        input.addEventListener("input", function() {
            list.classList.add("hidden");
        });
        input.addEventListener("click", function() {
            if (input.value == '') {
                sb2.classList.add("hidden");
            } else {
                sb2.classList.remove("hidden");
            }
        });
    }
    listItems.forEach(function(item) {
        item.addEventListener("click", function() {
            if (this.className == 'sb1 highlight')
                input.value = item.textContent;
            else
                input.value = '';
            list.classList.add("hidden");
        });
        item.addEventListener("mouseover", function() {
            item.classList.add("highlight");
        });
        item.addEventListener("mouseout", function() {
            item.classList.remove("highlight");
        });
    });
    $(document).on('mouseup touchend', function(e) {
        if ($('#list').is(":visible")) {
            var hidelist = $('#list');
            if (!hidelist.is(e.target) && hidelist.has(e.target).length === 0) {
                list.classList.add("hidden");
            }
        }
    });
    $('.cboxcontainer').each(function(index, element) {
        var cinput = $('.cinput', this);
        var clist = $('.clist', this);
        var cb2 = $('.idcb2', this);
        var clistItems = Array.prototype.slice.call(this.querySelectorAll(".cboxcontainer .clist > div"));
        cinput.on("click", function() {
            clist.removeClass("hidden");
        });
        clistItems.forEach(function(item) {
            item.addEventListener("click", function() {
                if (this.className == 'cb1 highlight') {
                    cinput.val(item.textContent);
                    var ccode;
                    ccode = item.textContent.split(' - ');
                    setCookie("noac", "", "Mon, 01-Jan-2100 00:00:00 GMT", "/");
                    setCookie("ac", ccode[0], "Mon, 01-Jan-2100 00:00:00 GMT", "/");
                    $.ajax({
                        method: "POST",
                        url: '/uacurrency',
                        data: {
                            noac: '',
                            ac: ccode[0]
                        },
                        cache: false,
                        success: function(data) {
                            setCookie("chartac", "visible", "Mon, 01-Jan-2100 00:00:00 GMT", "/");
                            document.location.reload();
                        }
                    });
                    $('.cboxcontainer').each(function() {
                        var ecbox = $('.cb1', this).map(function() {
                            return $(this).text();
                        }).get();
                        ecboxlength = ecbox.length;
                        for (i = 0; i < ecboxlength; i++) {
                            ecb1item = ecbox[i].split(' - ');
                            if (ecb1item[0] == ccode[0]) {
                                $('.cinput', this).val(ecbox[i]);
                                break;
                            }
                        }
                    });
                } else {
                    cinput.val('');
                    $('.cinput').css('cursor', 'default');
                    $('.cinput').remove();
                    $('.cboxcontainer').remove();
                    $('.products .element p.price.categoryprice').css('float', 'none');
                    setCookie("noac", "0", "Mon, 01-Jan-2100 00:00:00 GMT", "/");
                    setCookie("ac", "", "Mon, 01-Jan-2100 00:00:00 GMT", "/");
                    $.ajax({
                        method: "POST",
                        url: '/uacurrency',
                        data: {
                            noac: '0',
                            ac: ''
                        },
                        cache: false,
                        success: function(data) {}
                    });
                }
                clist.addClass("hidden");
            });
            item.addEventListener("mouseover", function() {
                item.classList.add("highlight");
            });
            item.addEventListener("mouseout", function() {
                item.classList.remove("highlight");
            });
        });
        $('.cinput', this).focus(function() {
            $(this).blur();
        });
    });
    $(document).on('mouseup touchend', function(e) {
        $('.cboxcontainer').each(function(index, element) {
            if ($('.clist', this).is(":visible")) {
                var hideclist = $('.clist', this);
                if (!hideclist.is(e.target) && hideclist.has(e.target).length === 0) {
                    $('.clist', this).addClass("hidden");
                }
            }
        });
    });
    if ($('.cboxcontainer .cinput').length == 0)
        $('.products .element p.price.categoryprice').css('float', 'none');
    $('[name=\'radiocurrency\']').on('click', function() {
        var alist = $('[name=\'radiocurrency\']:checked').val();
        if (alist == '0') {
            setCookie("noac", "0", "Mon, 01-Jan-2100 00:00:00 GMT", "/");
            setCookie("ac", "", "Mon, 01-Jan-2100 00:00:00 GMT", "/");
            $.ajax({
                method: "POST",
                url: '/uacurrency',
                data: {
                    noac: '0',
                    ac: ''
                },
                cache: false,
                success: function(data) {}
            });
        } else if (alist == '1') {
            setCookie("noac", "", "Mon, 01-Jan-2100 00:00:00 GMT", "/");
            setCookie("ac", "", "Mon, 01-Jan-2100 00:00:00 GMT", "/");
            $.ajax({
                method: "POST",
                url: '/uacurrency',
                data: {
                    noac: '',
                    ac: ''
                },
                cache: false,
                success: function(data) {}
            });
        } else {
            setCookie("noac", "", "Mon, 01-Jan-2100 00:00:00 GMT", "/");
            setCookie("ac", alist, "Mon, 01-Jan-2100 00:00:00 GMT", "/");
            $.ajax({
                method: "POST",
                url: '/uacurrency',
                data: {
                    noac: '',
                    ac: alist
                },
                cache: false,
                success: function(data) {}
            });
        }
    });
    $('#internalcarousel img').click(function() {
        var w = $('#mainimage img').css('width');
        w = w.replace(/[^-0-9\.]/gim, '');
        var h = $('#mainimage img').css('height');
        h = h.replace(/[^-0-9\.]/gim, '');
        var img = $(this).attr("src");
        img = img.replace(/\?.*$/gim, '');
        $('#mainimage a').attr('href', img);
        $('#mainimage a picture img').attr('src', img + '?w=' + w + '&h=' + h);
        $('#mainimage a picture #webpsource').attr('srcset', img + '?w=' + w + '&h=' + h);
        $('#mainimage a picture #jpgsource').attr('srcset', img + '?w=' + w + '&h=' + h + '&nowebp=1');
        $('#mainimage a picture img').attr('onload', 'cih(' + h + ')');
        $('#internalcarousel img').removeClass('activesimage');
        $(this).addClass('activesimage');
    });
    var docwidth = getWidth();
    var subdomain = domain(0);
    if ((docwidth < 350) && ((subdomain == 'de') || (subdomain == 'fr'))) {
        if ($('#trackupdate:visible').length)
            $('#trackbox').css('height', '52px');
    }
    $('.default.checkform #checkcontact').val('1');
    $('form[name="registration"] #check').val('1');
    $('form[name="registration"] #checkregonpage').val('1');
});
$(window).on("load", function() {
    ws = 0;
    $("#clickmeup").on("click", {
        arrowap: 'clickmeup'
    }, showaddlimages);
    $("#clickmedown").on("click", {
        arrowap: 'clickmedown'
    }, showaddlimages);
    timer();
});
function timer() {
    var windowWidth = window.innerWidth ? window.innerWidth : $(window).width();
    var hmi = $('#internalcarousel img').length;
    var lr;
    var ml;
    var mainimagewidth;
    $('#clickmedown').show();
    $('#clickmeup').show();
    $('.imgblock').css('margin-top', '0');
    $('.imgblock').css('margin-left', '0');
    $("#internalcarousel").css('margin-top', '0');
    $("#internalcarousel").css('margin-left', '0');
    $('.gray.grayblack').css('margin-top', '0');
    $('.mdl').css('margin-top', '0');
    if (windowWidth > 764) {
        $('.imgblock').css('width', '60');
        $('.imgblock .intimgblock').css('width', '60');
        $('#clickmeup').attr('src', '/img/arrow-gray-up.jpg');
        $('#clickmedown').attr('src', '/img/arrow-black-down.jpg');
        if (hmi <= 3) {
            $('#clickmedown').css('display', 'none');
            $('#clickmeup').css('display', 'none');
        }
    }
    if ((windowWidth <= 764) && (windowWidth > 524)) {
        $('.imgblock').css('width', '90%');
        $('.imgblock .intimgblock').css('width', '149');
        mainimagewidth = $('#mainimage').width();
        $('.imgblock').css('margin-top', $('#mainimage').height() + 10);
        $('.gray.grayblack').css('margin-top', '50px');
        $('#clickmeup').attr('src', '/img/arrow-gray-left.jpg');
        $('#clickmedown').attr('src', '/img/arrow-black-right.jpg');
        if (hmi <= 3) {
            $('#clickmedown').css('display', 'none');
            $('#clickmeup').css('display', 'none');
            ws = hmi;
            ml = (mainimagewidth - (ws * 47) - ((ws + 1) * 2)) / 2;
            ml = Math.round(ml);
            $('.imgblock').css('margin-left', ml);
        }
    }
    if (windowWidth <= 524) {
        $('.imgblock').css('width', 'inherit');
        $('.imgblock .intimgblock').css('width', '210');
        mainimagewidth = $('#mainimage').width();
        ws = 4;
        lr = 36;
        if (hmi <= 4) {
            $('#clickmedown').css('display', 'none');
            $('#clickmeup').css('display', 'none');
            ws = hmi;
            lr = 0;
        }
        if (hmi > 4) {
            var variable;
            var isremovearrows;
            var needmoremargin;
            needmoremargin = 0;
            isremovearrows = 0;
            for (i = 5; i <= hmi; i++) {
                variable = i * 50 + ((i + 1) * 2);
                if (variable <= (mainimagewidth - 52)) {
                    ws = i;
                    needmoremargin = needmoremargin + 52;
                    if (i == hmi) {
                        isremovearrows = 1;
                        lr = 0;
                    }
                }
            }
            var currentwidth = $('.imgblock .intimgblock').width();
            $('.imgblock .intimgblock').css('width', currentwidth + needmoremargin);
            if (isremovearrows == 1) {
                $('#clickmedown').css('display', 'none');
                $('#clickmeup').css('display', 'none');
            }
        }
        ml = (mainimagewidth - (ws * 50) - ((ws + 1) * 2) - lr) / 2;
        ml = Math.round(ml);
        $('.imgblock').css('margin-left', ml);
        $('.imgblock').css('margin-top', $('#mainimage').height() + 5);
        $('.mdl').css('margin-top', '50px');
        $('#clickmeup').attr('src', '/img/arrow-gray-left.jpg');
        $('#clickmedown').attr('src', '/img/arrow-black-right.jpg');
    }
    clearTimeout(this.id);
    this.id = setTimeout(showaddlimages, 200, '');
}
function arrowapclickmeup() {
    var windowWidth = window.innerWidth ? window.innerWidth : $(window).width();
    var hmi = $('#internalcarousel img').length;
    var hmileft;
    var hmiup;
    var hmiright;
    var hmidown;
    var hmicurrent;
    if (windowWidth > 764) {
        hmiup = (hmi - 3) * (-58);
        hmidown = 0;
        hmicurrent = $("#internalcarousel").css('margin-top');
        hmicurrent = hmicurrent.replace(/[^-0-9\.]/gim, '');
        if ((hmicurrent > -855) && (hmicurrent < 855)) {
            if (hmicurrent == -58) {
                $('#clickmeup').attr('src', '/img/arrow-gray-up.jpg');
            }
            if (hmidown > hmicurrent)
                $("#internalcarousel").animate({
                    "margin-top": "+=58"
                }, 500, function() {});
            if (hmiup <= hmicurrent) {
                $('#clickmedown').attr('src', '/img/arrow-black-down.jpg');
            }
        }
    }
    if ((windowWidth <= 764) && (windowWidth > 524)) {
        hmileft = (hmi - 3) * (-49);
        hmiright = 0;
        hmicurrent = $("#internalcarousel").css('margin-left');
        hmicurrent = hmicurrent.replace(/[^-0-9\.]/gim, '');
        if ((hmicurrent > -855) && (hmicurrent < 855)) {
            if (hmicurrent == -49) {
                $('#clickmeup').attr('src', '/img/arrow-gray-left.jpg');
            }
            if (hmiright > hmicurrent)
                $("#internalcarousel").animate({
                    "margin-left": "+=49"
                }, 500, function() {});
            if (hmileft <= hmicurrent) {
                $('#clickmedown').attr('src', '/img/arrow-black-right.jpg');
            }
        }
    }
    if (windowWidth <= 524) {
        hmileft = (hmi - ws) * (-52);
        hmiright = 0;
        hmicurrent = $("#internalcarousel").css('margin-left');
        hmicurrent = hmicurrent.replace(/[^-0-9\.]/gim, '');
        if ((hmicurrent > -855) && (hmicurrent < 855)) {
            if (hmicurrent == -52) {
                $('#clickmeup').attr('src', '/img/arrow-gray-left.jpg');
            }
            if (hmiright > hmicurrent)
                $("#internalcarousel").animate({
                    "margin-left": "+=52"
                }, 500, function() {});
            if (hmileft <= hmicurrent) {
                $('#clickmedown').attr('src', '/img/arrow-black-right.jpg');
            }
        }
    }
}
function arrowapclickmedown() {
    var windowWidth = window.innerWidth ? window.innerWidth : $(window).width();
    var hmi = $('#internalcarousel img').length;
    var hmileft;
    var hmiup;
    var hmiright;
    var hmidown;
    var hmicurrent;
    if (windowWidth > 764) {
        hmiup = (hmi - 3) * (-58);
        hmidown = 0;
        hmicurrent = $("#internalcarousel").css('margin-top');
        hmicurrent = hmicurrent.replace(/[^-0-9\.]/gim, '');
        if ((hmicurrent > -855) && (hmicurrent < 855)) {
            if (hmicurrent == 0) {
                $('#clickmeup').attr('src', '/img/arrow-black-up.jpg');
            }
            if (hmiup < hmicurrent) {
                $("#internalcarousel").animate({
                    "margin-top": "-=58"
                }, 500, function() {});
            }
            if (hmiup >= (hmicurrent - 58)) {
                $('#clickmedown').attr('src', '/img/arrow-gray-down.jpg');
            }
        }
    }
    if ((windowWidth <= 764) && (windowWidth > 524)) {
        hmileft = (hmi - 3) * (-49);
        hmiright = 0;
        hmicurrent = $("#internalcarousel").css('margin-left');
        hmicurrent = hmicurrent.replace(/[^-0-9\.]/gim, '');
        if ((hmicurrent > -855) && (hmicurrent < 855)) {
            if (hmicurrent == 0) {
                $('#clickmeup').attr('src', '/img/arrow-black-left.jpg');
            }
            if (hmileft < hmicurrent) {
                $("#internalcarousel").animate({
                    "margin-left": "-=49"
                }, 500, function() {});
            }
            if (hmileft >= (hmicurrent - 49)) {
                $('#clickmedown').attr('src', '/img/arrow-gray-right.jpg');
            }
        }
    }
    if (windowWidth <= 524) {
        hmileft = (hmi - ws) * (-52);
        hmiright = 0;
        hmicurrent = $("#internalcarousel").css('margin-left');
        hmicurrent = hmicurrent.replace(/[^-0-9\.]/gim, '');
        if ((hmicurrent > -855) && (hmicurrent < 855)) {
            if (hmicurrent == 0) {
                $('#clickmeup').attr('src', '/img/arrow-black-left.jpg');
            }
            if (hmileft < hmicurrent) {
                $("#internalcarousel").animate({
                    "margin-left": "-=52"
                }, 500, function() {});
            }
            if (hmileft >= (hmicurrent - 52)) {
                $('#clickmedown').attr('src', '/img/arrow-gray-right.jpg');
            }
        }
    }
}
function showaddlimages(event) {
    var keyaction;
    if (typeof event.data !== 'undefined') {
        keyaction = event.data.arrowap;
    } else
        keyaction = '';
    if (keyaction == 'clickmeup')
        arrowapclickmeup();
    if (keyaction == 'clickmedown')
        arrowapclickmedown();
}
$(document).ready(function() {
    $('.spoiler_links').click(function() {
        $(this).parent().children('div.spoiler_body').toggle('normal');
        return false;
    });
    $('.spoiler_links_inner').click(function() {
        $(this).parent().children('div.spoiler_body_inner').toggle('normal');
        return false;
    });
});
$(window).on('resize', function() {
    $.colorbox.close();
    if ($('.products .gray .taber .content #tabpcall:visible').length) {
        if (getWidth() <= 535) {
            var tabpcall = $('.products .gray .taber .content #tabpcall').css('height');
            $('.products .gray .taber .content #tabpcall').css('cssText', 'height: ' + tabpcall + ' !important');
            $('.products .gray .taber .content #tabpcall').css('overflow', 'visible');
        } else {
            $('.products .gray .taber .content #tabpcall').css('cssText', 'height: auto !important');
            $('.products .gray .taber .content #tabpcall').css('overflow', 'hidden');
        }
    }
    myselectheight();
    var docwidth = getWidth();
    var subdomain = domain(0);
    var isv = 1;
    if ($('#trackupdate:visible').length) {
        isv = 2;
    }
    if ((docwidth > 824) && (isv == 1)) {
        if (subdomain == 'www')
            $("#trackbox").css('width', '120px');
        else if (subdomain == 'de')
            $("#trackbox").css('width', '180px');
        else if (subdomain == 'es')
            $("#trackbox").css('width', '75px');
        else if (subdomain == 'fr')
            $("#trackbox").css('width', '75px');
        else if (subdomain == 'it')
            $("#trackbox").css('width', '145px');
        else if (subdomain == 'ru')
            $("#trackbox").css('width', '125px');
    } else if ((docwidth > 824) && (isv == 2)) {
        if (subdomain == 'www')
            $("#trackbox").css('width', '150px');
        else if (subdomain == 'de')
            $("#trackbox").css('width', '200px');
        else if (subdomain == 'es')
            $("#trackbox").css('width', '180px');
        else if (subdomain == 'fr')
            $("#trackbox").css('width', '210px');
        else if (subdomain == 'it')
            $("#trackbox").css('width', '165px');
        else if (subdomain == 'ru')
            $("#trackbox").css('width', '185px');
    } else
        $("#trackbox").css('width', 'auto');
    var docwidth = getWidth();
    var subdomain = domain(0);
    if ((docwidth < 350) && ((subdomain == 'de') || (subdomain == 'fr'))) {
        if ($('#trackupdate:visible').length)
            $('#trackbox').css('height', '52px');
    } else
        $('#trackbox').css('height', '26px');
    if ($('#tipsyprice [rel=tipsy]:visible').length) {
        $('#tipsyprice').find('[rel=tipsy]').tipsy('hide');
    }
    if ($('#tipsyemail [rel=tipsy]:visible').length) {
        $('#tipsyemail').find('[rel=tipsy]').tipsy('hide');
    }
});
function setCookie(name, value, expires, path, domain, secure) {
    document.cookie = name + "=" + escape(value) + ((expires) ? "; expires=" + expires : "") + ((path) ? "; path=" + path : "") + "; domain=.pricearchive.org; secure";
}
function getCookie(name) {
    match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match)
        return match[2];
}
function getWidth() {
    var windowWidth = window.innerWidth ? window.innerWidth : $(window).width();
    return windowWidth;
}
function getHeight() {
    var windowHeight = window.innerHeight ? window.innerHeight : $(window).height();
    return windowHeight;
}
function tabpcallsetheight() {
    if (getWidth() <= 535) {
        var tabpcall = $('.products .gray .taber .content #tabpcall').css('height');
        $('.products .gray .taber .content #tabpcall').css('cssText', 'height: ' + tabpcall + ' !important');
    }
    $('.products .gray .taber .content #tabpcall').css('overflow', 'visible');
}
function tabpcallsetheightauto() {
    if (getWidth() <= 535) {
        $('.products .gray .taber .content #tabpcall').css('cssText', 'height: auto !important');
    }
    $('.products .gray .taber .content #tabpcall').css('overflow', 'hidden');
}
function getpasteor() {
    $.ajax({
        method: "GET",
        url: "/orpricetable",
        data: {
            item: $("#item").val(),
            store: $('#pct1storeformat').val(),
            dateformat: $("#pct1dateformat").val(),
            priceformat: $("#pct1priceformat").val(),
            delimitersformat: $("#pct1delimitersformat").val(),
            nodatadays: $("#pct1nodatadays").val()
        },
        cache: false,
        success: function(data) {
            $('.pcall .pcex table tr:not(:first)').remove();
            $('.pcall .pcex table > tbody').append(data);
        }
    });
}
function domain(part) {
    var full = window.location.host;
    var parts = full.split('.');
    var sub = parts[0];
    var domain = parts[1];
    var type = parts[2];
    if (part == 0)
        return sub;
    if (part == 1)
        return domain;
    if (part == 2)
        return type;
}
function moveleft(value) {
    $("#track").fadeOut(500, function() {
        $("#trackbox").animate({
            width: "+" + value
        }, 500, function() {
            $("#trackupdate, #trackdelete").css('opacity', 0).slideDown(500, function() {
                $("#trackupdate, #trackdelete").animate({
                    opacity: 1
                }, {
                    queue: false,
                    duration: 500
                });
            });
        });
    });
}
function myselectheight() {
    var subdomain = domain(0);
    var l = 38;
    if (subdomain == 'de')
        l = 39;
    if (subdomain == 'fr')
        l = 43;
    if (subdomain == 'it')
        l = 43;
    if (($('.products .cSide .top .myset1 .myselect a.value').text().length >= l) && (getWidth() <= 341))
        $('.products .cSide .top.topmyp .myset1 .myselect a.value').css('height', '44');
    else
        $('.products .cSide .top.topmyp .myset1 .myselect a.value').css('height', '22');
}
function cih(h) {
    var windowWidth = window.innerWidth ? window.innerWidth : $(window).width();
    if (windowWidth <= 524) {
        var hn = $('#mainimage img').css('height');
        hn = hn.replace(/[^-0-9\.]/gim, '');
        hn = parseInt(hn, 10);
        h = parseInt(h, 10);
        if (hn < h) {
            $('.mdl').css('margin-top', Math.abs(hn - h) + 50 + 'px');
        } else if (hn > h) {
            $('.mdl').css('margin-top', 50 + 'px');
        }
    }
}
