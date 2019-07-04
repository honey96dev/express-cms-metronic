let instance;

function Propiedades() {

}

Propiedades.prototype.init = function () {
    $('#addItem').on('click', function (e) {
        // console.log(e);
        const baseUrl = $('#baseUrl').val();
        document.location = baseUrl + 'propiedades/add';
    });
};

$(document).ready(function () {
    instance = new Propiedades();
    instance.init();
});
