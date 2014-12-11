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
            content: 'cents',
            exampleSpan: $('.cents-value')
        },
        {
            container: $('#dollars-rule'),
            enabledControl: $('#dollars-rule input[type=checkbox]'),
            valueControl: $('#dollars-rule input[type=number]'),
            detailsDiv: $('#dollars-details'),
            content: 'dollars',
            exampleSpan: $('.dollars-value')
        },
        {
            container: $('#tens-rule'),
            enabledControl: $('#tens-rule input[type=checkbox]'),
            valueControl: $('#tens-rule input[type=number]'),
            detailsDiv: $('#tens-details'),
            content: 'tens',
            exampleSpan: $('.tens-value')
        },
        {
            container: $('#hundreds-rule'),
            enabledControl: $('#hundreds-rule input[type=checkbox]'),
            valueControl: $('#hundreds-rule input[type=number]'),
            detailsDiv: $('#hundreds-details'),
            content: 'hundreds',
            exampleSpan: $('#hundreds-details .rule-example')
        }
    ];

function updateExamples(rule) {
    var roundRule = storage.options.roundRules[rule.content];

    if (roundRule.enabled) {
        rule.exampleSpan.removeClass().addClass("rule-example v" + roundRule.value); // comment
    } else {
        rule.exampleSpan.removeClass().addClass("rule-example");
    }
}

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
                updateExamples(rule);
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
                updateExamples(rule);
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

        updateExamples(rule);
    });

    pauseButton
        .click(function (e) {
            var node = $(this);
            console.log(e);

            otherRules.enabled = !otherRules.enabled;
            node
                .text(otherRules.enabled ? "pause" : "resume")
                .toggleClass('pause', otherRules.enabled);

            /*rules.forEach(function (r) {
                r.enabledControl.picker(otherRules.enabled ? "enable" : "disable");
            });*/

            callback();
        })
        .text(otherRules.enabled ? 'pause' : 'resume')
        .toggleClass('pause', otherRules.enabled);
};

module.exports.updateRuleControls = function () {
    var otherRules = storage.options.otherRules;

    rules.forEach(function (r) {
        r.enabledControl.picker(otherRules.enabled ? "enable" : "disable");
    });
};