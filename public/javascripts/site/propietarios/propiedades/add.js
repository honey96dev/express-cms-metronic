let instance;

function AddProperty() {

}

AddProperty.prototype.init = function() {
    this.typeView = $('#property_type').select2({
        placeholder: "Type",
    });
    this.roomsView = $('#property_rooms').select2({
        placeholder: "Rooms",
    });
    this.bathView = $('#property_baths').select2({
        placeholder: "Baths",
    });
    this.m2View = $('#property_m2').select2({
        placeholder: "m2",
    });
    this.mapView = new GMaps({
        div: '#property_gmap',
        lat: -12.043333,
        lng: -77.028333
    });
}

$(document).ready(function () {
    instance = new AddProperty();
    instance.init();
});
