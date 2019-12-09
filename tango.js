var Tango = {
    version:0.1,
    dependencies:{
        jQuery:{
            minVersion:3.0,
            loadBeforeTango:true
        },
        /*moment:{
            minVersion:1,
            loadBeforeTango:true
        },*/
        bind:'auto'
    },
    mapping:{
        elementString:'<@el@ @type@="@val@">@content@</@el@>',
        elements:{
            'a*':'article',
            'as*':'aside',
            'd*':'div',
            'de*':'details',
            's*':'section',
            'h*':'header',
            'ft*':'footer',
            'f*':'form',
            'm*':'main',
            'n*':'nav',
            'su*':'summary'
        },
        selector:{
            'cl':' class="@cl@"',
            'id':' id="@id@"'
        }
    },
    processed:{
        objectRoot:{},
        outputHTML:''
    },
    templates:{
        generic:'<@elem@@id@@class@@style@@custom@>@inner@</@elem@>',
        form:'<@elem@ @name@@accept@@action@@method@@target@>',
        select:'<@elem@@id@@class@@style@@custom@>@inner@</select>',
        input:'<@elem@@name@@type@@id@@class@@style@@custom@/>',
        textarea:'<@elem@@name@@rows@@cols@@id@@class@@style@@custom@></textarea>',
        button:'<@elem@@type@@id@@class@@style@@custom@>@inner@</button>'
    },
    builders:{
        buildTangoCore:function(){
            $('body').append('<section id="tango" tango-data-attr="root"></section>')
            $('tango').remove();
        },
        template:'<@elem@@id@@class@@style@@custom@>@inner@</@elem@>',
        buildHTMLelement:function(itm,nd){
            var rootElem = itm.item;
            this.template = Tango.templates[rootElem.type] === undefined ? Tango.templates.generic : Tango.templates[rootElem.type];
            var masterTemp = this.template.replace(/@elem@/g,rootElem.type); //define the element type
            if(rootElem.id !== undefined){
                masterTemp = masterTemp.replace(/@id@/g,' id="'+rootElem.id+'"');
            }else{
                masterTemp = masterTemp.replace(/@id@/g,'');
            }
            if(rootElem.class !== undefined && rootElem.class !== ''){
                masterTemp = masterTemp.replace(/@class@/g,' class="'+rootElem.class+'"');
            }else{
                masterTemp = masterTemp.replace(/@class@/g,'');
            }
            if(rootElem.style !== undefined && rootElem.style !== ''){
                masterTemp = masterTemp.replace(/@style@/g,' style="'+rootElem.style+'"');
            }else{
                masterTemp = masterTemp.replace(/@style@/g,'');
            }
            if(rootElem.custom !== undefined && rootElem.custom !== ''){
                masterTemp = masterTemp.replace(/@custom@/g,' '+rootElem.custom);
            }else{
                masterTemp = masterTemp.replace(/@custom@/g,'');
            }
            if(rootElem.children !== undefined){
                masterTemp = masterTemp.replace(/@inner@/g,Tango.builders.buildChildElements(rootElem.children));
            }else{
                masterTemp = masterTemp.replace(/@inner@/g,'');
            }
            if(itm.item.handler !== undefined){
                masterTemp = masterTemp.replace('>',' tango-event-node="'+nd+'">');
            }
            return masterTemp;
        },
        buildChildElements:function(op){
            var outputStr = '';//string to hold the final output of options
            var template = '<@elem@@id@@class@@value@@default@>@label@</@elem@>';
            var defaultStr = ' selected="selected"';
            //console.log(op);
            if(Array.isArray(op)){
                $.each(op,function(a,b){
                    template = template.replace(/@elem@/g,b.type);
                    if(b.value !== undefined){
                        template = template.replace('@value@',' value="'+b.value+'"');
                    }
                    if(b.default !== undefined && b.default === true){
                        template = template.replace('@default@',defaultStr);
                    }else{
                        template = template.replace('@default@','');
                    }
                    if(b.label !== undefined){
                        template = template.replace('@label@',b.label);
                    }else{
                        template = template.replace('@label@','');
                    }
                    if(b.id !== undefined){
                        template = template.replace('@id@',b.id);
                    }else{
                        template = template.replace('@id@','');
                    }
                    if(b.class !== undefined){
                        template = template.replace('@class@',b.class);
                    }else{
                        template = template.replace('@class@','');
                    }
                    outputStr += template;
                });
            }else{
                outputStr += op.type === 'text' ? op.label : '';
            }
            return outputStr !== undefined ? outputStr : '';
        },
        addCustomCodeToTemplate:function(tpl,xtr){

        }
    },
    events:{
        library:{
            thisIsAFunction:function(){
                console.log('fired from library');
            }
        },
        handler:function(fn){
            if(typeof Tango.events.library[fn] === 'function'){
                Tango.events.library[fn]();
            }else{
                eval(fn);
            }
        },
        validate:function(){
            //validation standards to be determined
            Tango.events.bind();
        },
        bind:function(){
            $.each(Tango.processed.objectRoot,function(a,b){
                if(b.item.handler !== undefined){
                    var tangoRef = a;
                    var handlerObj = b.item.handler;
                    var elementToAttach = $('[tango-data-attr="root"]').find('[tango-event-node="'+tangoRef+'"]'); 
                    $(elementToAttach).on(handlerObj.event,function(){
                        Tango.events.handler(handlerObj.function);
                    });
                }
            });
        }
    },
    parsing:{
        parseJSONnodes:function(obj,xtr){
            Tango.processed.objectRoot = obj;
            var xtrArray = xtr !== undefined && xtr !== '' ? xtr.split(' ') : null;
            var htmlString;
            var selectorObj;
            var base = '#tango';
            if(xtrArray !== null){
                htmlString = '<'+Tango.mapping.elements[xtrArray[0]]+'></'+Tango.mapping.elements[xtrArray[0]]+'>';
                if(xtrArray[1].indexOf(':')>-1){
                    var xtrArrayIndices = xtrArray[1].split(':');
                    htmlString = htmlString.replace('>',Tango.mapping.selector[xtrArrayIndices[0]]+'>').replace('@'+xtrArrayIndices[0]+'@',xtrArrayIndices[1]);
                    if(xtrArrayIndices[0] === 'cl'){
                        selectorObj = '.'+xtrArrayIndices[1];
                    }else if(xtrArrayIndices[0] === 'id' ){
                        selectorObj = '#'+xtrArrayIndices[1];
                    }
                }
                base = selectorObj;
                $('#tango').append(htmlString);
            }
            $.each(obj,function(a,b){
                $(base).append(Tango.builders.buildHTMLelement(b,a));
            });
            Tango.events.bind();
        }
    },
    core:{
        init:function(){
            var tangoCode = $('tango');
            if(tangoCode !== undefined){
                $('tango').each(function(a,b){
                    var tangoAttr={};
                    $(this).each(function() {
                        $.each(this.attributes, function() {
                          if(this.specified) {
                               tangoAttr[[this.name]]=this.value;
                          }
                        });
                      });
                      tangoAttr.innerHTML=b.innerHTML;
                      Tango.core.processJSON(tangoAttr);
                });
            }else{
                console.warn('Tango didn\'t find any valid Tango code in the document');
            }
            Tango.builders.buildTangoCore(Tango.processed.outputHTML);
        },
        processJSON:function(obj){
            var extraParams = obj['innerHTML'];
            if(obj['data-src'] !== undefined && obj['data-src'] !== ''){
                $.ajax({
                url: obj['data-src'],
                cache: false
              }).done(function(dt) {
                    Tango.parsing.parseJSONnodes(dt,extraParams);
              });
            }
        },
        clear:function(){
            Tango.processed.outputHTML = '';
        }
    }
};