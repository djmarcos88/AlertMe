/*
* AlertMe plugin v1.0
*
* A simple jQuery plugin to show alerts on the top of the viewport.
*
*
* options:
*			message:			the message that will be shown.
*			duration:			duration of the message in milliseconds. 0 for infinite.
*			animationSpeed:		animation speed for the message's slide effect.
*			cssWrappingClass:	the CSS class for the wrapping div.
*
* dependencies: jquery-1.7.2 or newer.
*
* Date: 22/08/2015
*/

; (function (AlertMe, $, window, document, undefined) {
	var alertMeTimeout = null,
	alertQueue = [],
	queueRunning = false,
	defaults = {
		message: '',
		duration: 1000,
		animationSpeed: 500,
		cssWrappingClass: 'alert-me-container'
	};

	AlertMe.write = function (options) {
		this.options = $.extend({}, defaults, options);

		var messagefn = createMessage();

		alertQueue.push(wrapFunction(messagefn, this));

		if (!queueRunning)
			runQueue();
	};

	// Closes the message and clears the timeout, can be used everywhere.
	AlertMe.close = function (animationSpeed) {
		$('#alertMe').slideUp(animationSpeed, function () {
			$('#alertMe').remove();
			clearAlertTimeout();
			runQueue();
		});
	};

	// Used internally. Standard function to implement delegates.
	wrapFunction = function (fn, context) {
		return function () {
			fn.apply(context);
		};
	};

	// Clears the alerts timeout.
	clearAlertTimeout = function () {
		clearTimeout(alertMeTimeout);
		alertMeTimeout = null;
	};

	// Returns a closure function that inserts an alert message into the DOM.
	createMessage = function () {
		return function () {
			var that = this;
			// This prevents the creation of duplicated alertMe divs.
			if ($('#alertMe').length) {
				$('#alertMe').remove();
			}

			// This clears the timeout if it's still running, preventing the message from closing before the given duration.
			if (alertMeTimeout !== null) {
				clearAlertTimeout();
			}

			$('body').append('<div id="alertMe" class="'
				+ that.options.cssWrappingClass
				+ '"> <span id="alertMe-message">'
				+ that.options.message
				+ '</span>  <a id="alertMe-close-anchor" onclick="AlertMe.close()">x</a></div>');

			$('#alertMe').slideDown(that.options.animationSpeed);

			if (that.options.duration !== 0) {
				alertMeTimeout = setTimeout(function () {
					AlertMe.close(that.options.animationSpeed);
				}, that.options.duration);
			}
		};
	};

	// Runs the alerts queue.
	runQueue = function () {
		queueRunning = true;

		if (alertQueue.length) {
			(alertQueue.shift())();
		}
		else {
			queueRunning = false;
		}
	};

	return AlertMe;
})(this.AlertMe = this.AlertMe || {}, jQuery, window, document);