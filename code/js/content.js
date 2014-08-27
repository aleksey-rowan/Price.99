/* global require */

; (function () {
    console.log('CONTENT SCRIPT WORKS!');

    var $ = require('./libs/jquery-1.11.1.min'),
    // here we use SHARED message handlers, so all the contexts support the same
    // commands. but this is NOT typical messaging system usage, since you usually
    // want each context to handle different commands. for this you don't need
    // handlers factory as used below. simply create individual `handlers` object
    // for each context and pass it to msg.init() call. in case you don't need the
    // context to support any commands, but want the context to cooperate with the
    // rest of the extension via messaging system (you want to know when new
    // instance of given context is created / destroyed, or you want to be able to
    // issue command requests from this context), you may simply omit the
    // `hadnlers` parameter for good when invoking msg.init()
        handlers = require('./modules/handlers').create('ct'),
        msg = require('./modules/msg').init('ct', handlers),
        parser = require('./modules/parser'),
        storage = require('./modules/storage');
    //pp = require('./modules/pricepoint.js');
    
    console.log(storage.options);
    parser.blah();
    storage.options = { one : "one" };
    
    console.log(storage.options);
    parser.blah();
    msg.bg('getOptions', function (res) {
        console.log('Options ->', res);
        storage.options = res;
        console.log(storage.options);
        parser.blah();
    });

    console.log('jQuery version:', $().jquery);

    parser.parse();
    
    console.log(parser.pricePoints);

    $('ppnn').addClass('p1');

})();