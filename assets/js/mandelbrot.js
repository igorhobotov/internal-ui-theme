'use strict';

require("babel-polyfill");

global.jQuery    = require('jquery');
const pjax       = require('jquery-pjax');
const $          = global.jQuery;
const doc        = $(document);
const frctl      = window.frctl || {};

const events     = require('./events');
const utils      = require('./utils');
const framer     = require('./components/frame');
const Tree       = require('./components/tree');
const search     = require('./components/search');
const Pen        = require('./components/pen');
const Header     = require('./components/header');

global.fractal = {
    events: events
};

$(function () {
    const frame     = framer($('#frame'));
    const navTrees  = $.map($('[data-behaviour="tree"]'), t => new Tree(t));
    let pens        = [];

    loadPen();

    if (frctl.env == 'server') {
        if (utils.isSmallScreen()) {
            frame.closeSidebar();
        } else {
            if (location.pathname === '/') {
                frame.closeSidebar(true);
            } else {
                frame.openSidebar(true);
            }
        }

        doc.pjax('a[data-pjax], code a[href], .Prose a[href]:not([data-no-pjax]), .Browser a[href]:not([data-no-pjax])', '#pjax-container', {
            fragment: '#pjax-container',
            timeout: 10000
        }).on('pjax:start', function(e, xhr, options){
            frame.startLoad();
            events.trigger('main-content-preload', options.url);
        }).on('pjax:end', function(){
            events.trigger('main-content-loaded');
            frame.endLoad();
        });
    }

    events.on('main-content-loaded', loadPen);

    function loadPen(){
        setTimeout(function(){
            pens = $.map($('[data-behaviour="pen"]'), p => new Pen(p));
        }, 1);
    }
});
