App.Collections.Tags = new Mongo.Collection('tags');

var tagSchema = {
   
  wifis: {
    type: Array,
    optional: true,
    label: "array of wifi id under this tag"
  },
  "wifis.$": {
    type: String,
    optional: true
  },
  users: {
    type: Array,
    optional: true,
    label: "array of user id under this tag"
  },
  "users.$": {
    type: String,
    optional: true
  },
  start_time: {
    type: String,
    optional: true
  },
  end_time: {
    type: String,
    optional: true
  },
  repeat: {
    type: Number,
    optional: true,
    label: "a number that indicates what days the tag becomes active"
  }
};

// attach the schema
App.Schemas.Tags = new SimpleSchema(tagSchema);
App.Collections.Tags.attachSchema(App.Schemas.Tags);
