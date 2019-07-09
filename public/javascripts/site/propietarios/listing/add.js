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
        div: '#property_gmap',
        lat: -12.043333,
        lng: -77.028333
    });
    self.availableView = $('#availableForm').select2({
        placeholder: "Available Form",
    });
    //
    const dropzoneOptions = {
        url: '/anuncios/photo',
        dictDefaultMessage: "",
        maxFiles: 1,
        parallelUploads: 1,
        // thumbnailWidth: null,
        // thumbnailHeight: null,
        // init: function() {
        //     this.on("thumbnail", function(file, dataUrl) {
        //         $('.dz-image').last().find('img').attr({width: '100%', height: '100%'});
        //     }),
        //         this.on("success", function(file) {
        //             $('.dz-image').css({"width":"100%", "height":"auto"});
        //         })
        // }
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
}

Dropzone.autoDiscover = false;

$(document).ready(function () {
    instance = new AddListing();
    instance.init();
});
