
require([
    'mo/lang',
    'mo/template',
    'darkdom',
    'test/tpl/page',
    'test/tpl/page_source',
    'cardkit'
], function(_, tpl, darkdom, 
    tpl_page, tpl_page_source, cardkit){

var $ = window.jQuery;
darkdom.initPlugins($);

cardkit.init();

$(tpl.convertTpl(tpl_page_source.template, {})).appendTo('body');

describe("the page card", function(){

    var page, dark_root, bright_root;

    beforeEach(function(){
        page = $(tpl.convertTpl(tpl_page.template, {
        })).appendTo('body');
        cardkit.openPage();
        dark_root = $('ck-card');
        bright_root = $('.ck-page-card');
    });

    describe("the hidden root", function(){

        it("is invisible", function(){
            expect(dark_root).to.hide;
        });

        it("content can NOT be accessed by ID", function(){
            var accessible_elm = document.getElementById('elmInBox');
            var my_elm = dark_root.find('.elm-in-box');
            expect($('#elmInBox')).to.length(1);
            expect(my_elm).to.exist;
            expect(my_elm).to.not.be(accessible_elm);
        });

    });

    describe("the visible root", function(){

        it("is above to the hidden root", function(){
            expect(bright_root.next()).to.be(dark_root);
        });

        it("content can be accessed by ID", function(){
            var accessible_elm = document.getElementById('elmInBox');
            var my_elm = bright_root.find('.elm-in-box');
            expect($('#elmInBox')).to.length(1);
            expect(my_elm).to.exist;
            expect(my_elm).to.be(accessible_elm);
        });

    });

    describe("the content component in the visible root", function(){

        var box, box1, box2;

        beforeEach(function(){
            box = bright_root.find('.ck-box-card');
            box1 = box.eq(0);
            box2 = box.eq(1);
        });

        it("is among other contents in order", function(){
            expect(box1.prev()).to.be('p');
            expect(box1.next()).to.be('p');
            expect(box2.parent()).to.be('.yyy');
            expect(box2.prev()).to.be('p');
        });

        it("with attributes", function(){
            expect(box).to.have.attr('data-cfg-plain', 'true');
        });

    });

    describe("update dark root", function(){

        var bright_box, dark_box;

        beforeEach(function(){
            bright_box = bright_root.find('.ck-box-card');
            dark_box = dark_root.find('ck-card[type="box"]').eq(0);
        });
    
        it("change component's content", function(){

            var title_1 = 'title 11111';
            var title_2 = 'title 22222';
            var bright_hd = bright_box.find('.ck-hd span');
            var dark_hd = dark_box.find('ck-part[type="hd"]');

            dark_hd.html(title_1);
            expect(bright_hd).to.not.have.html(title_1);

            dark_box.updateDarkDOM();
            bright_hd = bright_box.find('.ck-hd span');
            expect(bright_hd).to.have.html(title_1);

            dark_hd.html(title_2);
            expect(bright_hd).to.have.html(title_1);

            dark_hd.updateDarkDOM();
            bright_hd = bright_box.find('.ck-hd span');
            expect(bright_hd).to.have.html(title_2);

        });
    
        it("remove component", function(){

            var actions = bright_root.find('.ck-item button');
            var count = actions.length;

            dark_root.find('button[action-layout]').eq(count - 1).remove();
            expect(actions).to.length(count);
            dark_root.updateDarkDOM();
            actions = bright_root.find('.ck-item button');
            expect(actions).to.length(count - 1);

        });

        it("add component", function(){

            var actions = bright_root.find('.ck-item button');
            var count = actions.length;

            dark_root.find('ck-part[type="actionbar"]')
                .append('<button type="button" action-layout="auto">yy</button>');
            expect(actions).to.length(count);

            dark_root.updateDarkDOM();
            actions = bright_root.find('.ck-item button');
            expect(actions).to.length(count + 1);
            expect(actions.eq(actions.length - 1)).to.have.html('yy');

        });

        it("custom updater", function(){

            var button1 = dark_root.find('button[action-layout]').eq(0);

            button1.responseDarkDOM('content', function(changes){
                $(changes.root).html(changes.newValue);
                return false;
            });

            button1.html('aaaa');
            dark_root.updateDarkDOM();
            var bright_button1 = bright_root.find('.ck-item button').eq(0);
            expect(bright_button1).to.have.html('aaaa');

        });

    });

    describe("source", function(){
    
        var box1, box2, dark_box2;

        beforeEach(function(){
            box1 = bright_root.find('.ck-box-card').eq(0);
            box2 = bright_root.find('.ck-box-card').eq(1);
            dark_box2 = dark_root.find('ck-card[type="box"]').eq(1);
        });

        it("add content", function(){
            expect(box1.find('p')).to.length(1);
        });

        it("add component", function(){
            expect(box1.find('footer')).to.exist;
        });

        it("merge component", function(){
            expect(box1.find('.ck-hd span')).to.not.html("This is source's head");
        });

        it("component's source", function(){
            var actions = bright_root.find('.ck-item');
            expect(actions).to.length(3);
            expect(box2.find('.ck-content')).to.length(3);
        });

        it("set source: content", function(){
            var content3 = dark_box2.find('[type="content"]').eq(2);
            content3.feedDarkDOM({
                contentData: {
                    text: 'xxyy'
                }
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
                        contentData: {
                            text: hd_text
                        }
                    },
                    ft: {
                        contentData: {
                            text: ft_text
                        }
                    }
                }
            });
            dark_root.updateDarkDOM();
            box2 = bright_root.find('.ck-box-card').eq(1);
            expect(box2.find('.ck-hd span')).to.html(hd_text);
            expect(box2.find('footer')).to.html(ft_text);
        });

    });

    afterEach(function(){
        page.remove().updateDarkDOM();
    });

});

});

