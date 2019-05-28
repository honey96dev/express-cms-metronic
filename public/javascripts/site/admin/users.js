
let instance;
function Users() {

}
Users.prototype.init = function() {
    $('#usersTable').DataTable({
        ajax: '/admin/users/list',
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
                    return '<button class="btn btn-clean btn-sm btn-icon" onclick="accounts.deleteBitMEXAccount(' + data + ')"><i class="fa fa-trash margin-auto"></i></button>';
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

$(document).ready(function () {
    instance = new Users();
    instance.init();
});
