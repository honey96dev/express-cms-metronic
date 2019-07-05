let instance;

function AddProperty() {

}

AddProperty.prototype.init = function() {
    let self = this;
    self.typeView = $('#type').select2({
        placeholder: "Type",
    });
    self.roomsView = $('#rooms').select2({
        placeholder: "Rooms",
    });
    self.bathView = $('#baths').select2({
        placeholder: "Baths",
    });
    self.m2View = $('#m2').select2({
        placeholder: "m2",
    });
    self.mapView = new GMaps({
        div: '#gmap',
        lat: -12.043333,
        lng: -77.028333
    });

    $('#address').on('change', function (e) {
        const value = $('#address').val();

        GMaps.geocode({
            address: value,
            callback: function(results, status) {
                if (status == 'OK') {
                    var latlng = results[0].geometry.location;
                    self.mapView.fitBounds(results[0].geometry.viewport);
                    self.mapView.addMarker({
                        lat: latlng.lat(),
                        lng: latlng.lng()
                    });
                }
            }
        });
    });

    $('#addButton').click(function (e) {
        e.preventDefault();
        const btn = $(this);
        const form = $('#form');

        form.validate({
            rules: {
                name: {
                    required: true,
                },
                address: {
                    required: true,
                },
                type: {
                    required: true,
                },
                rooms: {
                    required: true,
                },
                baths: {
                    required: true,
                },
                surface: {
                    required: true,
                },
                price: {
                    required: true,
                },
                accPrice: {
                    required: true,
                },
            },
            messages: {

            },
        });

        if (!form.valid()) {
            return;
        }

        btn.attr('disabled', true);
        // btn.addClass('kt-loader kt-loader--right kt-loader--light').attr('disabled', true);

        form.ajaxSubmit({
            method: form.data('method'),
            dataType: 'json',
            success: function (response, status, xhr, $form) {
                const result = response.result;
                const message = response.message;
                // const data = response.data;
                // const insertId = response.insertId;
                btn.attr('disabled', false);
                if (result === 'success') {
                    self.showErrorMsg(form, 'success', message);
                    setTimeout(function () {
                        document.location = '/propiedades';
                    }, 2000);
                } else if (result === 'error') {
                    self.showErrorMsg(form, 'danger', message);
                }
            },
            error: function (error) {
                btn.attr('disabled', false);
                self.showErrorMsg(form, 'danger', 'Error desconocido');
            }
        });
    });

    const value = $('#address').val();

    GMaps.geocode({
        address: value,
        callback: function(results, status) {
            if (status == 'OK') {
                var latlng = results[0].geometry.location;
                self.mapView.fitBounds(results[0].geometry.viewport);
                self.mapView.addMarker({
                    lat: latlng.lat(),
                    lng: latlng.lng()
                });
            }
        }
    });
};

AddProperty.prototype.showErrorMsg = function (form, type, msg) {
    const alert = $('<div class="kt-alert kt-alert--outline alert alert-' + type + ' alert-dismissible" role="alert">\
			<button type="button" class="close" data-dismiss="alert" aria-label="Close"></button>\
			<span></span>\
		</div>');

    form.find('.alert').remove();
    alert.prependTo(form);
    //alert.animateClass('fadeIn animated');
    KTUtil.animateClass(alert[0], 'fadeIn animated');
    alert.find('span').html(msg);
};

$(document).ready(function () {
    instance = new AddProperty();
    instance.init();
});
