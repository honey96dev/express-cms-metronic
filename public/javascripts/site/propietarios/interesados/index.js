
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
                    return '<button class="btn btn-clean btn-sm btn-icon btn-orange" onclick="instance.viewApplication(' + data + ')"><i class="fa fa-eye margin-auto"></i></button>';
                },
                orderable: false,
            }, {
                // width: '12%',
                data: "id",
                className: "text-center",
                render: function (data, type, row) {
                    return '<button class="btn btn-clean btn-sm btn-icon btn-orange" onclick="instance.deleteApplication(' + data + ')"><i class="fa fa-trash margin-auto"></i></button>';
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
};

Interesados.prototype.viewApplication = function(idx) {
    let self = this;
    parent.location.href = self.baseUrl + "interesados/application?app_id=" + idx;
};

Interesados.prototype.deleteApplication = function(id) {
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
