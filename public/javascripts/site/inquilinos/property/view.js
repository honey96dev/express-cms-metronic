let instance;

$defaultViewMode="full"; //full, normal, original
$tsMargin=30; //first and last thumbnail margin (for better cursor interaction) 
$scrollEasing=600; //scroll easing amount (0 for no easing) 
$scrollEasingType="easeOutCirc"; //scroll easing type 
$thumbnailsContainerOpacity=0.8; //thumbnails area default opacity
$thumbnailsContainerMouseOutOpacity=0; //thumbnails area opacity on mouse out
$thumbnailsOpacity=0.6; //thumbnails default opacity
$nextPrevBtnsInitState="show"; //next/previous image buttons initial state ("hide" or "show")
$keyboardNavigation="on"; //enable/disable keyboard navigation ("on" or "off")

//cache vars
$thumbnails_wrapper=$("#thumbnails_wrapper");
$outer_container=$("#outer_container");
$thumbScroller=$(".thumbScroller");
$thumbScroller_container=$(".thumbScroller .container");
$thumbScroller_content=$(".thumbScroller .content");
$thumbScroller_thumb=$(".thumbScroller .thumb");
$preloader=$("#preloader");
$toolbar=$("#toolbar");
$toolbar_a=$("#toolbar a");
$bgimg=$("#bgimg");
$img_title=$("#img_title");
$nextImageBtn=$(".nextImageBtn");
$prevImageBtn=$(".prevImageBtn");

function Property() {

}

Property.prototype.init = function() {
    const self = this;
    self.id = $('#id').val();

    self.mapView = new GMaps({
        div: '#gmap',
        lat: 41.38506389999999,
        lng: 2.1734035
    });

    let arrows;
    if (KTUtil.isRTL()) {
        arrows = {
            leftArrow: '<i class="la la-angle-right"></i>',
            rightArrow: '<i class="la la-angle-left"></i>'
        }
    } else {
        arrows = {
            leftArrow: '<i class="la la-angle-left"></i>',
            rightArrow: '<i class="la la-angle-right"></i>'
        }
    }

    $('#availableForm').datepicker({
        rtl: KTUtil.isRTL(),
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        templates: arrows,
        autoclose: true,
        format: 'dd/mm/yyyy'
    });

    $('#backButton').click(function (e) {
        document.location = '/anuncios';
    });

    const address = $('#address').val();

    GMaps.geocode({
        address: address,
        callback: function(results, status) {
            if (status == 'OK') {
                var latlng = results[0].geometry.location;
                self.mapView.fitBounds(results[0].geometry.viewport);
                self.mapView.addMarker({
                    lat: latlng.lat(),
                    lng: latlng.lng()
                });
            }
        }
    });

    self.photoZone = [];
    self.prevPhoto = [];
    self.initPhotoDropzone();
};

