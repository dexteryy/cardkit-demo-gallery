
require([
    'mo/lang',
    'mo/template',
    'test/tpl/page',
    'cardkit/app'
], function(_, tpl, tpl_page, app){

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

        after(function(){
            this.page.remove();
        });

    });

});

