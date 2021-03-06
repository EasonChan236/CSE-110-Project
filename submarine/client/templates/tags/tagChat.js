Template.tagChats.onCreated(function() {
  var self = this;

  self.autorun(() => {
    FlowRouter.watchPathChange(); // reactive source

    self.tagId = FlowRouter.current().params.tagId;
    self.userId = Meteor.userId();

    var tag = Meteor.user().profile.savedTags.find((element) => element.tagId == self.tagId);
    self.oldestMsg = 0;
    self.preOldestMsg = -1;
    self.historyChange = new ReactiveVar(0);
    self.lastRead = new Date(localStorage.getItem(self.tagId));
    self.newMsg = new ReactiveVar(0, function(a, b) {return false;});
    self.newLeft = new ReactiveVar(0, function(a, b) {return false;});
    self.scrollPos = 0;
    self.timeStamp = 0;
    self.addToBottom = true;
    self.history = new ReactiveVar([]);
    if (self.watchCursor)
      self.watchCursor.stop();
    if (self.oldestMsg < self.preOldestMsg)
      self.preOldestMsg = -1;

    self.subscribe('chat/tagChats', self.tagId, () => {
      // get cursor and watch cursor
      var newHistoryCursor = App.Collections.Message.find({
          is_public: true,
          receiver: self.tagId
        }, {sort: {time: -1}});

      self.watchCursor = newHistoryCursor.observeChanges({
        "added": function(id, fields) {
          self.addToBottom = true;
          fields._id = id;
          var history = self.history.get();
          history.push(fields);
          self.historyChange.set(self.historyChange.get() + 1);
          self.history.set(history);

          var container = document.getElementsByClassName("messages")[0];
          if (container.scrollTop < container.scrollHeight - container.clientHeight - 30) {
            $(".floater[data-action=\"down\"]").removeClass("hidden");
            self.newMsg.set(self.newMsg.get() + 1);
          } else {
            self.newMsg.set(0);
          }
        }
      });

      if (self.preOldestMsg < self.oldestMsg && localStorage.getItem(self.tagId)) {
        var history = newHistoryCursor.fetch();

        if (newHistoryCursor.count() == 0) return;
        self.history.set(newHistoryCursor.fetch());

      // call is done
      } else {
        self.historyChange.set(self.historyChange.get() + 1);
        if (newHistoryCursor.count() == 0) return;
        self.history.set(self.history.get().concat(newHistoryCursor.fetch()));
      }
    });

    // avoid repeating
    if (self.preOldestMsg < self.oldestMsg && localStorage.getItem(self.tagId)) {
      self.preOldestMsg = self.oldestMsg;
      Meteor.call("chats/getHistory", self.tagId, new Date(), self.lastRead, true, true, function(err, res) {
        self.addToBottom = false;
        if (err) return;

        var pastHistory = res.history.reverse();

        if (!res.history.length) {
          //TODO: display no more histories
          self.oldestMsg = new Date();
          return;
        }

        self.oldestMsg = pastHistory[0].time;
        self.newLeft.set(res.leftNew);


        // if all done
        if (self.subscriptionsReady()) {
          self.history.set(pastHistory.concat(self.history.get()));
          self.historyChange.set(self.historyChange.get() + 1);

        // call return first
        } else {
          self.history.set(pastHistory);
        }
      });
    }
  });

  // rerun when new user join
  self.autorun(() => {
    FlowRouter.watchPathChange();
    var tag = App.Collections.Tags.findOne(FlowRouter.current().params.tagId);

    if (self.subUserProfile) self.subUserProfile.stop();
    self.subUserProfile = self.subscribe("tags/usersUnderTag", self.tagId);
  })

  $(".bottom.nav").addClass("hidden");
});

