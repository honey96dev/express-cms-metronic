let instance;

function Propiedades() {
}

Propiedades.prototype.init = function () {
    const self = this;
    self.baseUrl = $('#baseUrl').val();

    self.table = $('#table').DataTable({
        responsive: true,
        searching: false,
        ajax: self.baseUrl + 'propiedades/list',
        columns: [
            {
                width: '70',
                data: null,
                className: "text-right",
                render: function (data, type, row, meta) {
                    return meta.row + 1;
                },
            }, {
                data: "name",
            }, {
                data: "userName",
            }, {
                data: "address",
            }, {
                data: null,
                render: function (data, type, row, meta) {
                    return '';
                },
            }, {
                data: 'rooms',
            }, {
                data: 'baths',
            }, {
                data: null,
                render: function (data, type, row, meta) {
                    return '';
                },
            }, {
                data: 'creationDate',
            }, {
                width: '50',
                data: "id",
                className: "text-center",
                render: function (data, type, row, meta) {
                    return '<button class="btn btn-clean btn-sm btn-icon btn-orange" data-toggle="modal", data-target="#userDetailsModal" onclick="instance.editItem(' + data + ')"><i class="fa fa-edit margin-auto"></i></button>';
                },
                orderable: false,
            }, {
                width: '50',
                data: "id",
                className: "text-center",
                render: function (data, type, row) {
                    return '<button class="btn btn-clean btn-sm btn-icon btn-orange" onclick="instance.deleteItem(' + data + ')"><i class="fa fa-trash margin-auto"></i></button>';
                },
                orderable: false,
            },
        ],
        order: [],
        language: {
            search: "",
            sLengthMenu: "_MENU_",
        },
    });

    $('#addButton').click(function (e) {
        document.location = instance.baseUrl + 'propiedades/nueva';
    });

    $('#deleteButton').click(function (e) {
        // const id = $('#itemId').val();
        const form = $('#deleteForm');
        form.ajaxSubmit({
            method: 'DELETE',
            success: function (res, status, xhr) {
                if (res.result == 'success') {
                    $('#deleteModal').modal('hide');
                    self.table.clear();
                    self.table.rows.add(res.data);
                    self.table.draw();
                } else {
                    self.showErrorMsg($('#deleteForm'), 'danger', res.message);
                }
            },
            error: function (error) {
                self.showErrorMsg($('#deleteForm'), 'danger', 'Error desconocido');
            }
        })
    });
};

Propiedades.prototype.editItem = function (id) {
    document.location = instance.baseUrl + 'anuncios/nueva?id=' + id;
};

Propiedades.prototype.deleteItem = function (id) {
    $('#itemId').val(id);
    const container = $('#deleteModal');
    container.find('.alert').remove();
    container.modal('show');
};

Propiedades.prototype.showErrorMsg = function (container, type, msg) {
    var alert = $('<div class="kt-alert kt-alert--outline alert alert-' + type + ' alert-dismissible" role="alert">\
			<button type="button" class="close" data-dismiss="alert" aria-label="Close"></button>\
			<span></span>\
		</div>');

    container.find('.alert').remove();
    alert.prependTo(container);
    //alert.animateClass('fadeIn animated');
    KTUtil.animateClass(alert[0], 'fadeIn animated');
    alert.find('span').html(msg);
};

$(document).ready(function () {
    instance = new Propiedades();
    instance.init();

});
