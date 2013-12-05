
require([
    'mo/lang',
    'mo/template',
    'darkdom',
    'test/tpl/page',
    'cardkit/app'
], function(_, tpl, darkdom, tpl_page, app){

var $ = window.jQuery;

app.init();

describe("the page card", function(){

    before(function(){
        this.page = $(tpl.convertTpl(tpl_page.template, {
        })).appendTo('body');
        app.render(this.page);
        this.darkRoot = $('ck-card');
        this.brightRoot = $('.ck-card');
    });

    describe("the hidden root", function(){

        it("is invisible", function(){
            expect(this.darkRoot).to.hide;
        });

        it("can be accessed by ID", function(){
            var accessible_elm = document.getElementById('elmInBox');
            var my_elm = this.darkRoot.find('.elm-in-box');
            expect($('#elmInBox')).to.length(1);
            expect(my_elm).to.exist;
            expect(my_elm).to.be(accessible_elm);
        });

    });

    describe("the visible root", function(){

        it("is below to the hidden root", function(){
            expect(this.brightRoot.prev()).to.be(this.darkRoot);
        });

        it("can NOT be accessed by ID", function(){
            var accessible_elm = document.getElementById('elmInBox');
            var my_elm = this.brightRoot.find('.elm-in-box');
            expect($('#elmInBox')).to.length(1);
            expect(my_elm).to.exist;
            expect(my_elm).to.not.be(accessible_elm);
        });

    });

    describe("the content component in the visible root", function(){

        before(function(){
            this.box = this.brightRoot.find('.ck-box-unit');
        });

        it("is among other contents in order", function(){
            expect(this.box.prev()).to.be('p');
            expect(this.box.next()).to.be('p');
        });

        it("with attributes", function(){
            expect(this.box).to.have.attr('data-cfg-plain', 'true');
        });

    });

    describe("update dark root", function(){

        before(function(){
            this.brightBox = this.brightRoot.find('.ck-box-unit');
            this.darkBox = this.darkRoot.find('ck-card[type="box"]');
        });
    
        it("change component's content", function(){

            var title_1 = 'title 11111';
            var title_2 = 'title 22222';
            var bright_hd = this.brightBox.find('.ck-hd');
            var dark_hd = this.darkBox.find('ck-part[type="hd"]');

            dark_hd.html(title_1);
            expect(bright_hd).to.not.have.html(title_1);

            darkdom.update(this.darkBox);
            bright_hd = this.brightBox.find('.ck-hd');
            expect(bright_hd).to.have.html(title_1);

            dark_hd.html(title_2);
            expect(bright_hd).to.have.html(title_1);

            darkdom.update(dark_hd);
            bright_hd = this.brightBox.find('.ck-hd');
            expect(bright_hd).to.have.html(title_2);

        });
    
        it("remove component", function(){

            var actions = this.brightRoot.find('.ck-action');
            var count = actions.length;

            this.darkRoot.find('button[action-layout]').eq(count - 1).remove();
            expect(actions).to.length(count);

            darkdom.update(this.darkRoot);
            actions = this.brightRoot.find('.ck-action');
            expect(actions).to.length(count - 1);

        });

        it("add component", function(){

            var actions = this.brightRoot.find('.ck-action');
            var count = actions.length;

            this.darkRoot.find('ck-part[type="actionbar"]')
                .append('<button type="button" action-layout="auto">yy</button>');
            expect(actions).to.length(count);

            darkdom.update(this.darkRoot);
            actions = this.brightRoot.find('.ck-action');
            expect(actions).to.length(count + 1);
            expect(actions.eq(actions.length - 1)).to.have.html('yy');

        });

        it("custom updater", function(){

            var button1 = this.darkRoot.find('button[action-layout]').eq(0);
            var bright_button1 = this.brightRoot.find('.ck-action').eq(0);

            darkdom.observe(button1, 'content', function(changes){
                $(changes.root).html(changes.newValue);
                return false;
            });

            button1.html('aaaa');
            darkdom.update(this.darkRoot);
            expect(bright_button1).to.have.html('aaaa');

        });

    });

    after(function(){
        this.page.remove();
    });

});

});

