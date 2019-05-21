"use strict";

// Class Definition
var KTLoginV1 = function () {

	var login = $('#kt_login');

	var showErrorMsg = function (form, type, msg) {
		var alert = $('<div class="kt-alert kt-alert--outline alert alert-' + type + ' alert-dismissible" role="alert">\
			<button type="button" class="close" data-dismiss="alert" aria-label="Close"></button>\
			<span></span>\
		</div>');

		form.find('.alert').remove();
		alert.prependTo(form);
		//alert.animateClass('fadeIn animated');
		KTUtil.animateClass(alert[0], 'fadeIn animated');
		alert.find('span').html(msg);
	}

	// Private Functions

	var handleSignInFormSubmit = function () {
		$('#kt_login_signin_submit').click(function (e) {
			e.preventDefault();
			var btn = $(this);
			var form = $('.kt-login__form form');

			form.validate({
				errorElement: "span",
				rules: {
					email: {
						required: true,
						email: true
					},
					password: {
						required: true
					}
				}
			});

			if (!form.valid()) {
				return;
			}

			btn.attr('disabled', true);
			// btn.addClass('kt-loader kt-loader--right kt-loader--light').attr('disabled', true);

			form.ajaxSubmit({
				url: '',
				method: 'post',
				success: function (response, status, xhr, $form) {
					// similate 2s delay
					setTimeout(function () {
						btn.attr('disabled', false);
						// btn.removeClass('kt-loader kt-loader--right kt-loader--light').attr('disabled', false);
						showErrorMsg(form, 'danger', 'Incorrect username or password. Please try again.');
					}, 2000);
				}
			});
		});
	}

	// Public Functions
	return {
		// public functions
		init: function () {
			handleSignInFormSubmit();
		}
	};
}();

// Class Initialization
jQuery(document).ready(function () {
	KTLoginV1.init();

	$(".show-hide-password-button").click(function() {

		$(".show-hide-password-button i").toggleClass("fa-eye fa-eye-slash");
		var input = $($(this).attr("toggle"));
		if (input.attr("type") == "password") {
			input.attr("type", "text");
		} else {
			input.attr("type", "password");
		}
	});
});