Template.tagChats.onRendered(function() {

  var self = this;
  self.mouseDownY = -1;
  self.lastPointY = -1;
  self.threshHold = $(window).width() * 1.5 / 6.67;
  self.refresh = false;
  self.moved = false;
  self.container = document.getElementsByClassName("messages")[0];

  self.handleTouchMove = function(event) {
    $(".floater").addClass("hidden");
    if (self.refresh || self.container.scrollTop != 0) return;

    if (!self.moved) {
      self.lastPointY = self.mouseDownY = event.touches.item(0).pageY;
      self.moved = true;
    }

    var pageY = event.touches.item(0).pageY;
    self.lastPointY = pageY;
    var diff = self.lastPointY - self.mouseDownY;

    if (diff < 0) diff = 0;
    if (diff > self.threshHold) {
      diff = self.windowHeight;
      if (!self.refresh) {
        self.refresh = true;
        $(".loading.hidden").removeClass("hidden");

        $(".messages").removeAttr("style");
        $(".messages").addClass("refresh");
      }
    }

    self.$(".messages").css("top", "calc(" + diff / 1.5 + "px)");
  };

  self.handleTouchDown = function(event) {
    if (self.historyChange.get() == 0 || self.refresh) return;;

    self.container.addEventListener('touchmove', self.handleTouchMove);
  };

  self.handleTouchUp = function(event) {
    $(".messages").removeAttr("style");
    if (self.refresh) {
      // call pastHistory
      if (self.oldestMsg == 0) {
        self.oldestMsg = new Date();
      }
      self.preOldestMsg = self.oldestMsg;

      Meteor.call("chats/getHistory", self.tagId, self.oldestMsg, self.lastRead, true, false, function(err, res) {
        console.log(JSON.stringify(res, undefined, 2));
        self.addToBottom = false;
        if (err) return;

        $(".messages").removeClass("refresh");
        self.refresh = false;

        if (res.history.length) {
          var history = self.history.get();
          self.historyChange.set(self.historyChange.get() + 1);
          self.history.set(res.history.reverse().concat(history));
          self.oldestMsg = res.history[0].time;
        }

        $(".loading").addClass("hidden");
      });
    }
    self.moved = false;
    self.container.removeEventListener("touchmove", self.handleTouchMove);
  };

  // add touch move event listeners here
  self.container.addEventListener("touchstart", self.handleTouchDown);
  self.container.addEventListener("touchend", self.handleTouchUp);

  self.handleAnchor = function(event) {
    $("body > .content").fadeOut(100).fadeIn(100);
    setTimeout(function() {
      FlowRouter.go("/user/tag_profile/" + self.tagId);
    }, 100);
  };
  $(".click_anchor").on("click", self.handleAnchor);
});

Template.tagChats.onDestroyed(function() {
  if (self.watchCursor)
    self.watchCursor.stop();

  $(".click_anchor").off("click", self.handleAnchor);
  $(".bottom.nav").removeClass("hidden");
});

Template.tagChats.events({
  "focus #msg": function(e, t) {
    var self = Template.instance();
    setTimeout(function() {
      self.container.scrollTop = self.container.scrollHeight - self.container.clientHeight;
    }, 300);
  },

  "click .button[data-action=\"send\"]": function(e, t) {

    var newMessage = $('#msg').val();
    e.preventDefault();
    $("#msg").val("");
    $("#msg")[0].focus();

    if (newMessage.length != 0) {
      var now = new Date();
      var msg = {
        is_public: true,
        sender: Meteor.userId(),
        receiver: t.tagId,
        message: newMessage,
        time: now,
        rate: 80
      };

      Meteor.call("chats/sendMsg", msg);
    }
  },

  "click .floater[data-action=\"down\"]":function(e, t) {
    var container = document.getElementsByClassName("messages")[0];
    container.scrollTop = container.scrollHeight - container.clientHeight;
    $("floater[data-action=\"down\"]").addClass("hidden");
    setTimeout(function() { t.newMsg.set(0); }, 500);
  },
  "click .floater[data-action=\"up\"]": function(e, t) {
    if ($(".new_msg").length) {
      t.container.scrollTop = $(".new_msg")[0].offsetTop - 0.4 * t.container.clientHeight;
      $(".floater[data-action=\"up\"]").addClass("hidden");
      setTimeout(function() { t.newMsg.set(0); }, 500);

    } else {

      t.container.scrollTop = 0;
      $(".messages").addClass("refresh");

      Meteor.call("chats/getHistory", t.tagId, t.oldestMsg, t.lastRead, true, false, function(err, res) {
        t.addToBottom  = false;
        if (err) return;

        $(".messages").removeClass("refresh");
        var history = t.history.get();
        t.historyChange.set(t.historyChange.get() + 1);
        t.history.set(res.history.reverse().concat(history));
        t.oldestMsg = res.history[0].time;
        t.newLeft.set(0);
        t.newLeft.set(res.leftNew);
      });
    }
  },
  "click .other.avatar": function(e,t) {
    var otherId = t.$(e.currentTarget).data('id');
    $("body > .content").fadeOut(100).fadeIn(100);
    setTimeout(function() {
      FlowRouter.go('/user/other_profile/'+otherId);
    }, 100);
  }
})

