
let instance;
function Interesados() {
    this.baseUrl = $('#baseUrl').val();
}
Interesados.prototype.init = function() {
    let self = this;
    self.table = $('#usersTable').DataTable({
        responsive: true,
        searching: false,
        ajax: self.baseUrl + 'interesados/list',
        columns: [
            {
                // width: '12%',
                data: "landlordname",
                className: "text-right",
            }, {
                // width: '12%',
                data: "name",
                className: "text-right",
            }, {
                // width: '12%',
                data: "email",
                className: "text-right",
            }, {
                // width: '12%',
                data: "telephone",
                className: "text-center",
                // render: function (data) {
                //     return '';
                // },
            },{
                // width: '12%',
                data: "properties_name",
                className: "text-center",
                // render: function (data) {
                //     return '';
                // },
            }, {
                // width: '12%',
                data: "createdDate",
                className: "text-right",
                // render: function (data) {
                //     return '';
                // },
            }, {
                // width: '12%',
                data: "id",
                className: "text-center",
                render: function (data, type, row) {
                    return '<button class="btn btn-clean btn-sm btn-icon btn-orange" onclick="instance.editUser(\'' + data + '\')"><i class="fa fa-edit margin-auto"></i></button>';
                },
                orderable: false,
            }, {
                // width: '12%',
                data: "id",
                className: "text-center",
                render: function (data, type, row) {
                    return '<button class="btn btn-clean btn-sm btn-icon btn-orange" onclick="instance.deleteUser(' + data + ')"><i class="fa fa-trash margin-auto"></i></button>';
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

    $('#saveUser').click(function (e) {
        e.preventDefault();
        const btn = $(this);
        const form = $('#userDetailsForm');

        form.validate({
            rules: {
                name: {
                    required: true,
                },
                email: {
                    required: true,
                    email: true,
                },
                // telephone: {
                //     required: true,
                // },
            },
            messages: {
                // name: "Por favor introduzca su correo electrónico",
                name: "Escribe tu nombre",
                // description: "Por favor introduzca su contraseña",
                email: "Escribe tu email",
                // url: "Por favor introduzca su contraseña",
                telephone: "Escribe tu teléfono",
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
                const data = response.data;
                btn.attr('disabled', false);
                if (result === 'success') {
                    console.log(data);
                    // self.showErrorMsg(form, 'success', message);
                    self.table.clear();
                    self.table.rows.add(data);
                    self.table.draw();
                    $('#userDetailsModal').modal('hide');
                } else if (result === 'error') {
                    // self.showErrorMsg(form, 'danger', message);
                }
            },
            error: function (error) {
                btn.attr('disabled', false);
                // self.showErrorMsg(form, 'danger', 'Error desconocido');
            }
        });
    });
};

Interesados.prototype.editUser = function(idx) {
    let self = this;
    parent.location.href = self.baseUrl + 'interesados/application?app_id=' + idx;
};

Interesados.prototype.deleteUser = function(id) {
    let self = this;
    // const button = confirm('Really?');
    const button = confirm('¿Estás seguro?');
    if (button) {
        $.ajax({
            method: 'delete',
            url: self.baseUrl + 'interesados/delete',
            dataType: 'json',
            data: {
                accountId: id,
            },
            success: function (response, status, xhr, $form) {
                const result = response.result;
                const message = response.message;
                if (result === 'success') {
                    $.ajax({
                        method: 'get',
                        url: self.baseUrl + 'interesados/list',
                        dataType: 'json',
                        success: function (data) {
                            self.table.clear();
                            self.table.rows.add(data.data);
                            self.table.draw();
                        },
                    });
                } else if (result === 'error') {
                    // showErrorMsg(form, 'danger', message);
                }
            }
        });
    }
}

$(document).ready(function () {
    instance = new Interesados();
    instance.init();
});
