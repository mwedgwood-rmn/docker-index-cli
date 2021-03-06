var util = require('util');
var request = require('request');
var easytable = require('easy-table')

function usage(err) {
  if (err) {
    console.log(err);
    console.log();
  }
  console.log('Usage: removePermission <user>@<index>/<repo>')
  console.log('Example: removePermission myuser@index.private.io/base/ubuntu')
  process.exit(10);
}

module.exports = function(dockercfg) {

  return {

    callback: function(options) {
      var cmd = options[0];
      var arg1 = options[1];
      var permission = options[2];

      if (typeof(arg1) == "undefined") {
        usage('Error: Wrong number of arguments');
      }
      
      var parts1 = arg1.split('@');

      if (parts1.length != 2) {
        usage('Error: Invalid user and index format.');
      }

      var username = parts1[0];
      var parts2 = parts1[1].split('/');
      var index = parts2.shift();

      if (typeof(dockercfg[index]) == "undefined" || typeof(dockercfg[index].auth) == "undefined") {
        console.log('Error: Unknown Index -- Index is not defined in your ~/.dockercfg file')
        process.exit(10);
      }

      if (parts2.length > 2) {
        usage('Error: Invalid repository format. Given: ' + parts2.join('/') + ', Expected: namespace/repo OR repo')
      }
      
      var repository = parts2.join('/');

      var protocol = (options.http == true) ? 'http' : 'https';
      var url = util.format('%s://%s/users/%s/permissions/%s', protocol, index, username, repository);

      request.del(url, {
        headers: {
          'Authorization': 'Basic ' + dockercfg[index].auth
        }
      }, function(err, res, body) {
        if (err) {
          console.error('Error: ' + err);
        }

        if (res.statusCode != 200) {
          console.error(body);
          return;
        }

        try {
          var result = JSON.parse(body);
        }
        catch (e) {
          console.error(e);
          process.exit(5);
        }

        console.log(result);
      });
    }
    
  };
  
};
