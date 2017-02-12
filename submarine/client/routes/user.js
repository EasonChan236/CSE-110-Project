var userRoutes = FlowRouter.group({
  prefix: '/user',
  name: 'user'
});

userRoutes.route('/home', {
  name: "home",
  action() {
    BlazeLayout.render('mainLayout', {content: 'Home'});
  }
});

userRoutes.route('/friends', {
  name: "friends",
  action() {
    BlazeLayout.render('mainLayout', {content: 'Friends'});
  }
});


userRoutes.route('/places', {
  name: "places",
  action() {
    BlazeLayout.render('mainLayout', {content: 'Places'});
  }
});

userRoutes.route('/chats/:id', {
  name: "chats",
  action() {
    BlazeLayout.render('mainLayout', {content: 'Chats'})
  }
});

userRoutes.route('/profile', {
  name: "profile",
  action() {
    BlazeLayout.render('mainLayout', {content: 'Profile'})
  }
});

userRoutes.route('/friend_profile', {
  name: "friend_profile",
  action() {
    BlazeLayout.render('mainLayout', {content: 'FriendProfile'})
  }
});
