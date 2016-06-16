Sizes = new Mongo.Collection('sizes');
UnfilteredUOMList = new Mongo.Collection('unfilteredUOMList');

if (Meteor.isServer) {
  Meteor.methods({
    unfilteredUOMListInsert: function(data) {
      console.log(typeof data)
      return UnfilteredUOMList.upsert({name: data.name}, data);
    }
  });

  Meteor.publish('lists', function() {
    return UnfilteredUOMList.find();
  });
}
