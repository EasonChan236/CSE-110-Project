Meteor.publish("chat/friendChats", function(limit, query) {
  var selector = {
    is_public: false,
    sender: {
      "$in": [this.userId, query.friendId]
    },
    receiver: {
      "$in": [this.userId, query.friendId]
    }
  };

  return App.Collections.Message.find(selector, {
    limit: limit,
    sort: {time: -1}
  });
});

Meteor.publish("chat/tagChats", function(tagId, date, isNew, limit) {
  var selector = {
    is_public: true,
    receiver: tagId
  };

  if (isNew) {
    if (date) {
      selector.time = {
        $gt: new Date(date)
      };
    }
    return App.Collections.Message.find(selector, { sort: {time: -1} });

  } else {
    selector.time = {
      $lte: new Date(date)
    };
    return App.Collections.Message.find(selector, { sort: {time: -1}, limit: limit});
  }
});
