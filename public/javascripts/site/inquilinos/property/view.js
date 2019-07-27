let instance;

function Property() {

}

Property.prototype.init = function() {
    const self = this;
    self.id = $('#id').val();

    self.mapView = new GMaps({
        div: '#gmap',
        lat: -12.043333,
        lng: -77.028333
    });

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

Property.prototype.initPhotoDropzone = function () {
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
                //return self.addPhotoDropzone();
            }

            let html = '<div class="col-md-4 text-center">' +
                '<div class="image-100 dropzone" id="photo2"></div>' +
                '<input type="hidden" id="">' +
                '</div>';
            let container = $('#photos');

            for (let i = 0; i < cnt; i++) {
                let id =  sprintf('photoZone%d', i);
                let id2 =  sprintf('photo%d', i);
                if(data[i].length === 0)
                    continue;
                html = $(sprintf('<div class="col-md-4">' +
                    '<div class="image-100 dropzone" id="%s" style="background: url(%s) no-repeat center; background-size: cover;"></div>' +
                    '<input type="hidden" id="%s" name="photo" value="%s">' +
                    '</div>', '/uploads/photo/' + data[i], id2, data[i]));
                html.appendTo(container);
            }

            if (data[cnt - 1].length > 0) {
                //self.addPhotoDropzone();
            }

            self.dropzoneCnt = $('.image-100.dropzone').length;
        },
        error: function (error) {
            //self.addPhotoDropzone();
        }
    })
};

Property.prototype.showErrorMsg = function (form, type, msg) {
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

$(document).ready(function () {
    instance = new Property();
    instance.init();
});