Template.tagChats.helpers({
  "initSubNotReady": function() {
    var self = Template.instance();
    return false;
    return self.historyChange.get() == 0;
  },
  "hasLeftNew": function() {
    var newleft = Template.instance().newLeft.get();
    return newleft? "" : "hidden";
  },
  "leftNew": function() {
    var newleft = Template.instance().newLeft.get();
    return newleft ==  100? "99+" : newleft;
  },
  "hasNewMsg": function() {
    var newMsg = Template.instance().newMsg.get();
    return newMsg != 0 ? "" : "hidden";
  },
  "newMsg": function() {
    return Template.instance().newMsg.get();
  },
  "messageChanged": function() {
    var self = Template.instance();
    return self.historyChange && self.historyChange.get() != 0;
  },
  "messages": function() {
    var history = Template.instance().history.get();
    if (history.length)
      localStorage.setItem(Template.instance().tagId, history[history.length - 1].time.toISOString());
    return Template.instance().history.get();
  },
  "seperate": function(time, startNew) {
    var self = Template.instance();

    if (startNew) {
      self.lastMsgTime = time;
      return Spacebars.SafeString('<div class="msg_wrapper"><p class="new_msg seperate"> Below are new messages </p></div>');
    }

    if (!self.lastMsgTime) {
      self.lastMsgTime = time;
      return "";
    } else {
      if (Math.abs(self.lastMsgTime - time) > 300000) {
        self.lastMsgTime = time;
        var seperate = new Date(time);
        var time = (seperate.getHours() < 10? ("0" + seperate.getHours()):  seperate.getHours()) + " : "
                 + (seperate.getMinutes() < 10? ("0" + seperate.getMinutes()):  seperate.getMinutes());
        return Spacebars.SafeString('<div class="msg_wrapper"><p class="seperate">' + time + "</p></div>");
      }

      return "";
    }
  },
  "watchScroll": function() {
    // get reactive source
    var self = Template.instance();
    self.historyChange.get() != 0;
    var container = document.getElementsByClassName("messages")[0];
    if (container.scrollTop + container.clientHeight > container.scrollHeight - 50) {
      self.scrollPos = "bottom";
    } else {
      if (self.addToBottom) {
        self.scrollPos = container.scrollTop;

      } else {
        self.scrollPos = container.scrollHeight - container.scrollTop;
      }
    }
  },
  "scrollToPlace": function() {
    var self = Template.instance();
    var container = $(".messages")[0];

    setTimeout(function() {
      if ($(".new_msg").length) {
        // if new msg in screen
        if ($(".new_msg")[0].offsetTop > container.scrollHeight - container.clientHeight) {

          if ($(".new_msg")[0].offsetTop < container.scrollHeight - 0.4 * container.clientHeight) {
            container.scrollTop = $(".new_msg")[0].offsetTop - 0.4 * container.clientHeight
          }

          return;
        }
      }

      if (self.scrollPos == "bottom") {
        container.scrollTop = container.scrollHeight - container.clientHeight;

      } else {
        if (self.addToBottom) {
          container.scrollTop = self.scrollPos;
        } else {
          container.scrollTop = container.scrollHeight - self.scrollPos;
        }
      }
    }, 50);

  },
  "ownMsg": function(id) {
    return id == Meteor.userId();
  },
  "profileSeed": function(id) {
    var user = Meteor.users.findOne(id);
    return user? user.profile.profileSeed: "";
  }
});
