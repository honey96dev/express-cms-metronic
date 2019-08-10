
let instance;
function Users() {
    this.baseUrl = $('#baseUrl').val();
}
Users.prototype.init = function() {
    let self = this;
    self.table = $('#usersTable').DataTable({
        responsive: true,
        searching: false,
        ajax: self.baseUrl + 'users/list',
        columns: [
            {
                // width: '12%',
                data: "site",
                className: "text-right",
                render: function (data, type, row) {
                    if(data=="Inquilinos")
                        return '<button class="btn btn-fixed-width btn-inquilinos btn-sm btn-icon btn-orange btn-pill">' + data + '</button>';
                    else
                        return '<button class="btn btn-fixed-width btn-propietario btn-sm btn-icon btn-orange btn-pill">' + data + '</button>';                    
                },
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
            }, {
                // width: '12%',
                data: "emailVerified",
                className: "text-right",
                render: function (data, type, row) {
                    return data == '0' ? "Non-Logged" : "Logged";
                },
            }, {
                // width: '12%',
                data: "createdDate",
                className: "text-right",
                // render: function (data) {
                //     return '';
                // },
            }, {
                // width: '12%',
                data: "num",
                className: "text-center",
                render: function (data, type, row) {
                    return '<button class="btn btn-clean btn-sm btn-icon btn-orange" data-toggle="modal", data-target="#userDetailsModal" onclick="instance.editUser(\'' + data + '\')"><i class="fa fa-edit margin-auto"></i></button>';
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

Users.prototype.editUser = function(idx) {
    let self = this;
    const dataSet = self.table.rows().data();
    const row = dataSet[idx];
    console.log(dataSet, idx, row);
    $('#userId').val(row.id);
    $('#name').val(row.name);
    $('#email').val(row.email);
    $('#telephone').val(row.telephone);
    // $.ajax({
    //     url: '',
    //     method: 'GET',
    //     dataType: 'json',
    //     data: {
    //         id: id,
    //     },
    //     success: function (res, xhr, status) {
    //         $('email')
    //     },
    // });
};

Users.prototype.deleteUser = function(id) {
    let self = this;
    // const button = confirm('Really?');
    const button = confirm('¿Estás seguro?');
    if (button) {
        $.ajax({
            method: 'delete',
            url: self.baseUrl + 'users/delete',
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
                        url: self.baseUrl + 'users/list',
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
    instance = new Users();
    instance.init();
});
