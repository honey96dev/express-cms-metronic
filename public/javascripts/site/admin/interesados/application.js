let instance;

function Application() {
}

Application.prototype.init = function () {
    const self = this;
    self.baseUrl = $('#baseUrl').val();

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
      var html = '<div class="dz-preview dz-processing dz-success dz-complete dz-image-preview">' +
              '<div class="dz-image">' +
                  '<img data-dz-thumbnail="" width=120 height=120 alt="' + arr_names[i] + '" src="' + self.baseUrl + "uploads/application/" + arr_paths[i] + '">' +
              '</div>  ' +
              '<div class="dz-details">  ' +
                  '<div class="dz-size">' +
                      '<span data-dz-size=""></span>' +
                  '</div>    ' +
                  '<div class="dz-filename">' +
                      '<span data-dz-name="">' + arr_names[i] + '</span>' +
                  '</div>  ' +
              '</div>  ' +
          '</div>';
      $(html).appendTo($("#m-dropzone-one"));
  }
  
  $("#add_familymember").click(function() {
    var employment_count = eval($("#employment_count").val());
    $('<div class="row"><div class="col-md-12"><div class="kt-radio-inline"><label class="kt-radio"><input class="employment_type_employed" name="employment_type' + employment_count + '" type="radio" value="1">	Employed<span></span></label><label class="kt-radio mobile-left-freelancer"><input class="employment_type_freelancer" name="employment_type' + employment_count + '" type="radio" value="2">	Freelancer<span></span></label><label class="kt-radio"><input class="employment_type_unemployed" name="employment_type' + employment_count + '" type="radio" value="3">	Unemployed<span></span></label><label class="kt-radio"><input class="employment_type_student" name="employment_type' + employment_count + '" type="radio" value="4">	Student<span></span></label></div></div></div><div class="row mt-4"><div class="col-md-4"><div class="form-group"><label>Enter Employer</label><input class="employer_name form-control" name="employer_name[]" type="text" placeholder="" value=""></div></div><div class="col-md-4"><div class="form-group"><label>Enter Title</label><input class="employment_title form-control" name="employment_title[]" type="text" placeholder="" value=""></div></div><div class="col-md-4"><div class="form-group"><label>Enter Monthly Income</label><div class="input-group"><span class="input-group-text">€</span><input class="monthly_income form-control" name="monthly_income[]" type="number" placeholder="" value=""><div class="input-group-prepend"></div></div></div></div></div>').appendTo($("#employment_containter"));
    $("#employment_count").val(employment_count + 1);
    $(".monthly_income").change(calcRate);
    });

    $("#add_reference").click(function() {
        var reference_count = eval($("#reference_count").val());
        $('<div class="row"><div class="col-md-6"><div class="form-group"><label>Full Name</label><input class="reference_name form-control" name="reference_name[]" type="text" placeholder="" value=""></div></div><div class="col-md-6"><div class="form-group"><label>Enter Relationship</label><input class="reference_relationship form-control" name="reference_relationship[]" type="text" placeholder="" value=""></div></div><div class="col-md-6"><div class="form-group"><label>Phone</label><input class="reference_phone form-control" name="reference_phone[]" type="number" placeholder="" value=""></div></div><div class="col-md-6"><div class="form-group"><label>Email</label><input class="reference_email form-control" name="reference_email[]" type="text" placeholder="" value=""></div></div></div>').appendTo($("#reference_containter"));
        $("#reference_count").val(reference_count + 1);
    });

  $(".monthly_income").change(calcRate);
  calcRate();
};

function calcRate() {
  var rent_money = eval($("#monthly_rent").val() == "" ? 0 : $("#monthly_rent").val());
  $("#rent_money").html(formatMoney(rent_money, 0, ",", ".") + " €");
  var monthly_income = 0;
  $(".monthly_income").each(function() {
      monthly_income += eval($(this).val() == "" ? 0 : $(this).val());
  });
  $("#family_income").html(formatMoney(monthly_income, 0, ",", ".") + " €");

  
  $('#kt_chart_revenue_change').ClassyLoader({
      speed: 10,
      diameter: 80,
      fontSize: '30px',
      fontFamily: 'Courier',
      fontColor: 'rgba(0,0,0,0.4)',
      lineColor: 'rgba(0,255,153,1)',
      percentage: monthly_income == 0 ? 100 : rent_money * 100.0 / monthly_income,
      lineWidth: 20,
      start: 'top',
      remainingLineColor: 'rgba(255,0,102,1)'
  });
}

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
        url: '/property/upload',
        maxFilesize: 5
    };

    var drop = new Dropzone("#m-dropzone-one", dropzoneOptions);
    drop.on('success', function(file, res) {
        var fileName = res.fileName;
        var filePath = res.filePath;
        var documents_name = $("#documents_name").val();
        var documents_path = $("#documents_path").val();
        if(documents_name == "" || documents_name == undefined) {
            documents_name = fileName;
            documents_path = filePath;
        }
        else {
            documents_name = documents_name + "," + fileName;
            documents_path = documents_path + "," + filePath;
        }
        $("#documents_name").val(documents_name);
        $("#documents_path").val(documents_path);
    });

    $("div#m-dropzone-one").addClass("dropzone");
});
