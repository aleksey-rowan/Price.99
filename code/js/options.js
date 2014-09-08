/* global require */

; (function () {
    "use strict";
    console.log('OPTIONS SCRIPT WORKS!');

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
    var $ = require('./libs/jquery-1.11.1.min'),
        handlers = require('./modules/handlers').create('options'),
        storage = require('./modules/storage.js'),
        runner = require('./modules/runner'),
        msg = require('./modules/msg'),
            
        centsRule = {
            enabled: $('#cents-rule input[type=checkbox]'),
            value: $('#cents-rule input[type=number]')
        },
        dollarsRule = $("#dollars-rule input[type=number]"),
        tensRule = $("#tens-rule input[type=number]"),
        hundredsRule = $("#hundreds-rule input[type=number]");//, 
    //form = require('./modules/form'),

    //form.init(runner.go.bind(runner, msg));

    //require('./libs/jquery.maskedinput.min.js');
    require('./libs/stepper/jquery.fs.stepper.min.js');

    msg = msg.init('options', handlers);

    console.log(storage.options);
    storage.getOptions(function () {
        init(runner.go.bind(runner, msg));
    });

    // retrieve options from local storage if any
    /*chrome.storage.sync.get({
        options: CONST.optionsDefault
    }, function (items) {
        console.log('Options : Options loaded', items.options);
        storage.options = items.options;
    });*/

    function saveOptions(callback) {
        storage.saveOptions(function () {
            var res = {
                type: 'bcast',
                cmd: 'optionsChanged',
                arg: storage.options,
                ctxs: ['ct', 'bg'],
                tab: -1
            };

            callback(res);
        });
    }

    function init(callback) {
        var roundRules = storage.options.roundRules;

        centsRule.value
            .val(roundRules.cents.value.toString())
            //.stepper()
            .change(function (e) {
                console.log(e);

                roundRules.cents.value = parseInt(e.currentTarget.value, 10);
                saveOptions(callback);
            });
        centsRule.enabled
            .prop('checked', roundRules.cents.enabled)
            .change(function (e) {
                console.log(e);

                roundRules.cents.enabled = e.currentTarget.checked;
                centsRule.value.prop('disabled', !roundRules.cents.enabled);
                saveOptions(callback);
            });

        dollarsRule
            .val(storage.options.roundRules.dollars.value.toString())
            //.stepper()
            .change(function (e) {
                console.log(e);

                storage.options.roundRules.dollars.value = parseInt(e.currentTarget.value, 10);
                saveOptions(callback);
            });

        tensRule
            .val(storage.options.roundRules.tens.value.toString())
            //.stepper()
            .change(function (e) {
                console.log(e);

                storage.options.roundRules.tens.value = parseInt(e.currentTarget.value, 10);
                saveOptions(callback);
            });

        hundredsRule
            .val(storage.options.roundRules.hundreds.value.toString())
            //.stepper()
            .change(function (e) {
                console.log(e);

                storage.options.roundRules.hundreds.value = parseInt(e.currentTarget.value, 10);
                saveOptions(callback);
            });
    }

    

    // old code
    //$(function () {
    //    $('.menu a').click(function (ev) {
    //        ev.preventDefault();
    //        var selected = 'selected';

    //        $('.mainview > *').removeClass(selected);
    //        $('.menu li').removeClass(selected);
    //        setTimeout(function () {
    //            $('.mainview > *:not(.selected)').css('display', 'none');
    //        }, 100);

    //        $(ev.currentTarget).parent().addClass(selected);
    //        var currentView = $($(ev.currentTarget).attr('href'));
    //        currentView.css('display', 'block');
    //        setTimeout(function () {
    //            currentView.addClass(selected);
    //        }, 0);

    //        setTimeout(function () {
    //            $('body')[0].scrollTop = 0;
    //        }, 200);
    //    });

    //    $('#launch_modal').click(function (ev) {
    //        ev.preventDefault();
    //        var modal = $('.overlay').clone();
    //        $(modal).removeAttr('style');
    //        $(modal).find('button, .close-button').click(function () {
    //            $(modal).addClass('transparent');
    //            setTimeout(function () {
    //                $(modal).remove();
    //            }, 1000);
    //        });

    //        $(modal).click(function () {
    //            $(modal).find('.page').addClass('pulse');
    //            $(modal).find('.page').on('webkitAnimationEnd', function () {
    //                $(this).removeClass('pulse');
    //            });
    //        });
    //        $(modal).find('.page').click(function (ev) {
    //            ev.stopPropagation();
    //        });
    //        $('body').append(modal);
    //    });

    //    $('.mainview > *:not(.selected)').css('display', 'none');
    //});

    //// Saves options to chrome.storage
    //function save_options() {
    //    var color = document.getElementById('color').value;
    //    var likesColor = document.getElementById('like').checked;
    //    chrome.storage.sync.set({
    //        favoriteColor: color,
    //        likesColor: likesColor,
    //        complex: {
    //            object: "me",
    //            andArray: [1, 2, 3]
    //        },
    //    }, function () {
    //        // Update status to let user know options were saved.
    //        var status = document.getElementById('status');
    //        status.textContent = 'Options saved.';
    //        setTimeout(function () {
    //            status.textContent = '';
    //        }, 750);


    //        storage.options.roundRules.cents.value = 10;

    //        msg.bcast(['ct', 'bg'], 'optionsChanged', storage.options);
    //    });
    //}

    //// Restores select box and checkbox state using the preferences
    //// stored in chrome.storage.
    //function restore_options() {
    //    // Use default value color = 'red' and likesColor = true.
    //    chrome.storage.sync.get({
    //        favoriteColor: 'red',
    //        likesColor: true,
    //        complex: null
    //    }, function (items) {
    //        document.getElementById('color').value = items.favoriteColor;
    //        document.getElementById('like').checked = items.likesColor;

    //        console.log(items);
    //    });
    //}
    //document.getElementById('save').addEventListener('click',
    //    save_options);

    //document.addEventListener('DOMContentLoaded', restore_options);
})();