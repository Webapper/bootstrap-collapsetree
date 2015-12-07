/* ========================================================================
 * Bootstrap plugin: collapse-tree.js v1.1
 * Bootstrap original: collapse.js v3.3.5
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Original Copyright 2011-2015 Twitter, Inc.
 * Plugin Copyright 2015 Webapper
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
	'use strict';

	// COLLAPSE PUBLIC CLASS DEFINITION
	// ================================

	var CollapseTree = function (element, options) {
		this.$element      = $(element)
		this.options       = $.extend({}, CollapseTree.DEFAULTS, options)
		this.$trigger      = $('[data-toggle="collapse-tree"][href="#' + element.id + '"],' +
		'[data-toggle="collapse-tree"][data-target="#' + element.id + '"]')
		this.transitioning = null

		if (this.options.parent) {
			this.$parent = this.getParent()
		} else {
			this.addAriaAndCollapsedClass(this.$element, this.$trigger)
		}

		if (this.options.toggle) this.toggle()
	}

	CollapseTree.VERSION  = '1.0.0'

	CollapseTree.TRANSITION_DURATION = 350

	CollapseTree.DEFAULTS = {
		toggle: true
	}

	CollapseTree.prototype.dimension = function () {
		var hasWidth = this.$element.hasClass('width')
		return hasWidth ? 'width' : 'height'
	}

	CollapseTree.prototype.show = function () {
		if (this.transitioning || this.$element.hasClass('in')) return

		var activesData
		var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

		if (actives && actives.length) {
			activesData = actives.data('bs.collapse')
			if (activesData && activesData.transitioning) return
		}

		var startEvent = $.Event('show.bs.collapse')
		this.$element.trigger(startEvent)
		if (startEvent.isDefaultPrevented()) return

		if (actives && actives.length) {
			Plugin.call(actives, 'hide')
			activesData || actives.data('bs.collapse', null)
		}

		var dimension = this.dimension()

		this.$element
			.removeClass('collapse')
			.addClass('collapsing')[dimension](0)
			.attr('aria-expanded', true)

		this.$trigger
			.removeClass('collapsed')
			.attr('aria-expanded', true)

		this.transitioning = 1

		var complete = function () {
			this.$element
				.removeClass('collapsing')
				.addClass('collapse in')[dimension]('')
			this.transitioning = 0
			this.$element
				.trigger('shown.bs.collapse')
		}

		if (!$.support.transition) return complete.call(this)

		var scrollSize = $.camelCase(['scroll', dimension].join('-'))

		this.$element
			.one('bsTransitionEnd', $.proxy(complete, this))
			.emulateTransitionEnd(CollapseTree.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
	}

	CollapseTree.prototype.hide = function () {
		if (this.transitioning || !this.$element.hasClass('in')) return

		var startEvent = $.Event('hide.bs.collapse')
		this.$element.trigger(startEvent)
		if (startEvent.isDefaultPrevented()) return

		var dimension = this.dimension()

		this.$element[dimension](this.$element[dimension]())[0].offsetHeight

		this.$element
			.addClass('collapsing')
			.removeClass('collapse in')
			.attr('aria-expanded', false)

		this.$trigger
			.addClass('collapsed')
			.attr('aria-expanded', false)

		this.transitioning = 1

		var complete = function () {
			this.transitioning = 0
			this.$element
				.removeClass('collapsing')
				.addClass('collapse')
				.trigger('hidden.bs.collapse')
		}

		if (!$.support.transition) return complete.call(this)

		this.$element
			[dimension](0)
			.one('bsTransitionEnd', $.proxy(complete, this))
			.emulateTransitionEnd(CollapseTree.TRANSITION_DURATION)
	}

	CollapseTree.prototype.toggle = function () {
		this[this.$element.hasClass('in') ? 'hide' : 'show']()
	}

	CollapseTree.prototype.getParent = function () {
		return $(this.options.parent)
			.find('[data-toggle="collapse-tree"][data-parent="' + this.options.parent + '"]')
			.each($.proxy(function (i, element) {
				var $element = $(element)
				this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
			}, this))
			.end()
	}

	CollapseTree.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
		var isOpen = $element.hasClass('in')

		$element.attr('aria-expanded', isOpen)
		$trigger
			.toggleClass('collapsed', !isOpen)
			.attr('aria-expanded', isOpen)
	}

	function getTargetFromTrigger($trigger) {
		var href
		var target = $trigger.attr('data-target')
			|| (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

		return $(target)
	}


	// COLLAPSE PLUGIN DEFINITION
	// ==========================

	function Plugin(option) {
		return this.each(function () {
			var $this   = $(this)
			var data    = $this.data('bs.collapse')
			var options = $.extend({}, CollapseTree.DEFAULTS, $this.data(), typeof option == 'object' && option)

			if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
			if (!data) $this.data('bs.collapse', (data = new CollapseTree(this, options)))
			if (typeof option == 'string') data[option]()
		})
	}

	var old = $.fn.collapse_tree

	$.fn.collapse_tree             = Plugin
	$.fn.collapse_tree.Constructor = CollapseTree


	// COLLAPSE NO CONFLICT
	// ====================

	$.fn.collapse_tree.noConflict = function () {
		$.fn.collapse_tree = old
		return this
	}


	// COLLAPSE DATA-API
	// =================

	$(document).on('click.bs.collapse.data-api', '.collapse-tree li > .row:has(*)', function (e) {
		var $this = $(this)
		var $parent = $this.closest('li')
		var hasChild = ($parent.filter('[data-toggle="collapse-tree"]').length > 0)
		var startEvent = $.Event('before-select.bs.collapse')
		$this.trigger(startEvent)
		if (startEvent.isDefaultPrevented()) return

		$this.parents('.collapse-tree')
			.find('li > .row')
			.removeClass('selected')
		$this.addClass('selected')

		$this.trigger('selected.bs.collapse')

		if (!hasChild) {
			e.preventDefault()
			e.stopPropagation()
		}
	})

	$(document).on('click.bs.collapse.data-api', '[data-toggle="collapse-tree"]', function (e) {
		var $this   = $(this)

		if (!$this.attr('data-target')) e.preventDefault()

		var $target = getTargetFromTrigger($this)
		var data    = $target.data('bs.collapse')
		var option  = data ? 'toggle' : $this.data()

		Plugin.call($target, option)

		e.preventDefault()
		e.stopPropagation()
	})

}(jQuery);
