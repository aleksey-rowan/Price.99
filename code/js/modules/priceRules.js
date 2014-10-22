/* global*/

var $ = require('./../libs/jquery-1.11.1.min'),
    storage = require('./../modules/storage'),
    pauseButton = $('#pause-button'),
    defaultDetails = $('#default-details'),
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
    ];

module.exports.init = function (callback) {
    var otherRules = storage.options.otherRules,
        roundRules = storage.options.roundRules;

    rules.forEach(function (rule) {
        rule.valueControl
            .val(roundRules[rule.content].value.toString())
            //.prop('disabled', !roundRules[rule.content].enabled)
            .stepper()
            .parent().stepper(roundRules[rule.content].enabled ? 'enable' : 'disable')
            .change(function (e) {
                console.log(e);

                roundRules[rule.content].value = parseInt(e.target.value, 10);
                callback();
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
            .picker(otherRules.enabled ? "enable" : "disable") // enable or disabled control according to the global rule's state
            .change(function (e) {
                console.log(e);

                roundRules[rule.content].enabled = e.currentTarget.checked;
                //rule.valueControl.prop('disabled', !roundRules[rule.content].enabled);
                rule.valueControl.parent().stepper(roundRules[rule.content].enabled ? 'enable' : 'disable');
                callback();
            });

        rule.container
            .hover(
                function () {
                    rules.forEach(function (r) {
                        r.detailsDiv.removeClass('selected');
                        r.container.removeClass('selected');
                        defaultDetails.removeClass('selected');
                    });

                    rule.detailsDiv.addClass('selected');
                    rule.container.addClass('selected');
                },

                function () {
                    rules.forEach(function (r) {
                        r.detailsDiv.removeClass('selected');
                        r.container.removeClass('selected');
                    });

                    defaultDetails.addClass('selected');
                }
            );
    });

    pauseButton
        .text(otherRules.enabled ? "pause rounding" : "resume rounding")
        .click(function (e) {
            var node = $(this);
            console.log(e);

            otherRules.enabled = !otherRules.enabled;
            node.text(otherRules.enabled ? "pause rounding" : "resume rounding");

            rules.forEach(function (r) {
                r.enabledControl.picker(otherRules.enabled ? "enable" : "disable");
            });

            callback();
        });
};