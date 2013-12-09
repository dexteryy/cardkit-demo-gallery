
require([
    'mo/lang',
    'mo/template',
    'darkdom',
    'test/tpl/page',
    'test/tpl/page_source',
    'cardkit/app'
], function(_, tpl, darkdom, 
    tpl_page, tpl_page_source, app){

var $ = window.jQuery;
darkdom.initPlugins($);

app.init();

describe("the page card", function(){

    var page, page_source, dark_root, bright_root;

    beforeEach(function(){
        page = $(tpl.convertTpl(tpl_page.template, {
        })).appendTo('body');
        page_source = $(tpl.convertTpl(tpl_page_source.template, {
        })).appendTo('body');
        app.render(page);
        dark_root = $('ck-card');
        bright_root = $('.ck-card');
    });

    describe("the hidden root", function(){

        it("is invisible", function(){
            expect(dark_root).to.hide;
        });

        it("can be accessed by ID", function(){
            var accessible_elm = document.getElementById('elmInBox');
            var my_elm = dark_root.find('.elm-in-box');
            expect($('#elmInBox')).to.length(1);
            expect(my_elm).to.exist;
            expect(my_elm).to.be(accessible_elm);
        });

    });

    describe("the visible root", function(){

        it("is below to the hidden root", function(){
            expect(bright_root.prev()).to.be(dark_root);
        });

        it("can NOT be accessed by ID", function(){
            var accessible_elm = document.getElementById('elmInBox');
            var my_elm = bright_root.find('.elm-in-box');
            expect($('#elmInBox')).to.length(1);
            expect(my_elm).to.exist;
            expect(my_elm).to.not.be(accessible_elm);
        });

    });

    describe("the content component in the visible root", function(){

        var box;

        beforeEach(function(){
            box = bright_root.find('.ck-box-unit');
        });

        it("is among other contents in order", function(){
            expect(box.prev()).to.be('p');
            expect(box.next()).to.be('p');
        });

        it("with attributes", function(){
            expect(box).to.have.attr('data-cfg-plain', 'true');
        });

    });

    describe("update dark root", function(){

        var bright_box, dark_box;

        beforeEach(function(){
            bright_box = bright_root.find('.ck-box-unit');
            dark_box = dark_root.find('ck-card[type="box"]').eq(0);
        });
    
        it("change component's content", function(){

            var title_1 = 'title 11111';
            var title_2 = 'title 22222';
            var bright_hd = bright_box.find('.ck-hd');
            var dark_hd = dark_box.find('ck-part[type="hd"]');

            dark_hd.html(title_1);
            expect(bright_hd).to.not.have.html(title_1);

            dark_box.updateDarkDOM();
            bright_hd = bright_box.find('.ck-hd');
            expect(bright_hd).to.have.html(title_1);

            dark_hd.html(title_2);
            expect(bright_hd).to.have.html(title_1);

            dark_hd.updateDarkDOM();
            bright_hd = bright_box.find('.ck-hd');
            expect(bright_hd).to.have.html(title_2);

        });
    
        it("remove component", function(){

            var actions = bright_root.find('.ck-action');
            var count = actions.length;

            dark_root.find('button[action-layout]').eq(count - 1).remove();
            expect(actions).to.length(count);

            dark_root.updateDarkDOM();
            actions = bright_root.find('.ck-action');
            expect(actions).to.length(count - 1);

        });

        it("add component", function(){

            var actions = bright_root.find('.ck-action');
            var count = actions.length;

            dark_root.find('ck-part[type="actionbar"]')
                .append('<button type="button" action-layout="auto">yy</button>');
            expect(actions).to.length(count);

            dark_root.updateDarkDOM();
            actions = bright_root.find('.ck-action');
            expect(actions).to.length(count + 1);
            expect(actions.eq(actions.length - 1)).to.have.html('yy');

        });

        it("custom updater", function(){

            var button1 = dark_root.find('button[action-layout]').eq(0);
            var bright_button1 = bright_root.find('.ck-action').eq(0);

            button1.observeDarkDOM('content', function(changes){
                $(changes.root).html(changes.newValue);
                return false;
            });

            button1.html('aaaa');
            dark_root.updateDarkDOM();
            expect(bright_button1).to.have.html('aaaa');

        });

    });

    describe("source", function(){
    
        var box1, box2, dark_box2;

        beforeEach(function(){
            box1 = bright_root.find('.ck-box-unit').eq(0);
            box2 = bright_root.find('.ck-box-unit').eq(1);
            dark_box2 = dark_root.find('ck-card[type="box"]').eq(1);
        });

        it("add content", function(){
            expect(box1.find('p')).to.length(1);
        });

        it("add component", function(){
            expect(box1.find('.ck-ft')).to.exist;
        });

        it("merge component", function(){
            expect(box1.find('.ck-hd')).to.not.html("This is source's head");
        });

        it("component's source", function(){
            var actions = bright_root.find('.ck-action');
            expect(actions).to.length(3);
            expect(box2.find('.ck-content')).to.length(3);
        });

        it("set source: content", function(){
            var content3 = dark_box2.find('[type="content"]').eq(2);
            content3.feedDarkDOM({
                contentList: ['xx', 'yy']
            });
            dark_root.updateDarkDOM();
            expect(box2.find('.ck-content').eq(2)).to.html('xxyy');
        });

        it("set source: components", function(){
            var hd_text = '12345';
            var ft_text = '54321';
            dark_box2.feedDarkDOM({
                componentData: {
                    hd: {
                        contentList: [hd_text],
                    },
                    ft: {
                        contentList: [ft_text]
                    }
                }
            });
            dark_root.updateDarkDOM();
            box2 = bright_root.find('.ck-box-unit').eq(1);
            expect(box2.find('.ck-hd')).to.html(hd_text);
            expect(box2.find('.ck-ft')).to.html(ft_text);
        });

    });

    afterEach(function(){
        page_source.remove();
        page.remove().updateDarkDOM();
    });

});

});

