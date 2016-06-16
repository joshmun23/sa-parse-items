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

if (Meteor.isClient) {
  Template.importData.onCreated(function() {
    Meteor.subscribe('lists');
    Session.setDefault('data', []);
    this.fetchItemNumbers = fetchItemNumbers.bind(this);
  });

  Template.importData.helpers({
    data: function() {
      debugger;
      Session.get('data')
      return Template.instance().fetchItemNumbers();
    }
  });

  Template.importData.events({
    'click input[type=submit]': function(e, template) {
      e.preventDefault();

      Papa.parse($('input[type=file]').prop('files')[0], {
        download: false,
        header: true,
        errors: function() {
          debugger
        },
        complete: function(results, file) {
          // let data = findAll(results);
          let data = findGroups(results);
          debugger
          Session.set('data', data)
        }
      })
    }
  });
}

function findAll(results) {
  let data = {};
  // trim all numbers from the "Size"
  let trimRegex = /\d+(\.\d{1,2})?|\d+(\.\d{1,2})?|-|\/|"| |\.|/gi;
  // upsert the UOM into an Object
  _.each(results.data, function(item) {
    // if(!item.Size.match(excludeRegex)) {
      let size = (item.Size).replace(trimRegex, '')
      if(!data[size]) {
        data[size] = {
          itemNums: {
            SUSItem: [
              item['SUS Item']
            ],
            JFITEM: [
              item['JFITEM']
            ]
          }
        }
        data[size].count = 0;
      } else {
        data[size].itemNums.SUSItem.push(item['SUS ITEM']);
        data[size].itemNums.JFITEM.push(item['JFITEM']);
      }

      data[size].count++;
    // }
  });

  return data;
}

function findGroups(results) {
  let data = {};
  // trim all numbers from the "Size"
  let numberREGEX = /\d+(\.\d{1,2})?|\d+(\.\d{1,2})?|-|\/|\./gi;
  // let singularizeREGEX = /s$|es$/gi;
  // upsert the UOM into an Object
  _.each(results.data, function(item) {
    // if(!item.Size.match(excludeRegex)) {
      if (!item.Size) {
        return;
      }

      let unSingularizedSize = (item.Size).replace(numberREGEX, '').trim();
      let singularizedSize = _.singularize(unSingularizedSize);

      if(!data[singularizedSize]) {
        data[singularizedSize] = {
          name: singularizedSize,
          itemNums: {
            // SUSItem: [],
            JFITEM: []
          },
          originalValues: {},
          count: 0
        }

      } else {
      }

      if (typeof data[singularizedSize]['originalValues'][unSingularizedSize] === 'undefined') {
        data[singularizedSize]['originalValues'][unSingularizedSize] = 0;
      }

      // data[singularizedSize].itemNums.SUSItem.push(item['SUS Item']);
      data[singularizedSize].itemNums.JFITEM.push(item['JFITEM']);
      data[singularizedSize]['originalValues'][unSingularizedSize]++;
      data[singularizedSize].count++;
    // }
  });

  for (let key in data) {
    debugger;
    Meteor.call('unfilteredUOMListInsert', data[key]);
  }

  return data;
}

function fetchItemNumbers() {
  debugger;
  return _.map(UnfilteredUOMList.find().fetch(), function(lst) { return {
      name: lst.name,
      itemNums: [lst.itemNums.JFITEM]
    };
  });
}
