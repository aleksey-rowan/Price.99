/*
* jQuery Highlight Regex Plugin v0.1.2
*
* Based on highlight v3 by Johann Burkard
* http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html
*
* (c) 2009-13 Jacob Rothstein
* MIT license
*/

var $ = require('./../libs/jquery-1.11.1.min');

/*var normalize = function (node) {
        if (!(node && node.childNodes)) return
        var children = $.makeArray(node.childNodes)
        , prevTextNode = null
        $.each(children, function (i, child) {
            if (child.nodeType === 3) {
                if (child.nodeValue === "") {
                    node.removeChild(child)
                } else if (prevTextNode !== null) {
                    prevTextNode.nodeValue += child.nodeValue;
                    node.removeChild(child)
                } else {
                    prevTextNode = child
                }
            } else {
                prevTextNode = null
                if (child.childNodes) {
                    normalize(child)
                }
            }
        })
    }*/
    $.fn.highlightRegex = function (regex, options) {
    if (typeof regex === 'object' && !(regex.constructor.name == 'RegExp' || regex instanceof RegExp)) {
        options = regex;
        regex = undefined;
    }
    
    if (typeof options === 'undefined') options = {}
    options.className = options.className || '';
    options.jClassName = options.className ? '.' + options.className : options.className;
    options.tagType = options.tagType || 'span'
    options.attrs = options.attrs || {}
    
    if (typeof regex === 'undefined' || regex.source === '') {
        $(this)
                .find(options.tagType + options.jClassName)
                .each(function () {
            var node = $(this);
            node.replaceWith(node.text());
                    //normalize(node.parent().get(0))
        });
    } else {
        $(this).each(function () {
            var elt = $(this).get(0)
            //normalize(elt)
            
            switch (this.tagName) {
                case 'SCRIPT':
                    return;
                case 'STYLE':
                    return;
                default:
            }
            
            $.each($.makeArray(elt.childNodes), function (i, searchnode) {
                var spannode, middlebit, middleclone, pos, match, parent
                //normalize(searchnode)
                if (searchnode.nodeType == 3) {
                    // don't re-highlight the same node over and over
                    if ($(searchnode).parent(options.tagType + options.jClassName).length) {
                        return;
                    }
                    
                    if (searchnode.data) {
                        
                        var result,
                            second,
                            parent = searchnode.parentNode,
                            prevIndex,
                            third,
                            first;
                        
                        reg = new RegExp(regex);
                        while ((result = reg.exec(searchnode.data)) !== null) {
                            pos = result.index;
                            
                            //console.log(result);
                            
                            spannode = document.createElement(options.tagType)
                            if (options.className) {
                                spannode.className = options.className
                            }
                            $(spannode).attr(options.attrs)
                            
                            if (!first) {
                                first = document.createTextNode(searchnode.data.substring(0, result.index));
                                second = document.createDocumentFragment();
                            } else {
                                first = document.createTextNode(searchnode.data.substring(prevIndex, result.index));
                            }
                            
                            second.appendChild(first);
                            //spannode.nodevalue = searchnode.data.substr(pos, result.length);
                            
                            spannode.appendChild(document.createTextNode(searchnode.data.substr(result.index, result.length)));
                            
                            //second = document.createTextNode(searchnode.data.substring(0, 2));
                            prevIndex = result.index + result.length;
                            
                            second.appendChild(spannode);
                                
                        }
                        
                        if (second) {
                            third = document.createTextNode(searchnode.data.substring(prevIndex));
                            second.appendChild(third);
                            parent.replaceChild(second, searchnode);
                        }
                    }
                } else {
                    $(searchnode).highlightRegex(regex, options)
                }
            })
        })
    }
    return $(this)
};