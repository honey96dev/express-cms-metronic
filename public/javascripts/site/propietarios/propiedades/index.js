let instance;

function Propiedades() {
}

Propiedades.prototype.init = function () {
    const self = this;
    self.baseUrl = $('#baseUrl').val();

    $.ajax({
        url: self.baseUrl + 'propiedades/list',
        method: 'GET',
        dataType: 'json',
        success: function (res, status, xhr) {
            const data = res.data;
            $('#itemList').html(self.generateList(data));
        },
    });
};

Propiedades.prototype.generateList = function(items) {
    let html = '<div class="row">';
    html += '<div class="col-xl-3 col-lg-4 col-md-4 col-sm-6 col-xm-12" onclick="instance.addItem()"><div class="kt-portlet kt-portlet--height-fluid my-card"><div class="kt-portlet__body add-card-body"><div class="add-card-button-wrapper"><button class="btn btn-secondary edit-button btn-elevate btn-pill add-card-button" id="addItem" type="button"><i class="la la-plus"></i></button></div><div class="add-card-description1">Add Property</div><div class="add-card-description2">it willl be visible for pottential tenants in search results</div></div></div></div>';

    let card;
    for (let item of items) {
        card = '';
        if (!!item.picture) {

        } else {
            card = '<div class="col-xl-3 col-lg-4 col-md-4 col-sm-6 col-xm-12" onclick="instance.editItem(' + item.id + ')"><div class="kt-portlet kt-portlet--height-fluid my-card"><div class="kt-portlet__body list-card-body"><div class="list-card-solid"><div class="list-card-name">' + item.name + '</div></div><div class="list-card-address">' + item.address + '</div><div class="list-card-property-sec row"><div class="col-4 list-card-property"><li class="fa fa-expand-arrows-alt"></li>' + item.surface + 'm2</div><div class="col-4 list-card-property"><li class="fa fa-bed"></li>' + item.rooms + 'rooms</div><div class="col-4 list-card-property"><li class="fa fa-bath"></li>' + item.baths + 'baths</div></div></div></div></div>';
            // card = '<div class="col-xl-3 col-lg-4 col-md-4 col-sm-6 col-xm-12" onclick="instance.editItem(' + item.id + ')"><div class="kt-portlet kt-portlet--height-fluid my-card "><div class="kt-portlet__body list-card-body"><div class="list-card-solid"><div class="list-card-waiting-verification-mark2">Waiting for verification</div><div class="list-card-name">' + item.name + '</div></div><div class="list-card-address">' + item.address + '</div><div class="list-card-property-sec row"><div class="col-4 list-card-property"><li class="fa fa-expand-arrows-alt"></li>' + item.surface + 'm2</div><div class="col-4 list-card-property"><li class="fa fa-bed"></li>' + item.rooms + 'rooms</div><div class="col-4 list-card-property"><li class="fa fa-bath"></li>' + item.baths + 'baths</div></div></div></div></div>';
        }
        html += card;
    }

    html += '</div>';

    return html;
};

Propiedades.prototype.addItem = function() {
    const self = this;
    document.location = self.baseUrl + 'propiedades/add';
};

Propiedades.prototype.editItem = function(id) {
    const self = this;
    document.location = self.baseUrl + 'propiedades/add?id=' + id;
};

$(document).ready(function () {
    instance = new Propiedades();
    instance.init();
});
