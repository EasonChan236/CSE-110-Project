Template.mainLayout.onCreated(function() {
  this.autorun(() => {
    if (!Meteor.userId()) {
      FlowRouter.go("/");
      return;
    }

    this.subHandle = this.subscribe("users/relatedUsersAndTags");

    if (Meteor.user() && Meteor.user().profile.strangers && Meteor.user().profile.strangers.length)
      this.subHandle2 = this.subscribe("users/strangersInfo", Meteor.user().profile.strangers);
  });

  this.autorun(() => {
    FlowRouter.watchPathChange();

    if (Meteor.user()) {
      var tags = Meteor.user().profile.savedTags.map((tag) => tag.tagId);
      var friends = Meteor.user().profile.friends.map((user) => user.userId);

      Meteor.call("chats/getLastestMsg", tags, friends, (err, res) => {
        Session.set("latestMsg", res);
      });
    }
  });

  this.autorun(() => {
    var user = Meteor.user();

    this.subHandle.stop();
    this.subHandle = this.subscribe("users/relatedUsersAndTags");
  });
});

Template.mainLayout.onRendered(function() {
  var self = this;
  self.autorun(function() {
    var currentTemplate = Session.get("currentTemplate");
    self.$(".button").removeClass("active");
    self.$(".button[data-link=" + currentTemplate + "]").addClass("active");
  });
});

Template.mainLayout.events({
  "click .button": function (e, t) {
    var link = t.$(e.currentTarget).data('link');

    if (!link) return;
    $("body > .content").fadeOut(100).fadeIn(100);
    setTimeout(function() {
      FlowRouter.go('/user/' + link);
    }, 100);
  }
});

Template.mainLayout.helpers({
  "username": function() {
    return Meteor.user()? Meteor.user().username : null;
  },
  "subReady": function() {
    return Template.instance().subscriptionsReady();
  }
})
