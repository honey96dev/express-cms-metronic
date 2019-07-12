let instance;

function AddListing() {

}

AddListing.prototype.init = function() {
    const self = this;
    self.typeView = $('#type').select2({
        placeholder: "Type",
    });
    self.roomsView = $('#rooms').select2({
        placeholder: "Rooms",
    });
    self.bathView = $('#baths').select2({
        placeholder: "Baths",
    });
    self.mapView = new GMaps({
        div: '#gmap',
        lat: -12.043333,
        lng: -77.028333
    });

    self.autocomplete = new google.maps.places.Autocomplete($('#address')[0]);
    self.autocomplete.bindTo('bounds', self.mapView);
    self.autocomplete.setFields(['address_components', 'geometry', 'icon', 'name']);

    $('#address').on('change', function (e) {
        const value = $('#address').val();

        GMaps.geocode({
            address: value,
            callback: function(results, status) {
                if (status == 'OK') {
                    var latlng = results[0].geometry.location;
                    self.mapView.fitBounds(results[0].geometry.viewport);
                    self.mapView.removeMarkers();
                    self.mapView.addMarker({
                        lat: latlng.lat(),
                        lng: latlng.lng()
                    });
                }
            }
        });
    });

    const dropzoneOptions = {
        url: '/anuncios/photo',
        dictDefaultMessage: "",
        maxFiles: 1,
        parallelUploads: 1,
        acceptedFiles: 'image/*',
    };

    self.photo1 = new Dropzone("#photo1", dropzoneOptions);
    self.photo1.on('addedfile', function() {
        if (typeof self.prevPhoto1 !== "undefined") {
            self.photo1.removeFile(self.prevPhoto1);
        }
    });
    self.photo1.on('success', function(file, responseText) {
        self.prevPhoto1 = file;
    });

    self.photo2 = new Dropzone("#photo2", dropzoneOptions);
    self.photo2.on('addedfile', function() {
        if (typeof self.prevPhoto2 !== "undefined") {
            self.photo2.removeFile(self.prevPhoto2);
        }
    });
    self.photo2.on('success', function(file, responseText) {
        self.prevPhoto2 = file;
    });

    self.photo3 = new Dropzone("#photo3", dropzoneOptions);
    self.photo3.on('addedfile', function() {
        if (typeof self.prevPhoto3 !== "undefined") {
            self.photo3.removeFile(self.prevPhoto3);
        }
    });
    self.photo3.on('success', function(file, responseText) {
        self.prevPhoto3 = file;
    });

    self.availableView = $('#availableForm').select2({
        placeholder: "Available Form",
    });

    $('#saveButton').click(function (e) {
        e.preventDefault();
        const form = $('#form');
        const btn = $(this);

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
                monthlyPrice: {
                    required: true,
                },
                securityDeposit: {
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
                        document.location = '/anuncios';
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

Dropzone.autoDiscover = false;

$(document).ready(function () {
    instance = new AddListing();
    instance.init();
});
