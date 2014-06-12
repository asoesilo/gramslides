console.log('\'Allo \'Allo!');

var CLIENT_ID = "07331a00f7794eafadc89d0ef9f08dd9";

var FADE_DURATION = 600;
var DISPLAY_DURATION = 3000;

var scheduleImages =  function(json, tag, displayTime) {
  console.log("Display time: " + displayTime);

  var $imgDisplay = $("#img-display");

  var currentTime = new Date().getTime();
  var nowTillDisplay = displayTime - currentTime;
  if(nowTillDisplay < 0) {
    nowTillDisplay = 0;
  }

  var lastDisplayTime = displayTime + 500 + (DISPLAY_DURATION * json.data.length);

  console.log("Current time: " + currentTime);
  console.log("Next display time: " + lastDisplayTime);

  var nextMaxTagId = json.pagination.next_max_tag_id;

  setTimeout(function() {
    $("#img-display").trigger("retrieveMorePictures", [tag, nextMaxTagId, lastDisplayTime]);
  }, nowTillDisplay + DISPLAY_DURATION * (json.data.length - 5));

  $.each(json.data, function(index, picture) {
    var imgContent = "<div class='pic'>";
    imgContent += "<a href='" + picture.link + "' target='_blank'>";
    imgContent += "<img src='" + picture.images.standard_resolution.url + "'>";
    imgContent += "</a>";
    if(picture.caption != null) {
      imgContent += "<p><div>" + picture.caption.text + "</div></p>";
      imgContent += "<p>";
    }
    imgContent += "by<br><em>" + picture.user.full_name + "</em>";
    imgContent += "</p>";
    imgContent += "<p>";
    imgContent += "<div>" + picture.likes.count + "<label>&nbsp;likes</label></div>";
    imgContent += "<div>" + picture.comments.count + "<label>&nbsp;comments</label></div>";
    imgContent += "</p>";
    imgContent += "</div>"
    var $img = $(imgContent).hide();
    $imgDisplay.append($img);
    setTimeout(function() {
      // console.log("Fade in: " + index);
      $img.fadeIn(FADE_DURATION);
    }, nowTillDisplay + (DISPLAY_DURATION * (index - 1)));
    setTimeout(function() {
      // console.log("Fade out: " + index);
      $img.fadeOut(FADE_DURATION);
    }, nowTillDisplay + ((DISPLAY_DURATION * index) - FADE_DURATION));
    setTimeout(function() {
      // console.log("Remove: " + index);
      $img.remove();
    }, nowTillDisplay + ((DISPLAY_DURATION * index)));
  });
}

var removeHiddenImages = function() {
  console.log("in removeHiddenImages");
  $("#img-display").find(".pic:hidden").remove();
};

var displayImages = function(tag, nextMaxTagId, displayTime, clearImages) {
  console.log("In displayImages: " + tag + ", " + nextMaxTagId + ", " + displayTime);

  var url = "https://api.instagram.com/v1/tags/" + tag + "/media/recent?client_id=" + CLIENT_ID;

  if(nextMaxTagId != "") {
    url += "&max_tag_id=" + nextMaxTagId;
  }

  $.ajax(url, {
    type: "get",
    dataType: "jsonp",
    success: function(json) {
      if(clearImages) {
        removeHiddenImages();
      }

      scheduleImages(json, tag, displayTime);
    }
  });
};

$(function() {
  displayImages("lighthouse", "", new Date().getTime(), false);

  $("#img-display").on("retrieveMorePictures", function(event, tag, nextMaxTagId, nextDisplayTime) {
    console.log("In #img-display retrieveMorePictures");

    displayImages(tag, nextMaxTagId, nextDisplayTime, false);
  });

  $("#search-form").on("submit", function(event) {
    console.log("In #search-form submit");

    event.preventDefault();
    event.stopPropagation();
  });

  $("#search-btn").on("click", function(event) {
    console.log("In #search-btn click");

    var tag = $("#search-tag").val();
    displayImages(tag, "", new Date().getTime(), true);

    event.preventDefault();
    event.stopPropagation();
  });
});