Property.prototype.initPhotoDropzone = function () {
    const self = this;
    $.ajax({
        url: '/anuncios/photo',
        method: 'GET',
        data: {
            id: self.id,
        },
        dataType: 'json',

        success: function (response, status, xhr, $form) {
            const result = response.result;
            const data = response.data;
            const cnt = data.length;
            if (result == 'error' || cnt === 0) {
                //return self.addPhotoDropzone();
            }

            let html = '<div class="col-md-4 text-center">' +
                '<div class="image-100 dropzone" id="photo2"></div>' +
                '<input type="hidden" id="">' +
                '</div>';
            let container = $('#photos');
            let container_images = $('#gallery_image_container');

            for (let i = 0; i < cnt; i++) {
                let id =  sprintf('photoZone%d', i);
                let id2 =  sprintf('photo%d', i);
                if(data[i].length === 0)
                    continue;
                html = $(sprintf('<div class="col-md-4">' +
                    '<div class="image-100 dropzone gallery-item" id="%s" style="background: url(%s) no-repeat center; background-size: cover;"></div>' +
                    '<input type="hidden" id="%s" name="photo" value="%s">' +
                    '</div>', id, '/uploads/photo/' + data[i], id2, data[i]));
                html.appendTo(container);
                html = $("<div class=\"content\"><div><a href='" + '/uploads/photo/' + data[i] + "'><img src='" + '/uploads/photo/' + data[i] + "' title='' alt='' class='thumb' /></a></div></div>");
                html.appendTo(container_images);
            }

            if (data[cnt - 1].length > 0) {
                //self.addPhotoDropzone();
            }

            self.dropzoneCnt = $('.image-100.dropzone').length;

            // TODO: sdfsdfsdfsdfsdf
            $(".gallery-item").click(function() {
                $("#gallery_container").css("display", "block");
                $("#bgimg").attr("src", "/uploads/photo/" + $(this).parent().children("input").val());
            });

            $("#gallery_container").css("display", "none");
            $(".close").click(function() {
                $("#gallery_container").css("display", "none");     
            });
            $toolbar.data("imageViewMode",$defaultViewMode); //default view mode
            // if($defaultViewMode=="full"){
            // 	$toolbar_a.html("<img src='/images/toolbar_n_icon.png' width='50' height='50'  />").attr("onClick", "ImageViewMode('normal');return false").attr("title", "Restore");
            // } else {
            // 	$toolbar_a.html("<img src='/images/toolbar_fs_icon.png' width='50' height='50'  />").attr("onClick", "ImageViewMode('full');return false").attr("title", "Maximize");
            // }
            ShowHideNextPrev($nextPrevBtnsInitState);
            //thumbnail scroller
            $thumbScroller_container.css("marginLeft",$tsMargin+"px"); //add margin
            sliderLeft=$thumbScroller_container.position().left;
            sliderWidth=$outer_container.width();
            $thumbScroller.css("width",sliderWidth);
            var totalContent=0;
            fadeSpeed=200;
            
            var $the_outer_container=document.getElementById("outer_container");
            var $placement=findPos($the_outer_container);
            
            $thumbScroller_content.each(function () {
                var $this=$(this);
                totalContent+=$this.innerWidth();
                $thumbScroller_container.css("width",totalContent);
                $this.children().children().children(".thumb").fadeTo(fadeSpeed, $thumbnailsOpacity);
            });

            $thumbScroller.mousemove(function(e){
                if($thumbScroller_container.width()>sliderWidth){
                    var mouseCoords=(e.pageX - $placement[1]);
                    var mousePercentX=mouseCoords/sliderWidth;
                    var destX=-((((totalContent+($tsMargin*2))-(sliderWidth))-sliderWidth)*(mousePercentX));
                    var thePosA=mouseCoords-destX;
                    var thePosB=destX-mouseCoords;
                    if(mouseCoords>destX){
                        $thumbScroller_container.stop().animate({left: -thePosA}, $scrollEasing,$scrollEasingType); //with easing
                    } else if(mouseCoords<destX){
                        $thumbScroller_container.stop().animate({left: thePosB}, $scrollEasing,$scrollEasingType); //with easing
                    } else {
                        $thumbScroller_container.stop();  
                    }
                }
            });

            $thumbnails_wrapper.fadeTo(fadeSpeed, $thumbnailsContainerOpacity);
            $thumbnails_wrapper.hover(
                function(){ //mouse over
                    var $this=$(this);
                    $this.stop().fadeTo("slow", 1);
                },
                function(){ //mouse out
                    var $this=$(this);
                    $this.stop().fadeTo("slow", $thumbnailsContainerMouseOutOpacity);
                }
            );

            $thumbScroller_thumb.hover(
                function(){ //mouse over
                    var $this=$(this);
                    $this.stop().fadeTo(fadeSpeed, 1);
                },
                function(){ //mouse out
                    var $this=$(this);
                    $this.stop().fadeTo(fadeSpeed, $thumbnailsOpacity);
                }
            );

            //on window resize scale image and reset thumbnail scroller
            $(window).resize(function() {
                FullScreenBackground("#bgimg",$bgimg.data("newImageW"),$bgimg.data("newImageH"));
                $thumbScroller_container.stop().animate({left: sliderLeft}, 400,"easeOutCirc"); 
                var newWidth=$outer_container.width();
                $thumbScroller.css("width",newWidth);
                sliderWidth=newWidth;
                $placement=findPos($the_outer_container);
            });

            //load 1st image
            var the1stImg = new Image();
            the1stImg.onload = CreateDelegate(the1stImg, theNewImg_onload);
            the1stImg.src = $bgimg.attr("src");
            $outer_container.data("nextImage",$(".content").first().next().find("a").attr("href"));
            $outer_container.data("prevImage",$(".content").last().find("a").attr("href"));
            
                        
            //mouseover toolbar
            if($toolbar.css("display")!="none"){
                $toolbar.fadeTo("fast", 0.4);
            }
            $toolbar.hover(
                function(){ //mouse over
                    var $this=$(this);
                    $this.stop().fadeTo("fast", 1);
                },
                function(){ //mouse out
                    var $this=$(this);
                    $this.stop().fadeTo("fast", 0.4);
                }
            );

            //Clicking on thumbnail changes the background image
            $("#outer_container a").click(function(event){
                event.preventDefault();
                var $this=$(this);
                GetNextPrevImages($this);
                GetImageTitle($this);
                SwitchImage(this);
                ShowHideNextPrev("show");
            }); 

            //next/prev images buttons
            $nextImageBtn.click(function(event){
                event.preventDefault();
                SwitchImage($outer_container.data("nextImage"));
                var $this=$("#outer_container a[href='"+$outer_container.data("nextImage")+"']");
                GetNextPrevImages($this);
                GetImageTitle($this);
            });

            $prevImageBtn.click(function(event){
                event.preventDefault();
                SwitchImage($outer_container.data("prevImage"));
                var $this=$("#outer_container a[href='"+$outer_container.data("prevImage")+"']");
                GetNextPrevImages($this);
                GetImageTitle($this);
            });

            //next/prev images keyboard arrows
            if($keyboardNavigation=="on"){
            $(document).keydown(function(ev) {
                if(ev.keyCode == 39) { //right arrow
                    SwitchImage($outer_container.data("nextImage"));
                    var $this=$("#outer_container a[href='"+$outer_container.data("nextImage")+"']");
                    GetNextPrevImages($this);
                    GetImageTitle($this);
                    return false; // don't execute the default action (scrolling or whatever)
                } else if(ev.keyCode == 37) { //left arrow
                    SwitchImage($outer_container.data("prevImage"));
                    var $this=$("#outer_container a[href='"+$outer_container.data("prevImage")+"']");
                    GetNextPrevImages($this);
                    GetImageTitle($this);
                    return false; // don't execute the default action (scrolling or whatever)
                }
            });
            }
        },
        error: function (error) {
            //self.addPhotoDropzone();
        }
    })
};

