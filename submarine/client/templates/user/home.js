Template.Home.onRendered(function() {
  Session.set("currentTemplate", "home");
});

Template.Home.helpers({

    "greetingName": function() {
        return "Sheep";
    },

    "recentTags": function() {
        return [
            "tag1",
            "tag2",
            "tag3",
            "tag4",
            "tag5",
            ];
    },

    "recentFriends": function() {
        return [
            "friend1",
            "friend2",
            "friend3",
            "friend4",
            "friend5",
            ];
    }
})
