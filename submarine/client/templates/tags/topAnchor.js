Template.TopAnchor.onCreated(function() {
  var self = this;

  // helper variable for drag
  self.mouseDownY = -1;
  self.lastPointY = -1;
  self.mousemoveTime = -1;
  self.velocity = -1;
  self.moved = false;
  self.windowHeight = $(window).height();

  self.handleTouchDown = function(event) {

    var touch = event.touches.item(0);
    if(!$.contains(document.getElementsByClassName("submarine_bg")[0],event.target))
      return;

    self.lastPointY = self.mouseDownY = event.touches.item(0).pageY;
    self.mousemoveTime = Date.now().value;
    self.velocity = 0;
    self.moved = false;

    $(".top_anchor").addClass("drag");
    $("body > .content").addClass("drag");
    document.addEventListener('touchmove', self.handleTouchMove);
  }

  self.handleTouchUp = function(event) {
    if (!self.moved) return;

    $(".top_anchor").addClass("transition");
    setTimeout(function() {
      $(".top_anchor").removeClass("transition");
    }, 500);

    self.moved = false;
    document.removeEventListener('touchmove', self.handleTouchMove);
    $(".drag").removeClass("drag");
    $('.top_anchor').removeAttr('style');

    if (Math.abs(self.mouseDownY - self.lastPointY) > 200 || self.velocity > 1) {
      if ($(".top_anchor").hasClass("top")) {
        $("body > .content").css({"filter": "blur(30px)"});
      }
      else{
        $("body > .content").removeAttr('style');
      }
      $('.top_anchor').toggleClass('top').toggleClass('bottom');
    } else {
      if ($(".top_anchor").hasClass("bottom")) {
        $("body > .content").css({"filter": "blur(30px)"});
      }
      else{
        $("body > .content").removeAttr('style');
      }
    }
  }

  self.handleTouchMove = function(event) {
    self.moved = true;
    var now = Date.now();
    var pageY = event.touches.item(0).pageY;
    self.velocity = Math.abs((pageY - self.lastPointY)/(now - self.mousemoveTime));
    self.lastPointY = pageY;
    self.mousemoveTime = now;
    var diff = self.lastPointY - self.mouseDownY;
    if ($(".top_anchor").hasClass("top")) {
      if (diff < 0) diff = 0;
      if (diff > self.windowHeight) diff = self.windowHeight;
      self.$(".top_anchor").css("bottom", "calc(100vh - " + diff + "px)");
      var blur_px = 0.04*diff;
      $("body > .content").css({"filter": "blur(" + blur_px + "px)"});
    } else {
      if (diff > 0) diff = 0;
      if (diff < -self.windowHeight) diff = -self.windowHeight;
      self.$(".top_anchor").css("bottom", -diff + "px");
      var blur_px = 0.04*(self.windowHeight + diff);
      $("body > .content").css({"filter": "blur(" + blur_px + "px)"});
    }
  }

});

Template.TopAnchor.onRendered(function() {
  document.addEventListener('touchstart', this.handleTouchDown);
  document.addEventListener('touchend', this.handleTouchUp);
});

Template.TopAnchor.onDestroyed(function() {
  document.removeEventListener('touchstart', this.handleTouchDown);
  document.removeEventListener('touchend', this.handleTouchUp);
});

Template.TopAnchor.events({
  "click .create.submit_button": function(event) {
    // Prevent default browser form submit
        event.preventDefault();

        // Get values from the form
        var tagName = $('input[name="chatroom_name"]').val();

        if(tagName == "" ){
          console.log("Empty Roomname Not Allowed");
          return;
        }

        var tagDescription = $('input[name="room_discription"]').val();
        var tagStartTime = $("#start_time").val();
        var tagEndTime = $("#end_time").val();

        var tagRepeat = 0;

        $(".check input:checked").toArray().forEach((check) => {
          //console.log($(check).data("val"));
          tagRepeat += +$(check).data("val");
        });

        if(tagRepeat > 127){
          tagRepeat = 127;
        }

        //App.Collections.Tags.remove({name:""});
        //console.log(App.Collections.Tags.find({}));

        var wifiArray = Session.get("wifiList");

        console.log("Here we are!!!");

        let tagData = {
            name: tagName,
            description: tagDescription,
            wifis: wifiArray,
            start_time: tagStartTime,
            end_time: tagEndTime,
            user: [],
            repeat: tagRepeat
        };

        // Insert into the collection
        Meteor.call('tags/createTag', tagData, wifiArray, function(error){
            if(error){
                // Output error if subscription fails
                console.log(error.reason);
            } else {
                // Success
                console.log("Tag Added Successfully");
                console.log(tagData);
                console.log( App.Collections.Tags.find({}) );
            }
        });
  },

  "click .submarine_bg": function(e, t) {
    if (!t.moved) {
      t.$('.top_anchor').toggleClass('top').toggleClass('bottom');
      $('.drag').removeClass("drag");
      if ($(".top_anchor").hasClass("bottom")) {
        $("body > .content").css({"filter": "blur(30px)",});
      }
      else {
        $("body > .content").removeAttr("style");
      }
    }
  },
  /*"click .create.button": function() {
      //$(".popUpWindow").fadeIn();
      $(".popUpWindow").addClass(popUp_transition);
  }*/
});

Template.TopAnchor.helpers({
    //"getTagList": () => this.tagList
     "getTagList": () => ['tag1', 'tag2', 'tag3', 'tag4']
});
