let instance;

function Documentos() {

}

Documentos.prototype.init = function () {
    $('#addDocumento').click(function (e) {
        $('#documentoDetailsForm').find('.alert').remove();
        $('#documentoDetailsForm').data('method', 'post');
        $('#name').val('');
        $('#description').val('');
        $('#url').val('');
    })
};

$(document).ready(function () {
    instance = new Documentos();
    instance.init();
});
