let instance;

function Application() {
}

Application.prototype.init = function () {
    const self = this;
    self.baseUrl = $('#baseUrl').val();
    
    $('#kt_chart_revenue_change').ClassyLoader({
      speed: 10,
      diameter: 80,
      fontSize: '30px',
      fontFamily: 'Courier',
      fontColor: 'rgba(0,0,0,0.4)',
      lineColor: 'rgba(0,255,153,1)',
      percentage: 80,
      lineWidth: 20,
      start: 'top',
      remainingLineColor: 'rgba(255,0,102,1)'
  });

  $('#application_submit').click(function (e) {
      e.preventDefault();
      const form = $('#save_form');
      const btn = $(this);

      form.validate({
          rules: {
              user_phone: {
                  required: true,
              },
              employment_type: {
                  required: true,
              },
              employer_name: {
                  required: true,
              },
              employment_title: {
                  required: true,
              },
              monthly_income: {
                  required: true,
              },
              monthly_rent: {
                  required: true,
              },
              security_deposite: {
                  required: true,
              },
              rental_history_address: {
                  required: true,
              },
              contact_name: {
                  required: true,
              },
              contact_telephone: {
                  required: true,
              },
              contact_email: {
                  required: true,
              },
              reference_name: {
                  required: true,
              },
              reference_relationship: {
                  required: true,
              },
              reference_phone: {
                  required: true,
              },
              reference_email: {
                  required: true,
              },
              cover_letter: {
                  required: true,
              },
          },
          messages: {

          },
      });

      if (!form.valid()) {
          return;
      }

      btn.attr('disabled', true);
      // btn.addClass('kt-loader kt-loader--right kt-loader--light').attr('disabled', true);
      // console.log('addButton');
      form.ajaxSubmit({
          method: "put",
          dataType: 'json',
          success: function (response, status, xhr, $form) {
              const result = response.result;
              const message = response.message;
              // const data = response.data;
              // const insertId = response.insertId;
              btn.attr('disabled', false);
              if (result === 'success') {
                  self.showErrorMsg(form, 'success', message);
                  setTimeout(function () {
                      // document.location = '/anuncios';
                  }, 2000);
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

  var documents_name = $("#documents_name").val();
  var documents_path = $("#documents_path").val();

  var arr_names = documents_name.split(",");
  var arr_paths = documents_path.split(",");
  for(i = 0; i < arr_names.length; i++) {
      if(arr_names[i] == "")
        continue;
        var ifImage = true;
        var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
        if(!allowedExtensions.exec(arr_names[i])){
            ifImage = false;
        }
      var html = '<div class="dz-preview dz-processing dz-success dz-complete dz-image-preview">' +
              '<div class="dz-image">' +
                  '<a target="ajaxdownload" href="' + self.baseUrl + "uploads/application/" + arr_paths[i] + '"><img data-dz-thumbnail="" width=120 height=120 alt="' + arr_names[i] + '" src="' + self.baseUrl + "uploads/application/" + (ifImage ? arr_paths[i] : "blank.jpg") + '"></a>' +
              '</div>  ' +
              '<div class="dz-details">  ' +
                  '<div class="dz-size">' +
                  '</div>    ' +
                  '<div class="dz-filename">' +
                      '<a target="ajaxdownload" href="' + self.baseUrl + "uploads/application/" + arr_paths[i] + '"><span data-dz-name="">' + arr_names[i] + '</span></a>' +
                  '</div>  ' +
              '</div>  ' +
          '</div>';
      $(html).appendTo($("#m-dropzone-one"));
  }
};

Application.prototype.showErrorMsg = function (form, type, msg) {
  const alert = $('<div class="kt-alert kt-alert--outline alert alert-' + type + ' alert-dismissible" role="alert">\
    <button type="button" class="close" data-dismiss="alert" aria-label="Close"></button>\
    <span></span>\
  </div>');

  form.find('.alert').remove();
  alert.appendTo(form);
  //alert.animateClass('fadeIn animated');
  KTUtil.animateClass(alert[0], 'fadeIn animated');
  alert.find('span').html(msg);
};


function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
  
      const negativeSign = amount < 0 ? "-" : "";
  
      let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
      let j = (i.length > 3) ? i.length % 3 : 0;
  
      return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
    } catch (e) {
      console.log(e)
    }
};

$(document).ready(function () {
    instance = new Application();
    instance.init();

    const dropzoneOptions = {
        url: '/property/upload'
    };

    // var drop = new Dropzone("#m-dropzone-one", dropzoneOptions);
    // drop.on('success', function(file, res) {
    //     var fileName = res.fileName;
    //     var filePath = res.filePath;
    //     var documents_name = $("#documents_name").val();
    //     var documents_path = $("#documents_path").val();
    //     if(documents_name == "" || documents_name == undefined) {
    //         documents_name = fileName;
    //         documents_path = filePath;
    //     }
    //     else {
    //         documents_name = documents_name + "," + fileName;
    //         documents_path = documents_path + "," + filePath;
    //     }
    //     $("#documents_name").val(documents_name);
    //     $("#documents_path").val(documents_path);
    // });

    $("div#m-dropzone-one").addClass("dropzone");

    $(".kt-radio").unbind();
    $("span").unbind();
});
