'use strict';

const $       = global.jQuery;
const storage = require('../storage');
const utils   = require('../utils');
const events  = require('../events');
const config  = require('../config');

module.exports = function(element){

    const win          = $(window);
    const doc          = $(document);
    const el           = $(element);
    const id           = el[0].id;
    const dir          = $('html').attr('dir');
    const header       = el.find('> [data-role="header"]');
    const body         = el.find('> [data-role="body"]');
    const toggle       = el.find('[data-action="toggle-sidebar"]');
    const sidebar      = body.children('[data-role="sidebar"]');
    const main         = body.children('[data-role="main"]');
    const handle       = body.children('[data-role="frame-resize-handle"]');
    const sidebarMin   = parseInt(sidebar.css('min-width'), 10);

    let sidebarState   = utils.isSmallScreen() ? 'closed' : storage.get(`frame.state`, 'open');
    let scrollPos      = storage.get(`frame.scrollPos`, 0);
    let dragOccuring   = false;
    let isInitialClose = false;
    let handleClicks   = 0;

    if (sidebarState === 'closed') {
        isInitialClose = true;
        closeSidebar();
    }

    sidebar.scrollTop(scrollPos);

    handle.on('mousedown', e => {
        handleClicks++;
        setTimeout(function() {
            handleClicks = 0;
        }, 400);
        if (handleClicks === 2) {
            dragOccuring = false;
            toggleSidebar();
            handleClicks = 0;
            e.stopImmediatePropagation();
            return;
        }
    });

    sidebar.on('scroll', utils.debounce((e) => {
        storage.set(`frame.scrollPos`, sidebar.scrollTop());
    }, 50));

    toggle.on('click', toggleSidebar);

    // Global event listeners

    events.on('toggle-sidebar', toggleSidebar);
    events.on('start-dragging', e => (dragOccuring = true));
    events.on('end-dragging', function(){
        setTimeout(function(){
            dragOccuring = false;
        }, 200);
    });

    events.on('data-changed', function(){
        // TODO: make this smarter?
        document.location.reload(true);
    });

    function closeSidebar(immediate){
        if (dragOccuring || (!isInitialClose && sidebarState == 'closed')) return;
        const w = sidebar.outerWidth();
        let translate = (dir == 'rtl') ? w + 'px' : (-1 * w) + 'px';
        let sidebarProps = {
            transform: `translate3d(${translate}, 0, 0)`
        };
        if (dir == 'rtl') {
            sidebarProps.marginLeft = (-1 * w) + 'px';
        } else {
            sidebarProps.marginRight = (-1 * w) + 'px';
        }
        sidebarProps.transition = immediate || isInitialClose ? 'none' : '.3s ease all';
        body.css(sidebarProps);
        sidebarState = 'closed';
        el.addClass('is-closed');
        storage.set(`frame.state`, sidebarState);
        isInitialClose = false;
    }

    function openSidebar(immediate){
        if (dragOccuring || sidebarState == 'open') return;

        body.css({
            marginRight: 0,
            marginLeft: 0,
            transition: immediate ? 'none' : '.3s ease all',
            transform: `translate3d(0, 0, 0)`
        });
        sidebarState = 'open';
        el.removeClass('is-closed');
        storage.set(`frame.state`, sidebarState);
    }

    function toggleSidebar(){
        sidebarState == 'open' ? closeSidebar() : openSidebar();
        return false;
    }

    return {

        closeSidebar: closeSidebar,

        openSidebar: openSidebar,

        startLoad: function(){
            main.addClass('is-loading');
        },

        endLoad: function(){
            main.removeClass('is-loading');
        }
    }
};