Property.prototype.showErrorMsg = function (form, type, msg) {
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

$(document).ready(function () {
    instance = new Property();
    instance.init();
});

function BackgroundLoad($this,imageWidth,imageHeight,imgSrc){
	$this.fadeOut("fast",function(){
		$this.attr("src", "").attr("src", imgSrc); //change image source
		FullScreenBackground($this,imageWidth,imageHeight); //scale background image
		$preloader.fadeOut("fast",function(){$this.fadeIn("slow");});
		var imageTitle=$img_title.data("imageTitle");
		if(imageTitle){
			$this.attr("alt", imageTitle).attr("title", imageTitle);
			$img_title.fadeOut("fast",function(){
				$img_title.html(imageTitle).fadeIn();
			});
		} else {
			$img_title.fadeOut("fast",function(){
				$img_title.html($this.attr("title")).fadeIn();
			});
		}
	});
}

function ShowHideNextPrev(state){
	if(state=="hide"){
		$nextImageBtn.fadeOut();
		$prevImageBtn.fadeOut();
	} else {
		$nextImageBtn.fadeIn();
		$prevImageBtn.fadeIn();
	}
}

//get image title
function GetImageTitle(elem){
	var title_attr=elem.children("img").attr("title"); //get image title attribute
	$img_title.data("imageTitle", title_attr); //store image title
}

//get next/prev images
function GetNextPrevImages(curr){
	var nextImage=curr.parents(".content").next().find("a").attr("href");
	if(nextImage==null){ //if last image, next is first
		var nextImage=$(".content").first().find("a").attr("href");
	}
	$outer_container.data("nextImage",nextImage);
	var prevImage=curr.parents(".content").prev().find("a").attr("href");
	if(prevImage==null){ //if first image, previous is last
		var prevImage=$(".content").last().find("a").attr("href");
	}
	$outer_container.data("prevImage",prevImage);
}

//switch image
function SwitchImage(img){
	$preloader.fadeIn("fast"); //show preloader
	var theNewImg = new Image();
	theNewImg.onload = CreateDelegate(theNewImg, theNewImg_onload);
	theNewImg.src = img;
}

//get new image dimensions
function CreateDelegate(contextObject, delegateMethod){
	return function(){
		return delegateMethod.apply(contextObject, arguments);
	}
}

//new image on load
function theNewImg_onload(){
	$bgimg.data("newImageW",this.width).data("newImageH",this.height);
	BackgroundLoad($bgimg,this.width,this.height,this.src);
}

//Image scale function
function FullScreenBackground(theItem,imageWidth,imageHeight){
	var winWidth=$(window).width();
	var winHeight=$(window).height();
	if($toolbar.data("imageViewMode")!="original"){ //scale
		var picHeight = imageHeight / imageWidth;
		var picWidth = imageWidth / imageHeight;
		if($toolbar.data("imageViewMode")=="full"){ //fullscreen size image mode
			if ((winHeight / winWidth) < picHeight) {
				$(theItem).attr("width",winWidth);
				$(theItem).attr("height",picHeight*winWidth);
			} else {
				$(theItem).attr("height",winHeight);
				$(theItem).attr("width",picWidth*winHeight);
			};
		} else { //normal size image mode
			if ((winHeight / winWidth) > picHeight) {
				$(theItem).attr("width",winWidth);
				$(theItem).attr("height",picHeight*winWidth);
			} else {
				$(theItem).attr("height",winHeight);
				$(theItem).attr("width",picWidth*winHeight);
			};
		}
		$(theItem).css("margin-left",(winWidth-$(theItem).width())/2);
		$(theItem).css("margin-top",(winHeight-$(theItem).height())/2);
	} else { //no scale
		$(theItem).attr("width",imageWidth);
		$(theItem).attr("height",imageHeight);
		$(theItem).css("margin-left",(winWidth-imageWidth)/2);
		$(theItem).css("margin-top",(winHeight-imageHeight)/2);
	}
}

//Image view mode function - fullscreen or normal size
function ImageViewMode(theMode){
	$toolbar.data("imageViewMode", theMode);
	FullScreenBackground($bgimg,$bgimg.data("newImageW"),$bgimg.data("newImageH"));
	if(theMode=="full"){
		$toolbar_a.html("<img src='/images/toolbar_n_icon.png' width='50' height='50'  />").attr("onClick", "ImageViewMode('normal');return false").attr("title", "Restore");
	} else {
		$toolbar_a.html("<img src='/images/toolbar_fs_icon.png' width='50' height='50'  />").attr("onClick", "ImageViewMode('full');return false").attr("title", "Maximize");
	}
}


//function to find element Position
function findPos(obj) {
    var curleft = curtop = 0;
    if (obj.offsetParent) {
        curleft = obj.offsetLeft
        curtop = obj.offsetTop
        while (obj = obj.offsetParent) {
            curleft += obj.offsetLeft
            curtop += obj.offsetTop
        }
    }
    return [curtop, curleft];
}