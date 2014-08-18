/* global chrome */


(function () {
    "use strict";

    $(function () {
        $('.menu a').click(function (ev) {
            ev.preventDefault();
            var selected = 'selected';

            $('.mainview > *').removeClass(selected);
            $('.menu li').removeClass(selected);
            setTimeout(function () {
                $('.mainview > *:not(.selected)').css('display', 'none');
            }, 100);

            $(ev.currentTarget).parent().addClass(selected);
            var currentView = $($(ev.currentTarget).attr('href'));
            currentView.css('display', 'block');
            setTimeout(function () {
                currentView.addClass(selected);
            }, 0);

            setTimeout(function () {
                $('body')[0].scrollTop = 0;
            }, 200);
        });

        $('#launch_modal').click(function (ev) {
            ev.preventDefault();
            var modal = $('.overlay').clone();
            $(modal).removeAttr('style');
            $(modal).find('button, .close-button').click(function () {
                $(modal).addClass('transparent');
                setTimeout(function () {
                    $(modal).remove();
                }, 1000);
            });

            $(modal).click(function () {
                $(modal).find('.page').addClass('pulse');
                $(modal).find('.page').on('webkitAnimationEnd', function () {
                    $(this).removeClass('pulse');
                });
            });
            $(modal).find('.page').click(function (ev) {
                ev.stopPropagation();
            });
            $('body').append(modal);
        });

        $('.mainview > *:not(.selected)').css('display', 'none');       

    });

    // Saves options to chrome.storage
    function save_options() {
        var color = document.getElementById('color').value;
        var likesColor = document.getElementById('like').checked;
        chrome.storage.sync.set({
            favoriteColor: color,
            likesColor: likesColor,
            complex: {
                object: "me",
                andArray: [1,2,3]
            },
        }, function () {
            // Update status to let user know options were saved.
            var status = document.getElementById('status');
            status.textContent = 'Options saved.';
            setTimeout(function () {
                status.textContent = '';
            }, 750);
        });
    }


    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    function restore_options() {
        // Use default value color = 'red' and likesColor = true.
        chrome.storage.sync.get({
            favoriteColor: 'red',
            likesColor: true,
            complex: null
        }, function (items) {
            document.getElementById('color').value = items.favoriteColor;
            document.getElementById('like').checked = items.likesColor;

            console.log(items);
        });
    }
    document.getElementById('save').addEventListener('click',
        save_options);

    document.addEventListener('DOMContentLoaded', restore_options);

}());