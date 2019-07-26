let instance;

function Property() {
}

Property.prototype.init = function () {
    const self = this;
    self.baseUrl = $('#baseUrl').val();

    $.ajax({
        url: self.baseUrl + 'property/list',
        method: 'GET',
        dataType: 'json',
        success: function (res, status, xhr) {
            const data = res.data;
            $('#itemList').html(self.generateList(data));
        },
    });
};

Property.prototype.generateList = function(items) {
    let html = '';
    // html += '<div class="col-xl-3 col-lg-4 col-md-4 col-sm-6 col-xm-12" onclick="instance.addItem()"><div class="kt-portlet kt-portlet--height-fluid my-card"><div class="kt-portlet__body add-card-body"><div class="add-card-button-wrapper"><button class="btn btn-secondary edit-button btn-elevate btn-pill add-card-button" id="addItem" type="button"><i class="la la-plus"></i></button></div><div class="add-card-description1">Add Property</div><div class="add-card-description2">it willl be visible for pottential tenants in search results</div></div></div></div>';

    let card;
    for (let item of items) {
        card = '';
        if (item.photo.length > 0) {
            card = "<div class=\"col-lg-6 col-md-12 card-wrap\" data-id=\"" + item.id + "\"><div class=\"kt-portlet kt-portlet--height-fluid kt-widget19 property-list-box\"><div class=\"kt-portlet__body kt-portlet__body--fit kt-portlet__body--unfill\"><div class=\"kt-widget19__pic kt-portlet-fit--top kt-portlet-fit--sides\" style=\"min-height: 178px; background-image: url(/uploads/photo/" + item.photo + ")\"><div class=\"kt-widget19__labels\"><a href=\"#\" class=\"btn btn-label-light-o2 btn-bold \">$" + item.price + "</a></div></div></div><div class=\"kt-portlet__body \"><div class=\"kt-widget19__wrapper\"><div class=\"kt-widget19__content\"><div class=\"kt-widget19__info pl-0\"><a href=\"#\" class=\"kt-widget19__username\">" + item.name + "</a><p class=\"kt-widget19__time\">" + item.address + "</p></div></div><div class=\"kt-widget19__text\"><div class=\"row m-0 form-row\"><div class=\"col-4\">" + item.rooms + " Bed</div><div class=\"col-4\">" + item.baths + " Bath</div><div class=\"col-4\">" + item.surface + " Sq meter</div></div></div></div></div></div></div>";
            //card = '<div class="col-xl-3 col-lg-4 col-md-4 col-sm-6 col-xm-12 card-wrap" data-id="' + item.id + '"><div class="kt-portlet kt-portlet--height-fluid my-card"><div class="kt-portlet__body list-card-body"><div class="list-card-img" style="background-image: url(/uploads/photo/' + item.photo + ')"><div class="list-card-trash"><button class="list-card-trash-button btn btn-warning btn-elevate btn-circle btn-icon list-card-trash-icon"><i class="flaticon-delete list-card-trash-icon"></i></button></div></div><div class="list-card-name-badge">' + item.name + '</div><div class="list-card-address">' + item.address + '</div><div class="list-card-property-sec row"><div class="col-4 list-card-property"><li class="fa fa-expand-arrows-alt"></li>' + item.surface + 'm2</div><div class="col-4 list-card-property"><li class="fa fa-bed"></li>' + item.rooms + 'rooms</div><div class="col-4 list-card-property"><li class="fa fa-bath"></li>' + item.baths + 'baths</div></div></div></div></div>';
        } else {
            card = "<div class=\"col-lg-6 col-md-12 card-wrap\" data-id=\"" + item.id + "\"><div class=\"kt-portlet kt-portlet--height-fluid kt-widget19 property-list-box\"><div class=\"kt-portlet__body kt-portlet__body--fit kt-portlet__body--unfill\"><div class=\"kt-widget19__pic kt-portlet-fit--top kt-portlet-fit--sides\" style=\"min-height: 178px; background: #ffafaf;\"><div class=\"kt-widget19__labels\"><a href=\"#\" class=\"btn btn-label-light-o2 btn-bold \">$" + item.price + "</a></div></div></div><div class=\"kt-portlet__body \"><div class=\"kt-widget19__wrapper\"><div class=\"kt-widget19__content\"><div class=\"kt-widget19__info pl-0\"><a href=\"#\" class=\"kt-widget19__username\">" + item.name + "</a><p class=\"kt-widget19__time\">" + item.address + "</p></div></div><div class=\"kt-widget19__text\"><div class=\"row m-0 form-row\"><div class=\"col-4\">" + item.rooms + " Bed</div><div class=\"col-4\">" + item.baths + " Bath</div><div class=\"col-4\">" + item.surface + " Sq meter</div></div></div></div></div></div></div>";
            //card = '<div class="col-xl-3 col-lg-4 col-md-4 col-sm-6 col-xm-12 card-wrap" data-id="' + item.id + '"><div class="kt-portlet kt-portlet--height-fluid my-card "><div class="kt-portlet__body list-card-body"><div class="list-card-solid"><div class="list-card-trash"><button class="list-card-trash-button btn btn-warning btn-elevate btn-circle btn-icon list-card-trash-icon"><i class="flaticon-delete list-card-trash-icon"></i></button></div><div class="list-card-name">' + item.name + '</div></div><div class="list-card-address">' + item.address + '</div><div class="list-card-property-sec row"><div class="col-4 list-card-property"><li class="fa fa-expand-arrows-alt"></li>' + item.surface + 'm2</div><div class="col-4 list-card-property"><li class="fa fa-bed"></li>' + item.rooms + 'rooms</div><div class="col-4 list-card-property"><li class="fa fa-bath"></li>' + item.baths + 'baths</div></div></div></div></div>';
        }
        html += card;
    }


    return html;
};

$(document).ready(function () {
    instance = new Property();
    instance.init();
});

$(document).on("click", ".card-wrap", function (e) {
    e.preventDefault();
    const target = $(e.target);
    const card = target.closest('.card-wrap');
    const id = card.data('id');
    // console.log(target);
    if(target.hasClass("list-card-trash-button") || target.hasClass("list-card-trash-icon")) {
        $('#itemId').val(id);
        const container = $('#deleteModal');
        container.find('.alert').remove();
        container.modal('show');
    } else {
        document.location = instance.baseUrl + 'property/view?id=' + id;
    }
});