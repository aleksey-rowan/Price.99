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

        rules = [
            {
                container: $('#cents-rule'),
                enabledControl: $('#cents-rule input[type=checkbox]'),
                valueControl: $('#cents-rule input[type=number]'),
                detailsDiv: $('#cents-details'),
                content: 'cents'
            },
            {
                container: $('#dollars-rule'),
                enabledControl: $('#dollars-rule input[type=checkbox]'),
                valueControl: $('#dollars-rule input[type=number]'),
                detailsDiv: $('#dollars-details'),
                content: 'dollars'
            },
            {
                container: $('#tens-rule'),
                enabledControl: $('#tens-rule input[type=checkbox]'),
                valueControl: $('#tens-rule input[type=number]'),
                detailsDiv: $('#tens-details'),
                content: 'tens'
            },
            {
                container: $('#hundreds-rule'),
                enabledControl: $('#hundreds-rule input[type=checkbox]'),
                valueControl: $('#hundreds-rule input[type=number]'),
                detailsDiv: $('#hundreds-details'),
                content: 'hundreds'
            }
        ];//, 
    //form = require('./modules/form'),

    //form.init(runner.go.bind(runner, msg));

    //require('./libs/jquery.maskedinput.min.js');
    require('./libs/stepper/jquery.fs.stepper.min.js');
    require('./libs/picker/jquery.fs.picker.js');

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

        rules.forEach(function (rule) {
            rule.valueControl
                .val(roundRules[rule.content].value.toString())
                //.prop('disabled', !roundRules[rule.content].enabled)
                .stepper()
                .parent().stepper(roundRules[rule.content].enabled ? 'enable' : 'disable')
                .change(function (e) {
                    console.log(e);

                    roundRules[rule.content].value = parseInt(e.target.value, 10);
                    saveOptions(callback);
                });

            rule.enabledControl
                .prop('checked', roundRules[rule.content].enabled)
                .picker({
                    toggle: true,
                    labels: {
                        on: rule.content,
                        off: ''
                    }
                })
                .change(function (e) {
                    console.log(e);

                    roundRules[rule.content].enabled = e.currentTarget.checked;
                    //rule.valueControl.prop('disabled', !roundRules[rule.content].enabled);
                    rule.valueControl.parent().stepper(roundRules[rule.content].enabled ? 'enable' : 'disable');
                    saveOptions(callback);
                });

            rule.container
                .hover(
                    function () {
                        rules.forEach(function (r) {
                            r.detailsDiv.removeClass('selected');
                            r.container.removeClass('selected');
                        });

                        rule.detailsDiv.addClass('selected');
                        rule.container.addClass('selected');
                    },

                    function () {

                    }
                );
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