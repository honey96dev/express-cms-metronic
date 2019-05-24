"use strict";

// Class Definition
var KTLoginV1 = function () {

	// var login = $('#kt_login');
	jQuery.validator.setDefaults({
		debug: true,
		success: "valid"
	});

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

	var handleLoginFormSubmit = function () {
		$('#kt_login_signin_submit').click(function (e) {
			e.preventDefault();
			var btn = $(this);
			var form = $('.kt-login__form form');

			form.validate({
				rules: {
					email: {
						required: true,
						email: true,
					},
					password: {
						required: true,
					},
				},
				messages: {
					email: "Por favor introduzca su correo electrónico",
					password: "Por favor introduzca su contraseña",
				},
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

		$('#kt_login_signup_submit').click(function (e) {
			e.preventDefault();
			var btn = $(this);
			var form = $('.kt-login__form form');

			form.validate({
				rules: {
					name: {
						required: true,
					},
					email: {
						required: true,
						email: true,
					},
					password: {
						required: true,
					},
					accept1: {
						required: true,
					},
					accept2: {
						required: true,
					},
				},
				messages: {
					name: "Por favor escriba su nombre",
					email: "Por favor introduzca su correo electrónico",
					password: "Por favor, introduzca su contraseña",
					accept1: "Por favor acepta esto",
					accept2: "Por favor acepta esto",
				},
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
					const result = response.result;
					const message = response.message;
					btn.attr('disabled', false);
					if (result === 'success') {
						showErrorMsg(form, 'success', message);
					} else if (result === 'error') {
						showErrorMsg(form, 'danger', message);
					}
				}
			});
		});


		$(".show-hide-password-button").click(function() {

			$(".show-hide-password-button i").toggleClass("fa-eye fa-eye-slash");
			var input = $($(this).attr("toggle"));
			if (input.attr("type") == "password") {
				input.attr("type", "text");
			} else {
				input.attr("type", "password");
			}
		});
	}

	// Public Functions
	return {
		// public functions
		init: function () {
			handleLoginFormSubmit();
		}
	};
}();

// Class Initialization
jQuery(document).ready(function () {
	KTLoginV1.init();
});
