let instance;

function AddListing() {

}

AddListing.prototype.init = function() {
    const self = this;
    self.id = $('#id').val();

    self.typeView = $('#type').select2({
        placeholder: "Tipo",
        minimumResultsForSearch: Infinity
    });
    self.roomsView = $('#rooms').select2({
        placeholder: "Habitaciones",
        minimumResultsForSearch: Infinity
    });
    self.bathView = $('#baths').select2({
        placeholder: "Baños",
        minimumResultsForSearch: Infinity
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

    // self.availableView = $('#availableForm').select2({
    //     placeholder: "Available Form",
    // });

    let arrows;
    if (KTUtil.isRTL()) {
        arrows = {
            leftArrow: '<i class="la la-angle-right"></i>',
            rightArrow: '<i class="la la-angle-left"></i>'
        }
    } else {
        arrows = {
            leftArrow: '<i class="la la-angle-left"></i>',
            rightArrow: '<i class="la la-angle-right"></i>'
        }
    }
    $('#availableForm').datepicker({
        rtl: KTUtil.isRTL(),
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        templates: arrows,
        autoclose: true,
        format: 'dd/mm/yyyy'
    });

    $('#saveButton').click(function (e) {
        e.preventDefault();
        const form = $('#form');
        const btn = $(this);

        $('#type1').val($('#type').val());
        $('#rooms1').val($('#rooms').val());
        $('#baths1').val($('#baths').val());

        form.validate({
            rules: {
                name: {
                    required: true,
                },
                address: {
                    required: true,
                },
                type1: {
                    required: true,
                },
                rooms1: {
                    required: true,
                },
                baths1: {
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
                description: {
                    required: true,
                    minlength: 140,
                    maxlength: 10000,
                },
                availableForm: {
                    required: true,
                },
            },
            messages: {

            },
        });

        if (!form.valid()) {
            return;
        }

        if($(".dz-image").length == 0)
            return;

        btn.attr('disabled', true);
        // btn.addClass('kt-loader kt-loader--right kt-loader--light').attr('disabled', true);
        // console.log('addButton');
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
                        // document.location = '/anuncios';
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

    $('#backButton').click(function (e) {
        document.location = '/anuncios';
    });

    const address = $('#address').val();

    GMaps.geocode({
        address: address,
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

    self.photoZone = [];
    self.prevPhoto = [];
    self.initPhotoDropzone();
};

AddListing.prototype.initPhotoDropzone = function () {
    const self = this;
    $.ajax({
        url: '/anuncios/photo',
        method: 'GET',
        data: {
            id: self.id,
        },
        dataType: 'json',

        success: function (response, status, xhr, $form) {
            const result = response.result;
            const data = response.data;
            const cnt = data.length;
            if (result == 'error' || cnt === 0) {
                return self.addPhotoDropzone();
            }

            const dropzoneOptions = {
                url: '/anuncios/photo',
                dictDefaultMessage: "",
                maxFiles: 1,
                parallelUploads: 1,
                acceptedFiles: 'image/*',
                maxFilesize: 5,
            };
            let html = '<div class="col-md-4 text-center">' +
                '<div class="image-100 dropzone" id="photo2"></div>' +
                '<input type="hidden" id="">' +
                '</div>';
            let container = $('#photos');

            for (let i = 0; i < cnt; i++) {
                let id =  sprintf('photoZone%d', i);
                let id2 =  sprintf('photo%d', i);

                html = $(sprintf('<div class="col-md-4">' +
                    '<div class="image-100 dropzone" id="%s" style="background: url(%s) no-repeat center; background-size: cover;"></div>' +
                    '<input type="hidden" id="%s" name="photo" value="%s">' +
                    '</div>', id, data[i].length === 0 ? '/images/add_photo.svg' : '/uploads/photo/' + data[i], id2, data[i]));
                html.appendTo(container);
                self.photoZone[i] = new Dropzone('#' + id, dropzoneOptions);
                self.photoZone[i].on('addedfile', function() {
                    if (typeof self.prevPhoto[i] !== "undefined") {
                        self.photoZone[i].removeFile(self.prevPhoto[i]);
                    }
                });
                self.photoZone[i].on('success', function (file, res) {
                    self.prevPhoto[i] = file;
                    console.log(res);
                    $('#' + id).css('background-image', 'url(/images/add_photo.svg)');
                    $('#' + id2).val(res.fileName);
                    const cnt = $('.image-100.dropzone').length;
                    if (i === cnt - 1) {
                        self.addPhotoDropzone();
                    }
                });
            }

            if (data[cnt - 1].length > 0) {
                self.addPhotoDropzone();
            }

            self.dropzoneCnt = $('.image-100.dropzone').length;
        },
        error: function (error) {
            self.addPhotoDropzone();
        }
    })
};

AddListing.prototype.addPhotoDropzone = function () {
    const self = this;

    const dropzoneOptions = {
        url: '/anuncios/photo',
        dictDefaultMessage: "",
        maxFiles: 1,
        parallelUploads: 1,
        acceptedFiles: 'image/*',
        maxFilesize: 5,
    };

    self.dropzoneCnt = $('.image-100.dropzone').length;
    let html = '<div class="col-md-4">' +
        '<div class="image-100 dropzone" id="photo2"></div>' +
        '<input type="hidden" id="">' +
        '</div>';
    let container = $('#photos');
    for (let i = self.dropzoneCnt; i < self.dropzoneCnt + 3; i++) {
        let id =  sprintf('photoZone%d', i);
        let id2 =  sprintf('photo%d', i);

        html = $(sprintf('<div class="col-md-4">' +
            '<div class="image-100 dropzone" id="%s" style="background: url(/images/add_photo.svg) no-repeat center; background-size: cover;"></div>' +
            '<input type="hidden" id="%s" name="photo">' +
            '</div>', id, id2));
        html.appendTo(container);
        self.photoZone[i] = new Dropzone('#' + id, dropzoneOptions);
        self.photoZone[i].on('addedfile', function() {
            if (typeof self.prevPhoto[i] !== "undefined") {
                self.photoZone[i].removeFile(self.prevPhoto[i]);
            }
        });
        self.photoZone[i].on('success', function (file, res) {
            self.prevPhoto[i] = file;
            console.log(res);
            $('#' + id2).val(res.fileName);
            const cnt = $('.image-100.dropzone').length;
            if (i === cnt - 1) {
                self.addPhotoDropzone();
            }
        });
    }

    //
    // self.photo1 = new Dropzone("#photo1", dropzoneOptions);
    // self.photo1.on('addedfile', function() {
    //     if (typeof self.prevPhoto1 !== "undefined") {
    //         self.photo1.removeFile(self.prevPhoto1);
    //     }
    // });
    // self.photo1.on('success', function(file, responseText) {
    //     self.prevPhoto1 = file;
    // });
    //
    // self.photo2 = new Dropzone("#photo2", dropzoneOptions);
    // self.photo2.on('addedfile', function() {
    //     if (typeof self.prevPhoto2 !== "undefined") {
    //         self.photo2.removeFile(self.prevPhoto2);
    //     }
    // });
    // self.photo2.on('success', function(file, responseText) {
    //     self.prevPhoto2 = file;
    // });
    //
    // self.photo3 = new Dropzone("#photo3", dropzoneOptions);
    // self.photo3.on('addedfile', function() {
    //     if (typeof self.prevPhoto3 !== "undefined") {
    //         self.photo3.removeFile(self.prevPhoto3);
    //     }
    // });
    // self.photo3.on('success', function(file, responseText) {
    //     self.prevPhoto3 = file;
    // });
};

AddListing.prototype.showErrorMsg = function (form, type, msg) {
    const alert = $('<div class="kt-alert kt-alert--outline alert alert-' + type + ' alert-dismissible" role="alert">\
			<button type="button" class="close" data-dismiss="alert" aria-label="Close"></button>\
			<span></span>\
		</div>');

    form.find('.alert').remove();
    alert.appendTo(form);
    //alert.animateClass('fadeIn animated');
    KTUtil.animateClass(alert[0], 'fadeIn animated');
    alert.find('span').html(msg);
};

Dropzone.autoDiscover = false;

$(document).ready(function () {
    instance = new AddListing();
    instance.init();
});
