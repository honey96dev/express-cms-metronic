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

    $('#addButton').click(function (e) {
        console.log(e);
    });
};

$(document).ready(function () {
    instance = new AddProperty();
    instance.init();
});
