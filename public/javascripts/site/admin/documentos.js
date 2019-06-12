let instance;

function Documentos() {
    this.baseUrl = $('#baseUrl').val();
    this.dataSet = [];
}

Documentos.prototype.init = function () {
    let self = this;
    $('#addDocumento, #addDocumentoLi').click(function (e) {
        $('#documentoDetailsForm').find('.alert').remove();
        $('#documentoDetailsForm').data('method', 'post');
        $('#documentId').val('');
        $('#name').val('');
        $('#description').val('');
        $('#url').val('');
    });

    $('#saveDocument').click(function (e) {
        e.preventDefault();
        const btn = $(this);
        const form = $('#documentoDetailsForm');

        form.validate({
            rules: {
                name: {
                    required: true,
                },
                description: {
                    required: true,
                },
                url: {
                    required: true,
                },
            },
            messages: {
                // name: "Por favor introduzca su correo electrónico",
                name: "Escribe el nombre del documento, por favor",
                // description: "Por favor introduzca su contraseña",
                description: "Escribe la descripción del documento, por favor",
                // url: "Por favor introduzca su contraseña",
                url: "Introduce la url del documento, por favor",
            },
        });

        if (!form.valid()) {
            return;
        }

        btn.attr('disabled', true);
        // btn.addClass('kt-loader kt-loader--right kt-loader--light').attr('disabled', true);

        form.ajaxSubmit({
            url: form[0].action,
            method: form.data('method'),
            dataType: 'json',
            success: function (response, status, xhr, $form) {
                const result = response.result;
                const message = response.message;
                const data = response.data;
                const insertId = response.insertId;
                btn.attr('disabled', false);
                if (result === 'success') {
                    self.showErrorMsg(form, 'success', message);
                    $('#documentId').val(insertId);

                    $('#documentosList').html(self.generateList(data));
                    $('#documentoDetailsModal').modal('hide');
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

    $.ajax({
        url: self.baseUrl + 'documentos/list',
        method: 'GET',
        dataType: 'json',
        success: function (res, status, xhr) {
            const data = res.data;
            $('#documentosList').html(self.generateList(data));
        },
    });
};

Documentos.prototype.showErrorMsg = function (form, type, msg) {
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

Documentos.prototype.generateList = function (items) {
    this.dataSet = items;
    let list = '';
    let idx = 0;
    let item;
    for (let i = 0; i < items.length; i++) {
        item = items[i];
        if (idx %2 == 0) {
            list += '<div class="row">';
        }
        list += '<div class="col-xl-6 col-lg-12"><div class="kt-portlet kt-portlet--height-fluid"><div class="kt-portlet__head"><div class="kt-portlet__head-label  document-title"><a href="' + item.url + '" target="_blank"><h3 class="kt-portlet__head-title" style="width: 100%">' + item.name + '</h3></a></div><div class="kt-portlet__head-toolbar document-toolbar"><button class="btn btn-secondary btn-pill edit-button" data-toggle="modal", data-target="#documentoDetailsModal" onclick="instance.editDocument(\'' + idx + '\')"><i class="fa fa-edit"></i><span class="button-text">Editar</span></button><button class="btn btn-danger btn-pill margin-1-left delete-button"onclick="instance.deleteDocument(\'' + idx + '\')"><i class="fa fa-trash"></i><span class="button-text">Eliminar</span></button></div></div><div class="kt-portlet__body">' + item.description + '</div></div></div>';

        if (idx %2 == 1) {
            list += '</div>';
        }
        idx++;
    }
    return list;
};

Documentos.prototype.editDocument = function(idx) {
    let self = this;
    // console.log('editDocument', id)
    const data = self.dataSet[idx];
    $('#documentoDetailsForm').find('.alert').remove();
    $('#documentoDetailsForm').data('method', 'put');
    $('#documentId').val(data.id);
    $('#name').val(data.name);
    $('#description').val(data.description);
    $('#url').val(data.url);
};

Documentos.prototype.deleteDocument = function(idx) {
    let self = this;
    // const button = confirm('Really?');
    const button = confirm('¿Estás seguro?');
    if (button) {
        $.ajax({
            url: self.baseUrl + 'documentos/save',
            method: 'DELETE',
            dataType: 'json',
            data: {
                documentId: self.dataSet[idx].id,
            },
            success: function (response, status, xhr, $form) {
                const result = response.result;
                const message = response.message;
                const data = response.data;
                if (result === 'success') {
                    $('#documentosList').html(self.generateList(data));
                    alert(message);
                } else if (result === 'error') {
                    alert(message);
                }
            },
            error: function (error) {
                btn.attr('disabled', false);
                self.showErrorMsg(form, 'danger', 'Error desconocido');
            },
        });
    }
};

$(document).ready(function () {
    instance = new Documentos();
    instance.init();
});
