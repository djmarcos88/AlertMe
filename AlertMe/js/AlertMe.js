/*
* AlertMe plugin v1.0
*
* A simple jQuery plugin to show alerts on the top of the viewport.
*
*
* options:
*			message:			the message that will be shown.
*			duration:			duration of the message in milliseconds. null for infinite.
*			animationSpeed:		animation speed for the message's slide effect.
*			cssWrappingClass:	the CSS class for the wrapping div.
*
* Date: 22/08/2015
*/

; (function (AlertMe, window, document, undefined) {
	var alertMeTimeout = null,
	alertQueue = [],
	queueRunning = false,
	containerId = 'alertMeContainer';
	defaults = {
		message: '',
		duration: 1000,
		animationSpeed: 500,
		cssWrappingClass: 'alert-me'
	};

	AlertMe.write = function (options) {
		this.options = extend({}, defaults, options);

		var messagefn = createMessage();

		alertQueue.push(wrapFunction(messagefn, this));

		if (!queueRunning)
			runQueue();
	};

	// Closes the message and clears the timeout, can be used everywhere.
	AlertMe.close = function () {
		var alertMe = document.getElementById('alertMe');
		alertMe.className = alertMe.className += ' closed';

		setTimeout(function () {
			alertMe.parentElement.removeChild(alertMe);

			clearAlertTimeout();
			runQueue();
		}, this.options.animationSpeed);
	};

	// Creates the container element for AlertMe.
	function init() {
		domReady(function () {
			var container = document.createElement('div');
			container.id = containerId;

			var body = document.getElementsByTagName('body');
			body[0].appendChild(container);
		});
	}

	// Used internally. Standard function to implement delegates.
	wrapFunction = function (fn, context) {
		return function () {
			fn.apply(context);
		};
	};

	// Clears the alerts timeout.
	function clearAlertTimeout() {
		clearTimeout(alertMeTimeout);
		alertMeTimeout = null;
	};

	// Returns a closure function that inserts an alert message into the DOM.
	function createMessage() {
		return function () {
			var that = this;
			var alertMe = document.getElementById('alertMe');

			// This prevents the creation of duplicated alertMe divs.
			if (alertMe !== null) {
				alertMe.parentElement.removeChild(alertMe);
			}

			// This clears the timeout if it's still running, preventing the message from closing before the given duration.
			if (alertMeTimeout !== null) {
				clearAlertTimeout();
			}

			alertMe = appendMessageElement(that);
			setTimeout(function () {
				alertMe.className = alertMe.className.replace('closed', '');
			}, 20);

			if (that.options.duration !== null) {
				alertMeTimeout = setTimeout(function () {
					AlertMe.close.apply(that);
				}, that.options.duration);
			}
		};
	};

	// Creates the message elements and appends them to the alertMe container.
	function appendMessageElement(that) {
		var span = document.createElement('span');
		span.id = 'alertMeMessage';
		span.innerHTML = that.options.message;

		var anchor = document.createElement('a');
		anchor.id = 'alertMeClose';
		anchor.onclick = wrapFunction(AlertMe.close, that);
		anchor.innerHTML = 'x';

		var div = document.createElement('div');
		div.id = 'alertMe';
		div.className = 'closed ' + that.options.cssWrappingClass;

		div.appendChild(span);
		div.appendChild(anchor);

		var alertMeContainer = document.getElementById(containerId);

		// Validates that the alertMeContainer is still on the DOM.
		if (alertMeContainer !== null) {
			return alertMeContainer.appendChild(div);
		}
		else {
			console.error('AlertMe container was removed.');
		}
	}

	// Runs the alerts queue.
	function runQueue() {
		queueRunning = true;

		if (alertQueue.length) {
			(alertQueue.shift())();
		}
		else {
			queueRunning = false;
		}
	};

	function domReady(fn) {
		if (typeof fn !== 'function') return;

		if (document.readyState === 'complete') {
			return fn();
		}

		document.addEventListener('DOMContentLoaded', fn, false);
	};

	function extend(objects) {
		var extended = {};
		var merge = function (obj) {
			for (var prop in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, prop)) {
					extended[prop] = obj[prop];
				}
			}
		};
		merge(arguments[0]);

		for (var i = 1; i < arguments.length; i++) {
			var obj = arguments[i];
			merge(obj);
		}
		return extended;
	};

	init();
	return AlertMe;
})(this.AlertMe = this.AlertMe || {}, window, document);