
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
                data: "name",
                className: "text-center",
            }, {
                // width: '12%',
                data: "email",
                className: "text-center",
            }, {
                // width: '12%',
                data: "email",
                className: "text-center",
                render: function (data) {
                    return '';
                },
            }, {
                // width: '12%',
                data: "email",
                className: "text-center",
                render: function (data) {
                    return '';
                },
            }, {
                // width: '12%',
                data: "id",
                className: "text-center",
                render: function (data, type, row) {
                    return '<button class="btn btn-clean btn-sm btn-icon" onclick="instance.deleteUser(' + data + ')"><i class="fa fa-trash margin-auto"></i></button>';
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
}

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
