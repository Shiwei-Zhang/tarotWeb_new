/*
 * Released under BSD License
 * Copyright (c) 2014-2015 hizzgdev@163.com
 * 
 * Project Home:
 *   https://github.com/hizzgdev/jsmind/
 */

(function($w){
    'use strict';       
    // set 'jsMind' as the library name.
    // __name__ should be a const value, Never try to change it easily.
    var __name__ = 'jsMind';
    // library version
    var __version__ = '0.3';
    // author
    var __author__ = 'hizzgdev@163.com';

    // an noop function define
    var _noop = function(){};
    var logger = (typeof console === 'undefined')?{
            log:_noop, debug:_noop, error:_noop, warn:_noop, info:_noop
        }:console;

    // check global variables
    if(typeof $w[__name__] != 'undefined'){
        logger.log(__name__+' has been already exist.');
        return;
    }

    // shortcut of methods in dom
    var $d = $w.document;
    var $g = function(id){return $d.getElementById(id);};
    var $c = function(tag){return $d.createElement(tag);};
    var $t = function(n,t){if(n.hasChildNodes()){n.firstChild.nodeValue = t;}else{n.appendChild($d.createTextNode(t));}};
    var $h = function(n,t){
    	//防止debug和数据出口标识消失  modified by tyd
    	//n.innerHTML = t;
    	var eles = n.getElementsByTagName('*');
    	$(n).html($(eles));
    	var textnode=document.createTextNode(t);
    	n.appendChild(textnode);
    };

    var DEFAULT_OPTIONS = {
        container : '',   // id of the container
        editable : false, // you can change it in your options
        theme : null,
        mode :'full',     // full or side
        support_html : true,

        view:{
            hmargin:100,
            vmargin:50,
            line_width:2,
            line_color:'#555'
        },
        layout:{
            hspace:230,
            vspace:20,
            pspace:13
        },
        shortcut:{
            enable:true,
            handles:{
            },
            mapping:{
                addchild   : 45, // Insert
                addbrother : 13, // Enter
                editnode   : 113,// F2
                delnode    : 46, // Delete
                toggle     : 32, // Space
                left       : 37, // Left
                up         : 38, // Up
                right      : 39, // Right
                down       : 40, // Down
            }
        },
    };

    // core object
    var jm = function(options){
        jm.current = this;
        this.version = __version__;
        /*注解该部份代码，是为了防止view属性被覆盖。传入的options需要是完整的options对象   modified by tyd*/
        //var opts = {};
        //jm.util.json.merge(opts, DEFAULT_OPTIONS);
        //jm.util.json.merge(opts, options);
        //if(opts.container == null || opts.container.length == 0){
        //    logger.error('the options.container should not be empty.');
        //    return;
        //}
        this.options = options;
        this.inited = false;
        this.mind = null;
        this.event_handles = [];
        this.init();
        //删除快捷键识别是删除主树还是子树
        var deleteflag = true;
    };

    // ============= static object =============================================
    jm.direction = {left:-1,center:0,right:1};
    jm.event_type = {show:1,resize:2,edit:3,select:4};

    jm.node = function(sId,iIndex,sTopic,oData,bIsRoot,oParent,eDirection,bExpanded){
        if(!sId){logger.error('invalid nodeid');return;}
        if(typeof iIndex != 'number'){logger.error('invalid node index');return;}
        if(typeof bExpanded === 'undefined'){bExpanded = true;}
        this.id = sId;
        this.index = iIndex;
        this.topic = sTopic;
        this.data = oData;
        this.isroot = bIsRoot;
        this.parent = oParent;
        this.direction = eDirection;
        this.expanded = !!bExpanded;
        this.children = [];
        this._data = {};
    };

    jm.node.compare=function(node1,node2){
        // '-1' is alwary the last
        var r = 0;
        var i1 = node1.index;
        var i2 = node2.index;
        if(i1>=0 && i2>=0){
            r = i1-i2;
        }else if(i1==-1 && i2==-1){
            r = 0;
        }else if(i1==-1){
            r = 1;
        }else if(i2==-1){
            r = -1;
        }else{
            r = 0;
        }
        //logger.debug(i1+' <> '+i2+'  =  '+r);
        return r;
    };

    jm.node.inherited=function(pnode,node){
        if(!!pnode && !!node){
            if(pnode.id === node.id){
                return true;
            }
            if(pnode.isroot){
                return true;
            }
            var pid = pnode.id;
            var p = node;
            while(!p.isroot){
                p = p.parent;
                if(p.id === pid){
                    return true;
                }
            }
        }
        return false;
    };

    jm.node.prototype = {
        get_location:function(){
            var vd = this._data.view;
            return {
                x:vd.abs_x,
                y:vd.abs_y
            };
        },
        get_size:function(){
            var vd = this._data.view;
            return {
                w:vd.width,
                h:vd.height
            }
        }
    };


    jm.mind = function(){
        this.name = null;
        this.author = null;
        this.version = null;
        this.root = null;
        this.selected = null;
        this.nodes = {};
    };

    jm.mind.prototype = {
        get_node:function(nodeid){
            if(nodeid in this.nodes){
                return this.nodes[nodeid];
            }else{
                logger.warn('the node[id='+nodeid+'] can not be found');
                return null;
            }
        },

        set_root:function(nodeid, topic, data){
            if(this.root == null){
                this.root = new jm.node(nodeid, 0, topic, data, true);
                this._put_node(this.root);
            }else{
                logger.error('root node is already exist');
            }
        },

        add_node:function(parent_node, nodeid, topic, data, idx, direction, expanded){
        	//影响到磁铁的效果，所以定义方向都为左边,即-1
        	direction=jm.direction.left;
            if(typeof parent_node === 'string'){
                return this.add_node(this.get_node(parent_node), nodeid, topic, data, idx, direction, expanded);
            }
            var nodeindex = idx || -1;
            if(!!parent_node){
                //logger.debug(parent_node);
                var node = null;
                if(parent_node.isroot){
                    var d = jm.direction.right;
                    if(isNaN(direction)){
                        var children = parent_node.children;
                        var children_len = children.length;
                        var r = 0;
                        for(var i=0;i<children_len;i++){if(children[i].direction === jm.direction.left){r--;}else{r++;}}
                        d = (children_len > 1 && r > 0) ? jm.direction.left : jm.direction.right
                    }else{
                        d = (direction != jm.direction.left) ? jm.direction.right : jm.direction.left;
                    }
                    node = new jm.node(nodeid,nodeindex,topic,data,false,parent_node,d,expanded);
                }else{
                    node = new jm.node(nodeid,nodeindex,topic,data,false,parent_node,parent_node.direction,expanded);
                }
                if(this._put_node(node)){
                    parent_node.children.push(node);
                    this._reindex(parent_node);
                }else{
                    logger.error('fail, the nodeid \''+node.id+'\' has been already exist.');
                    node = null;
                }
                return node;
            }else{
                logger.error('fail, the [node_parent] can not be found.');
                return null;
            }
        },

        insert_node_before:function(node_before, nodeid, topic, data){
            if(typeof node_before === 'string'){
                return this.insert_node_before(this.get_node(node_before), nodeid, topic, data);
            }
            if(!!node_before){
                var node_index = node_before.index-0.5;
                return this.add_node(node_before.parent, nodeid, topic, data, node_index);
            }else{
                logger.error('fail, the [node_before] can not be found.');
                return null;
            }
        },

        get_node_before:function(node){
            if(!node){return null;}
            if(typeof node === 'string'){
                return this.get_node_before(this.get_node(node));
            }
            if(node.isroot){return null;}
            var idx = node.index - 2;
            if(idx >= 0){
                return node.parent.children[idx];
            }else{
                return null;
            }
        },

        insert_node_after:function(node_after, nodeid, topic, data){
            if(typeof node_after === 'string'){
                return this.insert_node_after(this.get_node(node_after), nodeid, topic, data);
            }
            if(!!node_after){
                var node_index = node_after.index + 0.5;
                return this.add_node(node_after.parent, nodeid, topic, data, node_index);
            }else{
                logger.error('fail, the [node_after] can not be found.');
                return null;
            }
        },

        get_node_after:function(node){
            if(!node){return null;}
            if(typeof node === 'string'){
                return this.get_node_after(this.get_node(node));
            }
            if(node.isroot){return null;}
            var idx = node.index;
            var brothers = node.parent.children;
            if(brothers.length >= idx){
                return node.parent.children[idx];
            }else{
                return null;
            }
        },

        move_node:function(node, beforeid, parentid, direction){
            if(typeof node === 'string'){
                return this.move_node(this.get_node(node), beforeid, parentid, direction);
            }
            if(!parentid){
                parentid = node.parent.id;
            }
            return this._move_node(node, beforeid, parentid, direction);
        },

        _flow_node_direction:function(node,direction){
            if(typeof direction === 'undefined'){
                direction = node.direction;
            }else{
                node.direction = direction;
            }
            var len = node.children.length;
            while(len--){
                this._flow_node_direction(node.children[len],direction);
            }
        },

        _move_node_internal:function(node, beforeid){
            if(!!node && !!beforeid){
                if(beforeid == '_last_'){
                    node.index = -1;
                    this._reindex(node.parent);
                }else if(beforeid == '_first_'){
                    node.index = 0;
                    this._reindex(node.parent);
                }else{
                    var node_before = (!!beforeid)?this.get_node(beforeid):null;
                    if(node_before!=null && node_before.parent!=null && node_before.parent.id==node.parent.id){
                        node.index = node_before.index - 0.5;
                        this._reindex(node.parent);
                    }
                }
            }
            return node;
        },

        _move_node:function(node, beforeid, parentid, direction){
            if(!!node && !!parentid){
                if(node.parent.id != parentid){
                    // remove from parent's children
                    var sibling = node.parent.children;
                    var si = sibling.length;
                    while(si--){
                        if(sibling[si].id == node.id){
                            sibling.splice(si,1);
                            break;
                        }
                    }
                    //add by tyd
                    this._reindex(node.parent);
                    node.parent = this.get_node(parentid);
                    node.parent.children.push(node);
                }

                if(node.parent.isroot){
                    if(direction == jsMind.direction.left){
                        node.direction = direction;
                    }else{
                        node.direction = jm.direction.right;
                    }
                }else{
                    node.direction = node.parent.direction;
                }
                this._move_node_internal(node, beforeid);
                this._flow_node_direction(node);
            }
            return node;
        },

        remove_node:function(node){
            if(typeof node === 'string'){
                return this.remove_node(this.get_node(node));
            }
            if(!node){
                logger.error('fail, the node can not be found');
                return false;
            }
            if(node.isroot){
                logger.error('fail, can not remove root node');
                return false;
            }
            if(this.selected!=null && this.selected.id == node.id){
                this.selected = null;
            }
            // clean all subordinate nodes
            var children = node.children;
            var ci = children.length;
            while(ci--){
                this.remove_node(children[ci]);
            }
            // clean all children
            children.length = 0;
            // remove from parent's children
            var sibling = node.parent.children;
            var si = sibling.length;
            while(si--){
                if(sibling[si].id == node.id){
                    sibling.splice(si,1);
                    break;
                }
            }
            // remove from global nodes
            delete this.nodes[node.id];
            // clean all properties
            for(var k in node){
                delete node[k];
            }
            // remove it's self
            node = null;
            //delete node;
            return true;
        },

        _put_node:function(node){
            if(node.id in this.nodes){
                logger.warn('the nodeid \''+node.id+'\' has been already exist.');
                return false;
            }else{
                this.nodes[node.id] = node;
                return true;
            }
        },

        _reindex:function(node){
            if(node instanceof jm.node){
                node.children.sort(jm.node.compare);
                for(var i=0;i<node.children.length;i++){
                    node.children[i].index = i+1;
                }
            }
        },
    };

    jm.format = {
        node_tree:{
            example:{
                "meta":{
                    "name":__name__,
                    "author":__author__,
                    "version":__version__
                },
                "format":"node_tree",
                "data":{"id":"root","topic":"jsMind Example"}
            },
            get_mind:function(source){
                var df = jm.format.node_tree;
                var mind = new jm.mind();
                mind.name = source.meta.name;
                mind.author = source.meta.author;
                mind.version = source.meta.version;
                df._parse(mind,source.data);
                return mind;
            },
            get_data:function(mind){
                var df = jm.format.node_tree;
                var json = {};
                json.meta = {
                    name : mind.name,
                    author : mind.author,
                    version : mind.version
                };
                json.format = 'node_tree';
                json.data = df._buildnode(mind.root);
                return json;
            },

            _parse:function(mind, node_root){
                var df = jm.format.node_tree;
                var data = df._extract_data(node_root);
                mind.set_root(node_root.id, node_root.topic, data);
                if('children' in node_root){
                    var children = node_root.children;
                    for(var i=0;i<children.length;i++){
                        df._extract_subnode(mind, mind.root, children[i]);
                    }
                }
            },

            _extract_data:function(node_json){
                var data = {};
                for(var k in node_json){
                    if(k == 'id' || k=='topic' || k=='children' || k=='direction' || k=='expanded'){
                        continue;
                    }
                    data[k] = node_json[k];
                }
                return data;
            },

            _extract_subnode:function(mind, node_parent, node_json){
                var df = jm.format.node_tree;
                var data = df._extract_data(node_json);
                var d = null;
                if(node_parent.isroot){
                    d = node_json.direction == 'left'?jm.direction.left:jm.direction.right;
                }
                var node = mind.add_node(node_parent, node_json.id, node_json.topic, data, null, d, node_json.expanded);
                if('children' in node_json){
                    var children = node_json.children;
                    for(var i=0;i<children.length;i++){
                        df._extract_subnode(mind, node, children[i]);
                    }
                }
            },

            _buildnode:function(node){
                var df = jm.format.node_tree;
                if(!(node instanceof jm.node)){return;}
                var o = {
                    id : node.id,
                    topic : node.topic,
                    expanded : node.expanded,
                    index : node.index
                };
                if(!!node.parent && node.parent.isroot){
                    o.direction = node.direction == jm.direction.left?'left':'right';
                }
                if(node.data != null){
                    var node_data = node.data;
                    for(var k in node_data){
                        o[k] = node_data[k];
                    }
                }
                var children = node.children;
                if(children.length > 0){
                    o.children = [];
                    for(var i=0;i<children.length;i++){
                        o.children.push(df._buildnode(children[i]));
                    }
                }
                return o;
            }
        },

        node_array:{
            example:{
                "meta":{
                    "name":__name__,
                    "author":__author__,
                    "version":__version__
                },
                "format":"node_array",
                "data":[
                    {"id":"root","topic":"Root", "isroot":true}
                ]
            },

            get_mind:function(source){
                var df = jm.format.node_array;
                var mind = new jm.mind();
                mind.name = source.meta.name;
                mind.author = source.meta.author;
                mind.version = source.meta.version;
                df._parse(mind,source.data);
                return mind;
            },

            get_data:function(mind){
                var df = jm.format.node_array;
                var json = {};
                json.meta = {
                    name : mind.name,
                    author : mind.author,
                    version : mind.version
                };
                json.format = 'node_array';
                json.data = [];
                df._array(mind,json.data);
                return json;
            },

            _parse:function(mind, node_array){
                var df = jm.format.node_array;
                var narray = node_array.slice(0);
                // reverse array for improving looping performance
                narray.reverse();
                var root_id = df._extract_root(mind, narray);
                if(!!root_id){
                    df._extract_subnode(mind, root_id, narray);
                }else{
                    logger.error('root node can not be found');
                }
            },

            _extract_root:function(mind, node_array){
                var df = jm.format.node_array;
                var i = node_array.length;
                while(i--){
                    if('isroot' in node_array[i] && node_array[i].isroot){
                        var root_json = node_array[i];
                        var data = df._extract_data(root_json);
                        mind.set_root(root_json.id,root_json.topic,data);
                        node_array.splice(i,1);
                        return root_json.id;
                    }
                }
                return null;
            },

            _extract_subnode:function(mind, parentid, node_array){
                var df = jm.format.node_array;
                var i = node_array.length;
                var node_json = null;
                var data = null;
                var extract_count = 0;
                while(i--){
                    node_json = node_array[i];
                    if(node_json.parentid == parentid){
                        data = df._extract_data(node_json);
                        var d = null;
                        var node_direction = node_json.direction;
                        if(!!node_direction){
                            d = node_direction == 'left'?jm.direction.left:jm.direction.right;
                        }
                        mind.add_node(parentid, node_json.id, node_json.topic, data, null, d, node_json.expanded);
                        node_array.splice(i,1);
                        extract_count ++;
                        var sub_extract_count = df._extract_subnode(mind, node_json.id, node_array);
                        if(sub_extract_count > 0){
                            // reset loop index after extract subordinate node
                            i = node_array.length;
                            extract_count += sub_extract_count;
                        }
                    }
                }
                return extract_count;
            },

            _extract_data:function(node_json){
                var data = {};
                for(var k in node_json){
                    if(k == 'id' || k=='topic' || k=='parentid' || k=='isroot' || k=='direction' || k=='expanded' || k=='index'){
                        continue;
                    }
                    data[k] = node_json[k];
                }
                return data;
            },

            _array:function(mind, node_array){
                var df = jm.format.node_array;
                df._array_node(mind.root, node_array);
            },

            _array_node:function(node, node_array){
                var df = jm.format.node_array;
                if(!(node instanceof jm.node)){return;}
                var o = {
                    id : node.id,
                    topic : node.topic,
                    expanded : node.expanded,
                    index : node.index
                };
                if(!!node.parent){
                    o.parentid = node.parent.id;
                }
                if(node.isroot){
                    o.isroot = true;
                }
                if(!!node.parent && node.parent.isroot){
                    o.direction = node.direction == jm.direction.left?'left':'right';
                }
                if(node.data != null){
                    var node_data = node.data;
                    for(var k in node_data){
                        o[k] = node_data[k];
                    }
                }
                node_array.push(o);
                var ci = node.children.length;
                for(var i=0;i<ci;i++){
                    df._array_node(node.children[i], node_array);
                }
            },
        },

        freemind:{
            example:{
                "meta":{
                    "name":__name__,
                    "author":__author__,
                    "version":__version__
                },
                "format":"freemind",
                "data":"<map version=\"1.0.1\"><node ID=\"root\" TEXT=\"freemind Example\"/></map>"
            },
            get_mind:function(source){
                var df = jm.format.freemind;
                var mind = new jm.mind();
                mind.name = source.meta.name;
                mind.author = source.meta.author;
                mind.version = source.meta.version;
                var xml = source.data;
                var xml_doc = df._parse_xml(xml);
                var xml_root = df._find_root(xml_doc);
                df._load_node(mind, null, xml_root);
                return mind;
            },

            get_data:function(mind){
                var df = jm.format.freemind;
                var json = {};
                json.meta = {
                    name : mind.name,
                    author : mind.author,
                    version : mind.version
                };
                json.format = 'freemind';
                var xmllines = [];
                xmllines.push('<map version=\"1.0.1\">');
                df._buildmap(mind.root, xmllines);
                xmllines.push('</map>');
                json.data = xmllines.join(' ');
                return json;
            },

            _parse_xml:function(xml){
                var xml_doc = null;
                if (window.DOMParser){
                    var parser = new DOMParser();
                    xml_doc = parser.parseFromString(xml,'text/xml');
                }else{ // Internet Explorer
                    xml_doc = new ActiveXObject('Microsoft.XMLDOM');
                    xml_doc.async = false;
                    xml_doc.loadXML(xml); 
                }
                return xml_doc;
            },

            _find_root:function(xml_doc){
                var nodes = xml_doc.childNodes;
                var node = null;
                var root = null;
                var n = null;
                for(var i=0;i<nodes.length;i++){
                    n = nodes[i];
                    if(n.nodeType == 1 && n.tagName == 'map'){
                        node = n;
                        break;
                    }
                }
                if(!!node){
                    var ns = node.childNodes;
                    node = null;
                    for(var i=0;i<ns.length;i++){
                        n = ns[i];
                        if(n.nodeType == 1 && n.tagName == 'node'){
                            node = n;
                            break;
                        }
                    }
                }
                return node;
            },

            _load_node:function(mind, parent_id, xml_node){
                var df = jm.format.freemind;
                var node_id = xml_node.getAttribute('ID');
                var node_topic = xml_node.getAttribute('TEXT');
                // look for richcontent
                if(node_topic == null){
                    var topic_children = xml_node.childNodes;
                    var topic_child = null;
                    for(var i=0;i<topic_children.length;i++){
                        topic_child = topic_children[i];
                        //logger.debug(topic_child.tagName);
                        if(topic_child.nodeType == 1 && topic_child.tagName === 'richcontent'){
                            node_topic = topic_child.textContent;
                            break;
                        }
                    }
                }
                var node_data = df._load_attributes(xml_node);
                var node_expanded = ('expanded' in node_data)?(node_data.expanded == 'true') : true;
                delete node_data.expanded;

                var node_position = xml_node.getAttribute('POSITION');
                var node_direction = null;
                if(!!node_position){
                    node_direction = node_position=='left'?jm.direction.left:jm.direction.right;
                }
                //logger.debug(node_position +':'+ node_direction);
                if(!!parent_id){
                    mind.add_node(parent_id, node_id, node_topic, node_data, null, node_direction, node_expanded);
                }else{
                    mind.set_root(node_id, node_topic, node_data);
                }
                var children = xml_node.childNodes;
                var child = null;
                for(var i=0;i<children.length;i++){
                    child = children[i];
                    if(child.nodeType == 1 && child.tagName == 'node'){
                        df._load_node(mind, node_id, child);
                    }
                }
            },

            _load_attributes:function(xml_node){
                var children = xml_node.childNodes;
                var attr = null;
                var attr_data = null;
                for(var i=0;i<children.length;i++){
                    attr = children[i];
                    if(attr.nodeType == 1 && attr.tagName === 'attribute'){
                        if(attr_data == null){
                            attr_data = {};
                        }
                        attr_data[attr.getAttribute('NAME')] = attr.getAttribute('VALUE');
                    }
                }
                return attr_data;
            },

            _buildmap:function(node, xmllines){
                var df = jm.format.freemind;
                var pos = null;
                if(!!node.parent && node.parent.isroot){
                    pos = node.direction === jm.direction.left?'left':'right';
                }
                xmllines.push('<node');
                xmllines.push('ID=\"'+node.id+'\"');
                if(!!pos){
                    xmllines.push('POSITION=\"'+pos+'\"');
                }
                xmllines.push('TEXT=\"'+node.topic+'\">');

                // store expanded status as an attribute
                xmllines.push('<attribute NAME=\"expanded\" VALUE=\"'+node.expanded+'\"/>');

                // for attributes
                var node_data = node.data;
                if(node_data != null){
                    for(var k in node_data){
                        xmllines.push('<attribute NAME=\"'+k+'\" VALUE=\"'+node_data[k]+'\"/>');
                    }
                }

                // for children
                var children = node.children;
                for(var i=0;i<children.length;i++){
                    df._buildmap(children[i], xmllines);
                }

                xmllines.push('</node>');
            },
        },
    };

    // ============= utility object =============================================

    jm.util = {
        ajax:{
            _xhr:function(){
                var xhr = null;
                if(window.XMLHttpRequest){
                    xhr = new XMLHttpRequest();
                }else{
                    try{
                        xhr = new ActiveXObject('Microsoft.XMLHTTP');
                    }catch(e){}
                }
                return xhr;
            },
            _eurl:function(url){
                return encodeURIComponent(url);
            },
            request:function(url,param,method,callback,fail_callback){
                var a = jm.util.ajax;
                var p = null;
                var tmp_param = [];
                for(k in param){
                    tmp_param.push(a._eurl(k)+'='+a._eurl(param[k]));
                }
                if(tmp_param.length>0){
                    p = tmp_param.join('&');
                }
                var xhr = a._xhr();
                if(!xhr){return;}
                xhr.onreadystatechange = function(){
                    if(xhr.readyState == 4){
                        if(xhr.status == 200 || xhr.status == 0){
                            if(typeof callback === 'function'){
                                var data = eval('('+xhr.responseText+')');
                                callback(data);
                            }
                        }else{
                            if(typeof fail_callback === 'function'){
                                fail_callback(xhr);
                            }else{
                                logger.error('xhr request failed.',xhr);
                            }
                        }
                    }
                }
                method = method || 'GET';
                xhr.open(method,url,true);
                xhr.setRequestHeader('If-Modified-Since','0');
                if(method == 'POST'){
                    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded;charset=utf-8');
                    xhr.send(p);
                }else{
                    xhr.send();
                }
            },
            get:function(url,callback){
                return jm.util.ajax.request(url,{},'GET',callback);
            },
            post:function(url,param,callback){
                return jm.util.ajax.request(url,param,'POST',callback);
            }
        },

        dom:{
            //target,eventType,handler
            add_event:function(t,e,h){
                if(!!t.addEventListener){
                    t.addEventListener(e,h,false);
                }else{
                    t.attachEvent('on'+e,h);
                }
            }
        },

        canvas:{
            bezierto: function(ctx,x1,y1,x2,y2){
                ctx.beginPath();
                ctx.moveTo(x1,y1);
                ctx.bezierCurveTo(x1+(x2-x1)*2/3,y1,x1,y2,x2,y2);
                ctx.stroke();
            },
            lineto : function(ctx,x1,y1,x2,y2){
                ctx.beginPath();
                ctx.moveTo(x1,y1);
                ctx.lineTo(x2,y2);
                ctx.stroke();
            },
            clear:function(ctx,x,y,w,h){
                ctx.clearRect(x,y,w,h);
            }
        },

        file:{
            read:function(file_data,fn_callback){
                var reader = new FileReader();
                reader.onload = function(){
                    if(typeof fn_callback === 'function'){
                        fn_callback(this.result, file_data.name);
                    }
                };
                reader.readAsText(file_data);
            },

            save:function(file_data, type, name) {
                var blob;
                if (typeof $w.Blob === 'function') {
                    blob = new Blob([file_data], {type: type});
                } else {
                    var BlobBuilder = $w.BlobBuilder || $w.MozBlobBuilder || $w.WebKitBlobBuilder || $w.MSBlobBuilder;
                    var bb = new BlobBuilder();
                    bb.append(file_data);
                    blob = bb.getBlob(type);
                }
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(blob, name);
                } else {
                    var URL = $w.URL || $w.webkitURL;
                    var bloburl = URL.createObjectURL(blob);
                    var anchor = $c('a');
                    if ('download' in anchor) {
                        anchor.style.visibility = 'hidden';
                        anchor.href = bloburl;
                        anchor.download = name;
                        $d.body.appendChild(anchor);
                        var evt = $d.createEvent('MouseEvents');
                        evt.initEvent('click', true, true);
                        anchor.dispatchEvent(evt);
                        $d.body.removeChild(anchor);
                    } else {
                        location.href = bloburl;
                    }
                }
            }
        },

        json:{
            json2string:function(json){
                if(!!JSON){
                    try{
                        var json_str = JSON.stringify(json);
                        return json_str;
                    }catch(e){
                        logger.warn(e);
                        logger.warn('can not convert to string');
                        return null;
                    }
                }
            },
            string2json:function(json_str){
                if(!!JSON){
                    try{
                        var json = JSON.parse(json_str);
                        return json;
                    }catch(e){
                        logger.warn(e);
                        logger.warn('can not parse to json');
                        return null;
                    }
                }
            },
            merge:function(b,a){
                for(var o in a){
                    if(o in b){
                        if(typeof b[o] === 'object' &&
                            Object.prototype.toString.call(b[o]).toLowerCase() == '[object object]' &&
                            !b[o].length){
                            jm.util.json.merge(b[o], a[o]);
                        }else{
                            b[o] = a[o];
                        }
                    }else{
                        b[o] = a[o];
                    }
                }
                return b;
            }
        },

        uuid:{
            newid:function(){
                return (new Date().getTime().toString(16)+Math.random().toString(16).substr(2)).substr(2,16);
            }
        },

        text:{
            is_empty:function(s){
                if(!s){return true;}
                return s.replace(/\s*/,'').length == 0;
            }
        }
    };

    jm.prototype={
        init : function(){
            if(this.inited){return;}
            this.inited = true;

            var opts = this.options;
            var opts_layout = {
                mode:opts.mode,
                hspace:opts.layout.hspace,
                vspace:opts.layout.vspace,
                pspace:opts.layout.pspace
            }
            var opts_view = {
                container:opts.container,
                support_html:opts.support_html,
                hmargin:opts.view.hmargin,
                vmargin:opts.view.vmargin,
                line_width:opts.view.line_width,
                line_color:opts.view.line_color
            };
            // create instance of function provider 
            this.data = new jm.data_provider(this);
            this.layout = new jm.layout_provider(this, opts_layout);
            this.view = new jm.view_provider(this, opts_view);
            this.shortcut = new jm.shortcut_provider(this, opts.shortcut);

            this.data.init();
            this.layout.init();
            this.view.init();
            this.shortcut.init();

            this._event_bind();

            jm.init_plugins(this);
        },

        enable_edit:function(){
            this.options.editable = true;
        },

        disable_edit:function(){
            this.options.editable = false;
        },

        get_editable:function(){
            return this.options.editable;
        },

        set_theme:function(theme){
            var theme_old = this.options.theme;
            this.options.theme = (!!theme) ? theme : null;
            if(theme_old != this.options.theme){
                this.view.reset_theme();
            }
        },
        _event_bind:function(){
            this.view.add_event(this,'mousedown',this.mousedown_handle);
            this.view.add_event(this,'click',this.click_handle);
            this.view.add_event(this,'dblclick',this.dblclick_handle);
            this.view.add_event(this,'contextmenu',this.contextmenu_handle);
        },
        contextmenu_handle:function(e){
        	e.preventDefault();
        },
        mousedown_handle:function(e){
            var element = e.target || event.srcElement;
            var isnode = this.view.is_node(element);
            if(isnode){
            	var nodeid = this.view.get_nodeid(element);
            	//不知道为什么，点击jmnode时不会隐藏，所以强制隐藏
            	$('#showTip_jsmind_container').css('visibility','hidden');
            	$('#showTip_jsmind_container2').css('visibility','hidden');
            	$('#showTip_jsmind_container2_2').css('visibility','hidden');
            	if(e.button=="0"){
                    this.select_node(nodeid);
            	}else if(e.button=="2"){
            		if(!this.get_editable()){return;}
        			var jd = this;
        			var jqueryDom;
        			var container = this.options.container;
        			if(container=="jsmind_container"){
        				jqueryDom = $('#showTip_'+container+'');
        			}else{
        				jqueryDom = $('#showTip_'+container+'_2');
        			}
            		jqueryDom.attr('nodeid',nodeid);
            		jqueryDom.css('top',element.offsetTop+element.clientHeight);
            		jqueryDom.css('left',element.offsetLeft);
            		jqueryDom.css('visibility','visible');
            		jqueryDom.find('p').unbind('click').click(function(){
            			var actionType = $(this).attr('actionType');
            			$(this).parent().css('visibility','hidden');
            			var nodeid = $(this).parent().attr('nodeid');
            			if(actionType==1){
            				if($($('jmnode[nodeid="'+nodeid+'"]').find('div')[0]).css('visibility')=='visible'){
            					$($($('jmnode[nodeid="'+nodeid+'"]')[0]).find('div')[0]).css('visibility','hidden');
            					jd.get_node(nodeid).data.isDebug = 0;
            				}else{
            					$($('jmnode[nodeid="'+nodeid+'"]').find('div')[0]).css('visibility','visible');
            					jd.get_node(nodeid).data.isDebug = 1;
            				}
            			}else if(actionType==2){
            				if($($('jmnode[nodeid="'+nodeid+'"]').find('div')[1]).css('visibility')=='visible'){
            					$($('jmnode[nodeid="'+nodeid+'"]').find('div')[1]).css('visibility','hidden');
            					jd.get_node(nodeid).data.isCheck = 0;
            				}else{
            					$($('jmnode[nodeid="'+nodeid+'"]').find('div')[1]).css('visibility','visible');
            					jd.get_node(nodeid).data.isCheck = 1;
            				}
            			}else if(actionType==3){
            				if($($('jmnode[nodeid="'+nodeid+'"]').find('div')[2]).css('visibility')=='visible'){
            					$($('jmnode[nodeid="'+nodeid+'"]').find('div')[2]).css('visibility','hidden');
            					jd.get_node(nodeid).data.isInterface = 0;
            				}else{
            					$($('jmnode[nodeid="'+nodeid+'"]').find('div')[2]).css('visibility','visible');
            					jd.get_node(nodeid).data.isInterface = 1;
            				}
            			}else if(actionType==4){
            				var node = jd.get_node(nodeid);
            				var parent = node.parent;
            				var parentid = parent.id;
            				var children = node.children;
            				var children_ids = new Array();
            				$.each(children,function(index,item){
            					children_ids.push(item.id);
            				});
            				$.each(children_ids,function(index,item){
            					jd.move_node(item, nodeid, parentid, "-1");
            				});
            				jd.select_node(nodeid);
            				jd.remove_node(node);
            			}else if(actionType==5){
            				var node = jd.get_node(nodeid);
            				jd.remove_node(node);
            			}
            		});
            		$('body').unbind('mousedown').mousedown(function(e){
            			if(container=="jsmind_container"){
            				if(element !=e.target&&e.target.parentNode.getAttribute('id')!="showTip_jsmind_container"){
                	    		$('#showTip_jsmind_container').css('visibility','hidden');
                	    	}
            			}else{
            				if(element !=e.target&&e.target.parentNode.getAttribute('id')!="showTip_jsmind_container2_2"){
                	    		$('#showTip_jsmind_container2_2').css('visibility','hidden');
                	    	}
            			}
            	    });
            	}
            }else{
                //this.select_clear();
            }
        },

        click_handle:function(e){
            var element = e.target || event.srcElement;
            var isexpander = this.view.is_expander(element);
            if(isexpander){
                var nodeid = this.view.get_nodeid(element);
                this.toggle_node(nodeid);
            }
            var isexpanderp = this.view.is_expanderp(element);
			if(isexpanderp){
				var nodeid = this.view.get_nodeid(element);
				this.add_node_p(nodeid,element);
            }
        },

        dblclick_handle:function(e){
            if(this.get_editable()){
                var element = e.target || event.srcElement;
                var isnode = this.view.is_node(element);
                if(isnode){
                    var nodeid = this.view.get_nodeid(element);
                    this.begin_edit(nodeid);
                }
            }
        },

        begin_edit:function(node){
            if(typeof node === 'string'){
                return this.begin_edit(this.get_node(node));
            }
            if(this.get_editable()){
                if(!!node){
                    this.view.edit_node_begin(node);
                }else{
                    logger.error('the node can not be found');
                }
            }else{
                logger.error('fail, this mind map is not editable.');
                return;
            }
        },

        end_edit:function(){
            this.view.edit_node_end();
        },

        toggle_node:function(node){
            if(typeof node === 'string'){
                return this.toggle_node(this.get_node(node));
            }
            if(!!node){
                if(node.isroot){return;}
                this.layout.toggle_node(node);
                this.view.relayout();
            }else{
                logger.error('the node can not be found.');
            }
        },
        //先添加父节点，再把选中节点移到父节点上
        add_node_p:function(nodeid,element){
        	var jm = this;
        	var selected_node = this.get_node(nodeid); 
        	if(!this.get_editable()){return;}
        	if(this.options.container=="jsmind_container"){
        		var newnodeid = jsMind.util.uuid.newid();
                var topic = 'logic_node'+logic_node_num;
                var line_color = this.options.view.line_color;
                var pk = jsMind.util.uuid.newid();
                var index = selected_node.index;
        		var level = 1;
        		var source_type = 0;
        		var sourceids = new Array();
        		var data = jm.construct_data(null,null,null,null,null,null,level,topic,line_color,sourceids,pk,flowId_global,null,source_type);
            	var node = jm.add_node(selected_node.parent, newnodeid, topic,data,index);
            	logic_node_num++;
            	//把选中节点移到父节点上
            	jm.move_node(selected_node.id, "_last_", node.id, "-1");
            	jm.select_node(newnodeid);
        	}else{
        		this.add_node_p_2(selected_node,element);
        	}
        },
        add_node_p_2:function(selected_node,element){
        	var jd = this;
    		var jqueryDom = $('#showTip_'+this.options.container+'');
    		jqueryDom.css('top',element.offsetTop+element.clientHeight);
    		jqueryDom.css('left',element.offsetLeft);
    		jqueryDom.find('p').show();
    		jqueryDom.css('visibility','visible');
    		jqueryDom.find('p[paramNumber="0"]').hide();
    		var columnType = selected_node.data.columnType;
    		$.each(jqueryDom.find('p'),function(index,item){
    			var paramDataType = $(this).attr('firstType');
    			if(columnType!=paramDataType){
            		var newArray = $.grep( conversionRules_global, function(n,i){
                		return n.theType==columnType&&n.depType==paramDataType&&n.type==1;
         			});
                	if(newArray.length==0){
                		$(this).hide();
                	}
            	}
    		});
    		$('body').unbind('mousedown').mousedown(function(e){
    	    	if(e.target.parentNode.getAttribute('id')!="showTip_jsmind_container2"&&e.target.getAttribute('id')!="showTip_jsmind_container2"){
    	    		jqueryDom.css('visibility','hidden');
    	    	}
    	    });
    		var newnodeid = jsMind.util.uuid.newid();
			var line_color = this.options.view.line_color;
    		$('#showTip_'+this.options.container+' p').unbind('click').click(function(){
    			jqueryDom.css('visibility','hidden');
    			var level = $(this).attr('level');
    			var topic = $(this).attr('textValue');
    			var functionName = $(this).attr('functionName');
    			var functionType = $(this).attr('functionType');
    			var paramNumber = $(this).attr('paramNumber');
    			var columnType = $(this).attr('columnType');
    			var fixed = $(this).attr('fixed');
    			var fk = 0;
    			var data = jd.construct_data(functionName,functionType,columnType,paramNumber,fixed,fk,level,topic,line_color);
            	var node = jd.add_node(selected_node.parent, newnodeid, topic,data,selected_node.index);
            	//把选中节点移到父节点上
            	jd.move_node(selected_node.id, "_last_", node.id, "-1");
            	jd.check_subnode(node);
            	jd.check_subnode_(node);
            	jd.check_subnode_alias();
            	jd.select_node(newnodeid);
    		});
        },
        expand_node:function(node){
            if(typeof node === 'string'){
                return this.expand_node(this.get_node(node));
            }
            if(!!node){
                if(node.isroot){return;}
                this.layout.expand_node(node);
                this.view.relayout();
            }else{
                logger.error('the node can not be found.');
            }
        },

        collapse_node:function(node){
            if(typeof node === 'string'){
                return this.collapse_node(this.get_node(node));
            }
            if(!!node){
                if(node.isroot){return;}
                this.layout.collapse_node(node);
                this.view.relayout();
            }else{
                logger.error('the node can not be found.');
            }
        },

        expand_all:function(){
            this.layout.expand_all();
            this.view.relayout();
        },

        expand_to_depth:function(depth){
            this.layout.expand_to_depth(depth);
            this.view.relayout();
        },

        _reset:function(){
            this.view.reset();
            this.layout.reset();
            this.data.reset();
        },

        _show:function(mind){
            var m = mind || jm.format.node_array.example;

            this.mind = this.data.load(m);
            if(!this.mind){
                logger.error('data.load error');
                return;
            }else{
                logger.debug('data.load ok');
            }

            this.view.load();
            logger.debug('view.load ok');

            this.layout.layout();
            logger.debug('layout.layout ok');

            this.view.show(true);
            logger.debug('view.show ok');

            this.invoke_event_handle(jm.event_type.show,{data:[mind]});
        },

        show : function(mind){
            this._reset();
            this._show(mind);
        },

        get_meta: function(){
            return {
                name : this.mind.name,
                author : this.mind.author,
                version : this.mind.version
            };
        },

        get_data: function(data_format){			
            var df = data_format || 'node_tree';
            return this.data.get_data(df);
        },

        get_root:function(){
            return this.mind.root;
        },

        get_node:function(nodeid){
            return this.mind.get_node(nodeid);
        },

        add_node:function(parent_node, nodeid, topic, data,idx){	
            if(this.get_editable()){
                var node = this.mind.add_node(parent_node, nodeid, topic, data,idx);
                if(!!node){
                    this.view.add_node(node);
                    this.layout.layout();
                    this.view.show(false);
                    this.expand_node(parent_node);
                    this.invoke_event_handle(jm.event_type.edit,{evt:'add_node',data:[parent_node.id,nodeid,topic,data],node:nodeid});
                }
                return node;
            }else{
                logger.error('fail, this mind map is not editable');
                return null;
            }
        },

        insert_node_before:function(node_before, nodeid, topic, data){
            if(this.get_editable()){
                var beforeid = (typeof node_before === 'string') ? node_before : node_before.id;
                var node = this.mind.insert_node_before(node_before, nodeid, topic, data);
                if(!!node){
                    this.view.add_node(node);
                    this.layout.layout();
                    this.view.show(false);
                    this.invoke_event_handle(jm.event_type.edit,{evt:'insert_node_before',data:[beforeid,nodeid,topic,data],node:nodeid});
                }
                return node;
            }else{
                logger.error('fail, this mind map is not editable');
                return null;
            }
        },

        insert_node_after:function(node_after, nodeid, topic, data){
            if(this.get_editable()){
                var node = this.mind.insert_node_after(node_after, nodeid, topic, data);
                if(!!node){
                    this.view.add_node(node);
                    this.layout.layout();
                    this.view.show(false);
                    this.invoke_event_handle(jm.event_type.edit,{evt:'insert_node_after',data:[node_after.id,nodeid,topic,data],node:nodeid});
                }
                return node;
            }else{
                logger.error('fail, this mind map is not editable');
                return null;
            }
        },

        remove_node:function(node){
            if(typeof node === 'string'){
                return this.remove_node(this.get_node(node));
            }
            if(this.get_editable()){
                if(!!node){
                    if(node.isroot){
                        logger.error('fail, can not remove root node');
                        return false;
                    }
                    var nodeid = node.id;
                    var sparent = node.parent;
                    var parentid = sparent.id;
                    var container = this.options.container;
                    /* 以下是删除node的逻辑代码  by tyd*/
                    if(container=="jsmind_container"){
                    	//循环删除父节点的transentity
                    	this.loop_remove_node(sparent,node);
                    	//循环删除map信息
                    	this.loop_remove_map(node);
                    	this.splice_sourceids(sparent,node);
                    	this.pop_joinObj(sparent);
                    }else{
                    	var parentnode = _jm1.get_selected_node().parent;
                    	if(node.parent.isroot){
                    		this.delete_transentity(parentnode,node.id);
                        	this.delete_params(parentnode,node.id);
                        	this.delete_params_join(parentnode,node.id);
                    	}
                    	if(node.data.functionType==9){
                    		this.delete_udfInfo(node.id);
                    	}
                    }
                    this.view.remove_node(node);
                    this.mind.remove_node(node);
                    //add by tyd
                    if(container=="jsmind_container"){
                    	clear_panel_node();
                    }else{
                    	hide_column_constant_predict();
                    	this.check_subnode(sparent);
                    	if(sparent.isroot){
                    		this.check_subnode_alias();
                    	}
                    }
                    this.mind._reindex(sparent);
                    this.layout.layout();
                    this.view.show(false);
                    this.invoke_event_handle(jm.event_type.edit,{evt:'remove_node',data:[nodeid],node:parentid});
                }else{
                    logger.error('fail, node can not be found');
                    return false;
                }
            }else{
                logger.error('fail, this mind map is not editable');
                return;
            }
        },

        update_node:function(nodeid, topic){
            if(this.get_editable()){
                if(jm.util.text.is_empty(topic)){
                    logger.warn('fail, topic can not be empty');
                    return;
                }
                var node = this.get_node(nodeid);
                if(!!node){
                    if(node.topic === topic){
                        logger.info('nothing changed');
                        this.view.update_node(node);
                        return;
                    }
                    node.topic = topic;
                    this.view.update_node(node);
                    this.layout.layout();
                    this.view.show(false);
                    this.invoke_event_handle(jm.event_type.edit,{evt:'update_node',data:[nodeid,topic],node:nodeid});
                }
            }else{
                logger.error('fail, this mind map is not editable');
                return;
            }
        },

        move_node:function(nodeid, beforeid, parentid, direction){
            if(this.get_editable()){
            	/*added by tyd */
            	var sparent = this.get_node(nodeid).parent;
            	var sparentid = sparent.id;
            	/*added by tyd end*/
                var node = this.mind.move_node(nodeid,beforeid,parentid,direction);
                if(!!node){
                	/*added by tyd */
                	if(node.data.level==1||node.data.level==2){
	                	if(sparentid!=parentid){
	                		//循环删除transentity
	                		this.loop_remove_node(sparent,node);
	            			this.splice_sourceids(sparent,node);
	            			this.pop_joinObj(sparent);
	            			//新的parent上的操作
	            			var parentnode = this.get_node(parentid);
	                		this.push_sourceids(parentnode,node);
	                		this.push_joinObj(parentnode,node);
	                	}
                	}else{
                		if(sparentid!=parentid&&sparent.isroot){
                			var parentnode = _jm1.get_selected_node().parent;
                			this.delete_transentity(parentnode,nodeid);
                			this.delete_params(parentnode,nodeid);
                			this.delete_params_join(parentnode,nodeid);
                		}
                	}
                	/*added by tyd end*/
                    this.view.update_node(node);
                    this.layout.layout();
                    this.view.show(false);
                    this.invoke_event_handle(jm.event_type.edit,{evt:'move_node',data:[nodeid,beforeid,parentid,direction],node:nodeid});
                }
            }else{
                logger.error('fail, this mind map is not editable');
                return;
            }
        },

        select_node:function(node){
    		if(typeof node === 'string'){
                return this.select_node(this.get_node(node));
            }
            if(!this.layout.is_visible(node)){
                return;
            }
            this.mind.selected = node;
            if(!!node){
                this.view.select_node(node);
            }
        },

        get_selected_node:function(){
            if(!!this.mind){
                return this.mind.selected;
            }else{
                return null;
            }
        },

        select_clear:function(){
            if(!!this.mind){
                this.mind.selected = null;
                this.view.select_clear();
            }
        },
		
        is_node_visible:function(node){
            return this.layout.is_visible(node);
        },

        find_node_before:function(node){
            if(typeof node === 'string'){
                return this.find_node_before(this.get_node(node));
            }
            if(!node || node.isroot){return null;}
            var n = null;
            if(node.parent.isroot){
                var c = node.parent.children;
                var prev = null;
                var ni = null;
                for(var i=0;i<c.length;i++){
                    ni = c[i];
                    if(node.direction === ni.direction){
                        if(node.id === ni.id){
                            n = prev;
                        }
                        prev = ni;
                    }
                }
            }else{
                n = this.mind.get_node_before(node);
            }
            return n;
        },

        find_node_after:function(node){
            if(typeof node === 'string'){
                return this.find_node_after(this.get_node(node));
            }
            if(!node || node.isroot){return null;}
            var n = null;
            if(node.parent.isroot){
                var c = node.parent.children;
                var getthis = false;
                var ni = null;
                for(var i=0;i<c.length;i++){
                    ni = c[i];
                    if(node.direction === ni.direction){
                        if(getthis){
                            n = ni;
                            break;
                        }
                        if(node.id === ni.id){
                            getthis = true;
                        }
                    }
                }
            }else{
                n = this.mind.get_node_after(node);
            }
            return n;
        },

        resize:function(){
            this.view.resize();
        },

        // callback(type ,data)
        add_event_listener:function(callback){
            if(typeof callback === 'function'){
                this.event_handles.push(callback);
            }
        },

        invoke_event_handle:function(type, data){
            var j = this;
            $w.setTimeout(function(){
                j._invoke_event_handle(type,data);
            },0);
        },

        _invoke_event_handle:function(type,data){
            var l = this.event_handles.length;
            for(var i=0;i<l;i++){
                this.event_handles[i](type,data);
            }
        },

        /*add by tyd start*/
        check_node_alias:function(){
        	var dataArray = this.data.get_data('node_array').data;
        	var nodes = this.mind.nodes;
        	var node = null;
        	var jd = this;
        	$.each(dataArray,function(index,item){
        		if(!item.isroot){
        			//空值
    				if(!item.topic){
    					item.content = "1"+item.content.substring(1);
    				}else{
    					item.content = "0"+item.content.substring(1);
    				}
    				//特殊字符
    				if(specialSymbols.test(item.topic)||chineseValidation.test(item.topic)){
    					item.content = item.content.substring(0,1)+"1"+item.content.substring(2);
    				}else{
    					item.content = item.content.substring(0,1)+"0"+item.content.substring(2);
    				}
    				//重名
    				$.each(dataArray,function(i,element){
    					if(item.id!=element.id){
    						if(item.topic==element.topic){
    							item.content = item.content.substring(0,2)+"1"+item.content.substring(3);
        						return false;
        					}else{
        						item.content = item.content.substring(0,2)+"0"+item.content.substring(3);
        					}
    					}
    				});
    				jd.change_color(item);
        		}
        	});
        },
        check_node_:function(node){
        	var pk = node.pk;
        	var dataArray = subtreeMap.get(pk).data;
        	$.each(dataArray,function(index,item){
        		if(item.border_color == error_color){
        			node.data.content = node.data.content.substring(0,3)+"0"+node.data.content.substring(4);
        			return;
        		}
        	});
        	node.data.content = node.data.content.substring(0,3)+"1"+node.data.content.substring(4);
        	this.change_color(node);
        },
        check_node:function(node){
        	var children = node.children;
        	if(children.length>0){
        		node.data.content = node.data.content.substring(0,4)+"0"+node.data.content.substring(5);
        	}else{
        		node.data.content = node.data.content.substring(0,4)+"1"+node.data.content.substring(5);
        	}
        },
        check_subnode_alias:function(){
        	var root = this.get_root();
			var exports = root.children;
        	var nodes = this.mind.nodes;
        	var node = null;
        	for(var nodeid in nodes){
        		node = nodes[nodeid];
        		if(!node.isroot){
        			if(node.parent.isroot){
        				//空值
        				if(!node.topic){
        					node.data.content = "1"+node.data.content.substring(1);
        				}else{
        					node.data.content = "0"+node.data.content.substring(1);
        				}
        				//特殊字符
        				if(specialSymbols.test(node.topic)||chineseValidation.test(node.topic)){
        					node.data.content = node.data.content.substring(0,1)+"1"+node.data.content.substring(2);
        				}else{
        					node.data.content = node.data.content.substring(0,1)+"0"+node.data.content.substring(2);
        				}
        				//重名
        				$.each(exports,function(i,element){
        					if(node.id!=element.id){
        						if(node.topic==element.topic){
        							node.data.content = node.data.content.substring(0,2)+"1"+node.data.content.substring(3);
            						return false;
            					}else{
            						node.data.content = node.data.content.substring(0,2)+"0"+node.data.content.substring(3);
            					}
        					}
        				});
        			}else{
        				node.data.content = "000"+node.data.content.substring(3);
        			}
        			this.change_color(node);
        		}
        	}
        },
        check_subnode_:function(selected_node){
        	if(!selected_node.isroot){
        		//常量空值
        		if(selected_node.data.functionType==2){
        			if(selected_node.data.constantValue){
        				selected_node.data.content = selected_node.data.content.substring(0,3)+"0"+selected_node.data.content.substring(4);
        			}else{
        				selected_node.data.content = selected_node.data.content.substring(0,3)+"1"+selected_node.data.content.substring(4);
        			}
        		}
        		//数据挖掘
        		if(selected_node.data.functionType==9){
        			var udfInfosMap_min = udfInfosMap.get(flowId_global);
        			if(udfInfosMap_min){
        				var udfInfo = udfInfosMap_min.get(selected_node.id);
            			if(!udfInfo||!udfInfo.path||!udfInfo.type){
            				selected_node.data.content = selected_node.data.content.substring(0,4)+"1"+selected_node.data.content.substring(5);
            			}else{
            				selected_node.data.content = selected_node.data.content.substring(0,4)+"0"+selected_node.data.content.substring(5);
            			}
        			}else{
        				selected_node.data.content = selected_node.data.content.substring(0,4)+"1"+selected_node.data.content.substring(5);
        			}
        		}
        		this.change_color(selected_node);
        	}
        },
        //校验subtree
        check_subnode:function(parentNode){
        	if(!parentNode.isroot){
        		var nodeid = parentNode.id;
            	var children = parentNode.children;
            	var line_color = this.options.view.line_color;
            	var fixed = parentNode.data.fixed;
            	var paramNumber = parentNode.data.paramNumber;
            	var functionType = parentNode.data.functionType;
            	var $element = $('jmnode[nodeid="'+nodeid+'"]');
            	if(fixed==1&&children.length!=paramNumber&&functionType!=2){
            		parentNode.data.content = parentNode.data.content.substring(0,5)+"1"+parentNode.data.content.substring(6);
            	}else if(fixed==0&&children.length<paramNumber-1){
            		parentNode.data.content = parentNode.data.content.substring(0,5)+"1"+parentNode.data.content.substring(6);
            	}else{
            		parentNode.data.content = parentNode.data.content.substring(0,5)+"0"+parentNode.data.content.substring(6);
            	}
            	var functionName = parentNode.data.functionName;
                var parameters = functionsMap.get(functionName);
                var columnType;
                var paramDataType;
            	$.each(children,function(index,item){
            		columnType = item.data.columnType;
            		if(fixed==0&&index>=paramNumber-1){
            			paramDataType = parameters[paramNumber-1].paramDataType;
            		}else{
            			paramDataType = parameters[index].paramDataType;
            		}
            		if(columnType!=paramDataType){
                		var newArray = $.grep( conversionRules_global, function(n,i){
                    		return n.theType==columnType&&n.depType==paramDataType&&n.type==1;
             			});
                    	if(newArray.length==0){
                    		item.data.line_color = error_color;
                    		parentNode.data.content = parentNode.data.content.substring(0,6)+"1";
                    	}else{
                    		item.data.line_color = line_color;
                    		parentNode.data.content = parentNode.data.content.substring(0,6)+"0";
                    	}
                	}else{
                		item.data.line_color = line_color;
                		parentNode.data.content = parentNode.data.content.substring(0,6)+"0";
                	}
            	});
            	this.view.show_lines();
            	this.change_color(parentNode);
        	}
        },
        change_color:function(node){
        	//传进来的有可能是node，也有可能是dataNode
        	var data = node.data||node;
        	var content = data.content;
        	var nodeid = node.id||data.id;
        	var $element = $('jmnode[nodeid="'+nodeid+'"]');
        	var line_color = this.options.view.line_color;
        	if(content=="0000000"){
        		data.border_color = line_color;
        		$element.css('border-color',line_color);
        	}else{
        		data.border_color = error_color;
        		$element.css('border-color',error_color);
        	}
        },
        //创建data
        construct_data:function(functionName,functionType,columnType,paramNumber,fixed,fk,level,source_name,line_color,sourceids,pk,flowid,source_id,source_type){
        	var data;
        	if(this.options.container=='jsmind_container'){
        		data = {"content":"","genid":0,"sourceids":sourceids,"level":level,"pk":pk,"line_color":line_color,"border_color":line_color,"source_name":source_name,"flowid":flowid,"sourceid":source_id,"sourceType":source_type,"isSave":0,"isInterface":0,"isDebug":0,"isCheck":0,"sql":"","subMind":"","params":"","joins":"","saveTargets":"","exportColumns":""};
        	}else{
        		data = {"content":"0000000","same_array":"","genid":0,"fk":fk,"level":level,"source_name":source_name,"line_color":line_color,"border_color":line_color,"constantValue":"","functionName":functionName,"functionType":functionType,"columnType":columnType,"paramNumber":paramNumber,"fixed":fixed};
        	}
        	return data;
        },
        //删除一个节点时，需要循环删除父节点的transentity和params
        loop_remove_node:function(parentnode,node){
        	var jd = this;
        	var pk = node.data.pk;
        	var dataArray = subtreeMap.get(pk).data;
        	$.grep( dataArray, function(n,i){
				   if(n.parentid==pk){
					   //循环
					   jd.delete_transentity(parentnode,n.id);
					   jd.delete_params(parentnode,n.id);
					   jd.delete_params_join(parentnode,n.id);
				   }
				   return null;
			});
        },
        //循环删除节点及节点以下的所有节点的map信息和udfinfos
        loop_remove_map:function(node){
    		var jd = this;
    		var pk = node.data.pk;
    		var dataArray = subtreeMap.get(pk).data;
    		$.grep( dataArray, function(n,i){
				   if(n.functionType==9){
					   jd.delete_udfInfo(n.id);
	           	   }
				   return null;
			});
    		paramsMap.remove(pk);
    		joinsMap.remove(pk);
        	subtreeMap.remove(pk);
        	targetsMap.remove(pk);
    		var children = node.children;
        	$.each(children,function(index, item){
        		jd.loop_remove_map(item);
        	});
    	},
        //在父节点追加sourceids
        push_sourceids:function(parentnode,node){
        	if(!parentnode.isroot){
        		parentnode.data.sourceids.push(node.data.pk);
        	}
        },
        //在父节点删除sourceids中某个元素
        splice_sourceids:function(parentnode,node){
        	if(!parentnode.isroot){
        		parentnode.data.sourceids.splice($.inArray(node.data.pk,parentnode.data.sourceids),1); 
        	}
        },
        push_joinObj:function(parentnode){
        	if(!parentnode.isroot){
        		var obj = new Object();
        		obj.tableA;
        		obj.joinType;
        		obj.tableB;
        		var onList = new Array();
        		obj.onList = onList;
        		joinsMap.get(parentnode.data.pk).push(obj);
        		//如果parentnode正好是当前选中节点，那么需要追加该div，因为切换选中节点时，会保存当前节点，如果当前的joins页面不追加，那么就会把joins的个数改回去
        		if(parentnode == this.get_selected_node()){
        			var dom =
        	            $(
        	                '<div class="related_table"> <div class="tables">' +
        	                '<span><select class="tableA"></select></span>' +
        	                '<span><select class="joinType">/select></span>' +
        	                '<span><select class="tableB"></select></span>' +
        	                '<span class="join_plus"><i class="fa plus_icon"></i></span>' +
        	                '</div></div>');
        			$('.joins').append(dom);
        		};
        	}
        },
        //在父节点删除一个joinObj
        pop_joinObj:function(parentnode){
        	if(!parentnode.isroot){
        		joinsMap.get(parentnode.data.pk).pop();
        	}
        },
        //在父节点的subtree中删除相应的transentity和params
        delete_transentity:function(parentnode,nodeid){
        	if(!parentnode.isroot){
        		var jd = this;
        		var pk =parentnode.data.pk;
        		var grand = parentnode.parent;
        		var dataArray = subtreeMap.get(pk).data;
        		var newArray = $.grep( dataArray, function(n,i){
        			   if(n.fk==nodeid&&n.parentid==pk){
        				   //循环:这里循环删除params
        				   jd.delete_transentity(grand,n.id);
        				   jd.delete_params(grand,n.id);
        				   jd.delete_params_join(grand,n.id);
        			   }
        			   return n.fk!=nodeid;
        			 });
        		subtreeMap.get(pk).data = newArray;
        	}
        },
        //在父节点的paramsMap中删除相应的params,除了joins
        delete_params:function(parentnode,nodeid){
        	if(!parentnode.isroot){
	        	var pk =parentnode.data.pk;
	        	var dataArray = paramsMap.get(pk).filter;
	        	var newArray = $.grep( dataArray, function(n,i){
	 			   return n.condition1!=nodeid;
	 			 });
	        	var dataArray2 = paramsMap.get(pk).group;
	        	var newArray2 = $.grep( dataArray2, function(n,i){
	 			   return n.column!=nodeid;
	 			 });
	        	var dataArray3 = paramsMap.get(pk).order;
	        	var newArray3 = $.grep( dataArray3, function(n,i){
	 			   return n.column!=nodeid;
	 			 });
	        	paramsMap.get(pk).filter = newArray;
	        	paramsMap.get(pk).group = newArray2;
	        	paramsMap.get(pk).order = newArray3;
        	}
        },
        //在父节点的paramsMap中删除相应的joins
        delete_params_join:function(parentnode,nodeid){
        	if(!parentnode.isroot){
	        	var pk =parentnode.data.pk;
	        	var dataArray = joinsMap.get(pk);
	        	var newArray = $.grep( dataArray, function(n,i){
	        		var newonlist = $.grep( n.onList, function(item,index){
	 	 			   return item.condition1!=nodeid&&item.condition3!=nodeid;
	 	 			});
	        		n.onList = newonlist;
	 			   return 0==0;
	 			 });
	        	joinsMap.put(pk,newArray);
        	}
        },
        //删除predict节点时执行该方法
        delete_udfInfo:function(nodeid){
        	var udfInfosMap_min = udfInfosMap.get(flowId_global);
        	udfInfosMap_min.remove(nodeid);
        },
        //修改node别名时执行该方法
        modify_alias_ref:function(node){
        	if(!node.parent.isroot){
	        	var jd = this;
	        	var pk = node.data.pk;
	        	var dataArray = subtreeMap.get(pk).data;
	        	$.grep( dataArray, function(n,i){
	    			   if(n.parentid==pk){
	    				   //循环
	    				   jd.modify_subalias_ref(node,n);
	    			   }
	    			   return null;
	    			});
        	}
        },
        //修改transentity别名时执行该方法
        modify_subalias_ref:function(selected_node,subSelected_node){
        	if(!selected_node.parent.isroot){
				var parentpk = selected_node.parent.data.pk;
				var dataArray = subtreeMap.get(parentpk).data;
				//修改source_name
				$.grep( dataArray, function(n,i){
	    			   if(n.fk==subSelected_node.id){
	    				   n.source_name = selected_node.topic+'.'+subSelected_node.topic;
	    			   }
	    			   return null;
    			});
				//修改filter
				dataArray = paramsMap.get(parentpk).filter;
				$.grep( dataArray, function(n,i){
	    			   if(n.condition1==subSelected_node.id){
	    				   n.condition1_text = selected_node.topic+'.'+subSelected_node.topic;
	    			   }
	    			   return null;
    			});
				//修改group
				dataArray = paramsMap.get(parentpk).group;
				$.grep( dataArray, function(n,i){
	    			   if(n.column==subSelected_node.id){
	    				   n.column_text = selected_node.topic+'.'+subSelected_node.topic;
	    			   }
	    			   return null;
    			});
				//修改order
				dataArray = paramsMap.get(parentpk).order;
				$.grep( dataArray, function(n,i){
	    			   if(n.column==subSelected_node.id){
	    				   n.column_text = selected_node.topic+'.'+subSelected_node.topic;
	    			   }
	    			   return null;
    			});
				//修改join
				dataArray = joinsMap.get(parentpk);
				$.grep( dataArray, function(n,i){
					//先修改表名
					if(n.tableA_id==selected_node.data.pk){
						n.tableA = selected_node.topic;
					}
					if(n.tableB_id==selected_node.data.pk){
						n.tableB = selected_node.topic;
					}
	        		$.grep( n.onList, function(item,index){
	        			if(item.condition1==subSelected_node.id){
	        				item.condition1_text = selected_node.topic+'.'+subSelected_node.topic;
	        			}
	        			if(item.condition3==subSelected_node.id){
	        				item.condition3_text = selected_node.topic+'.'+subSelected_node.topic;
	        			}
	 	 			   return null;
	 	 			});
	        		//n.onList = newonlist;
	 			   return null;
 			    });
			}
        },
        //修改常量类型时执行该方法
        modify_constant_type_ref:function(subNode,parentNode){
    		if(!parentNode.isroot){
    			var jd = this;
    			var grand = parentNode.parent;
    			var pk = parentNode.data.pk;
    			var dataArray = subtreeMap.get(pk).data;
    			$.grep( dataArray, function(n,i){
    				if(n.fk==subNode.id){
    					var data = subNode.data||subNode;
    					n.columnType = data.columnType;
    					if(n.parentid==pk){
        					//循环
    						jd.modify_constant_type_ref(n,grand);
        				}
    				}
    			    return 1==1;
    			});
    			subtreeMap.get(pk).data = dataArray;
    		}
        }
        /*add by tyd end*/
    };

// ============= data provider =============================================

    jm.data_provider = function(jm){
        this.jm = jm;
    };

    jm.data_provider.prototype={
        init:function(){
            logger.debug('data.init');
        },

        reset:function(){
            logger.debug('data.reset');
        },

        load:function(mind_data){
            var df = null;
            var mind = null;
            if(typeof mind_data === 'object'){
                if(!!mind_data.format){
                    df = mind_data.format;
                }else{
                    df = 'node_tree';
                }
            }else{
                df = 'freemind';
            }

            if(df == 'node_array'){
                mind = jm.format.node_array.get_mind(mind_data);
            }else if(df == 'node_tree'){
                mind = jm.format.node_tree.get_mind(mind_data);
            }else if(df == 'freemind'){
                mind = jm.format.freemind.get_mind(mind_data);
            }else{
                logger.warn('unsupported format');
            }
            return mind;
        },

        get_data:function(data_format){
            var data = null;
            if(data_format == 'node_array'){
                data = jm.format.node_array.get_data(this.jm.mind);
            }else if(data_format == 'node_tree'){
                data = jm.format.node_tree.get_data(this.jm.mind);
            }else if(data_format == 'freemind'){
                data = jm.format.freemind.get_data(this.jm.mind);
            }else{
                logger.error('unsupported '+data_format+' format');
            }
            return data;
        },
    };

    // ============= layout provider ===========================================

    jm.layout_provider = function(jm, options){
        this.opts = options;
        this.jm = jm;
        this.isside = (this.opts.mode == 'side');
        this.bounds = null;

        this.cache_valid = false;
    };

    jm.layout_provider.prototype={
        init:function(){
            logger.debug('layout.init');
        },
        reset:function(){
            logger.debug('layout.reset');
            this.bounds = {n:0,s:0,w:0,e:0};
        },
        layout:function(){
            logger.debug('layout.layout');
            this.layout_direction();
            this.layout_offset();
        },

        layout_direction:function(){
            this._layout_direction_root();
        },

        _layout_direction_root:function(){
            var node = this.jm.mind.root;
            // logger.debug(node);
            var layout_data = null;
            if('layout' in node._data){
                layout_data = node._data.layout;
            }else{
                layout_data = {};
                node._data.layout = layout_data;
            }
            var children = node.children;
            var children_count = children.length;
            layout_data.direction = jm.direction.center;
            layout_data.side_index = 0;
            if(this.isside){
                var i = children_count;
                while(i--){
                    this._layout_direction_side(children[i], jm.direction.left, i);
                }
            }else{
                var i = children_count;
                var subnode = null;
                while(i--){
                    subnode = children[i];
                    if(subnode.direction == jm.direction.left){
                        this._layout_direction_side(subnode,jm.direction.left, i);
                    }else{
                        this._layout_direction_side(subnode,jm.direction.right, i);
                    }
                }
                /*
                var boundary = Math.ceil(children_count/2);
                var i = children_count;
                while(i--){
                    if(i>=boundary){
                        this._layout_direction_side(children[i],jm.direction.left, children_count-i-1);
                    }else{
                        this._layout_direction_side(children[i],jm.direction.right, i);
                    }
                }*/

            }
        },

        _layout_direction_side:function(node, direction, side_index){
            var layout_data = null;
            if('layout' in node._data){
                layout_data = node._data.layout;
            }else{
                layout_data = {};
                node._data.layout = layout_data;
            }
            var children = node.children;
            var children_count = children.length;

            layout_data.direction = direction;
            layout_data.side_index = side_index;
            var i = children_count;
            while(i--){
                this._layout_direction_side(children[i], direction, i);
            }
        },

        layout_offset:function(){
            var node = this.jm.mind.root;
            var layout_data = node._data.layout;
            layout_data.offset_x = 0;
            layout_data.offset_y = 0;
            layout_data.outer_height = 0;
            var children = node.children;
            var i = children.length;
            var left_nodes = [];
            var right_nodes = [];
            var subnode = null;
            while(i--){
                subnode = children[i];
                if(subnode._data.layout.direction == jm.direction.right){
                    right_nodes.unshift(subnode);
                }else{
                    left_nodes.unshift(subnode);
                }
            }
            layout_data.left_nodes = left_nodes;
            layout_data.right_nodes = right_nodes;
            layout_data.outer_height_left = this._layout_offset_subnodes(left_nodes);
            layout_data.outer_height_right = this._layout_offset_subnodes(right_nodes);
            this.bounds.e=node._data.view.width/2;
            this.bounds.w=0-this.bounds.e;
            //logger.debug(this.bounds.w);
            this.bounds.n=0;
            this.bounds.s = Math.max(layout_data.outer_height_left,layout_data.outer_height_right);
        },

        // layout both the x and y axis
        _layout_offset_subnodes:function(nodes){
            var total_height = 0;
            var nodes_count = nodes.length;
            var i = nodes_count;
            var node = null;
            var node_outer_height = 0;
            var layout_data = null;
            var base_y = 0;
            var pd = null; // parent._data
            while(i--){
                node = nodes[i];
                layout_data = node._data.layout;
                if(pd == null){
                    pd = node.parent._data;
                }

                node_outer_height = this._layout_offset_subnodes(node.children);
                if(!node.expanded){
                    node_outer_height=0;
                    this.set_visible(node.children,false);
                }
                node_outer_height = Math.max(node._data.view.height,node_outer_height);

                layout_data.outer_height = node_outer_height;
                layout_data.offset_y = base_y - node_outer_height/2;
                layout_data.offset_x = this.opts.hspace * layout_data.direction + pd.view.width * (pd.layout.direction + layout_data.direction)/2;
                if(!node.parent.isroot){
                    layout_data.offset_x += this.opts.pspace * layout_data.direction;
                }

                base_y = base_y - node_outer_height - this.opts.vspace;
                total_height += node_outer_height;
            }
            if(nodes_count>1){
                total_height += this.opts.vspace * (nodes_count-1);
            }
            i = nodes_count;
            var middle_height = total_height/2;
            while(i--){
                node = nodes[i];
                node._data.layout.offset_y += middle_height;
                //logger.debug(node._data.layout.offset_y);
            }
            return total_height;
        },

        // layout the y axis only, for collapse/expand a node
        _layout_offset_subnodes_height:function(nodes){
            return this._layout_offset_subnodes(nodes);
            var total_height = 0;
            var nodes_count = nodes.length;
            var i = nodes_count;
            var node = null;
            var node_outer_height = 0;
            var layout_data = null;
            var base_y = 0;
            var pd = null; // parent._data
            while(i--){
                node = nodes[i];
                layout_data = node._data.layout;
                if(pd == null){
                    pd = node.parent._data;
                }

                node_outer_height = this._layout_offset_subnodes_height(node.children);
                if(!node.expanded){
                    node_outer_height=0;
                }
                node_outer_height = Math.max(node._data.view.height,node_outer_height);

                layout_data.outer_height = node_outer_height;
                layout_data.offset_y = base_y - node_outer_height/2;
                base_y = base_y - node_outer_height - this.opts.vspace;
                total_height += node_outer_height;
            }
            if(nodes_count>1){
                total_height += this.opts.vspace * (nodes_count-1);
            }
            i = nodes_count;
            var middle_height = total_height/2;
            while(i--){
                node = nodes[i];
                node._data.layout.offset_y += middle_height;
                //logger.debug(node.topic);
                //logger.debug(node._data.layout.offset_y);
            }
            return total_height;
        },

        get_node_offset:function(node){
            var layout_data = node._data.layout;
            var offset_cache = null;
            if(('_offset_' in layout_data) && this.cache_valid){
                offset_cache = layout_data._offset_;
            }else{
                offset_cache = {x:-1, y:-1};
                layout_data._offset_ = offset_cache;
            }
            if(offset_cache.x == -1 || offset_cache.y == -1){
                var x = layout_data.offset_x;
                var y = layout_data.offset_y;
                if(!node.isroot){
                    var offset_p = this.get_node_offset(node.parent);
                    x += offset_p.x;
                    y += offset_p.y;
                }
                offset_cache.x = x;
                offset_cache.y = y;
            }
            return offset_cache;
        },

        get_node_point:function(node){
            var view_data = node._data.view;
            var offset_p = this.get_node_offset(node);
            //logger.debug(offset_p);
            var p = {};
            p.x = offset_p.x + view_data.width*(node._data.layout.direction-1)/2;
            p.y = offset_p.y-view_data.height/2;
            //logger.debug(p);
            return p;
        },

        get_node_point_in:function(node){
        	var p = this.get_node_offset(node);
			p.x = p.x+3;			
            return p;
        },

        get_node_point_out:function(node){
            var layout_data = node._data.layout;
            var pout_cache = null;
            if(('_pout_' in layout_data) && this.cache_valid){
                pout_cache = layout_data._pout_;
            }else{
                pout_cache = {x:-1, y:-1};
                layout_data._pout_ = pout_cache;
            }
            if(pout_cache.x == -1 || pout_cache.y == -1){
                if(node.isroot){
                    pout_cache.x = 0;
                    pout_cache.y = 0;
                }else{
                    var view_data = node._data.view;
                    var offset_p = this.get_node_offset(node);
                    pout_cache.x = offset_p.x + (view_data.width+this.opts.pspace)*node._data.layout.direction;
                    pout_cache.y = offset_p.y;
                    //logger.debug('pout');
                    //logger.debug(pout_cache);
                }
            }
            return pout_cache;
        },

        get_expander_point:function(node){
            var p = this.get_node_point_out(node);
            var ex_p = {};
            if(node._data.layout.direction == jm.direction.right){
                ex_p.x = p.x - this.opts.pspace;
            }else{
                ex_p.x = p.x;
            }
            ex_p.y = p.y - Math.ceil(this.opts.pspace/2);
            return ex_p;
        },

        get_expander_point_p:function(node){
            var p = this.get_node_point_in(node);
            var ex_p = {};           
            ex_p.x = p.x;
            ex_p.y = p.y - Math.ceil(this.opts.pspace/2);
            return ex_p;
        },
        
        get_min_size:function(){
            var nodes = this.jm.mind.nodes;
            var node = null;
            var pout = null;
            for(var nodeid in nodes){
                node = nodes[nodeid];
                pout = this.get_node_point_out(node);
                //logger.debug(pout.x);
                if(pout.x > this.bounds.e){this.bounds.e = pout.x;}
                if(pout.x < this.bounds.w){this.bounds.w = pout.x;}
            }
            return {
                w:this.bounds.e - this.bounds.w,
                h:this.bounds.s - this.bounds.n
            }
        },

        toggle_node:function(node){
            if(node.isroot){
                return;
            }
            if(node.expanded){
                this.collapse_node(node);
            }else{
                this.expand_node(node);
            }
        },

        expand_node:function(node){
            //logger.debug('expand');
            node.expanded = true;
            this.part_layout(node);
            this.set_visible(node.children,true);
        },

        collapse_node:function(node){
            //logger.debug('collapse');
            node.expanded = false;
            this.part_layout(node);
            this.set_visible(node.children,false);
        },

        expand_all:function(){
            var nodes = this.jm.mind.nodes;
            var node;
            for(var nodeid in nodes){
                node = nodes[nodeid];
                if(!node.expanded){
                    this.expand_node(node);
                }
            }
        },

        expand_to_depth:function(target_depth,curr_nodes,curr_depth){
            if(target_depth < 1){return;}
            var nodes = curr_nodes || this.jm.mind.root.children;
            var depth = curr_depth || 1;
            var i = nodes.length;
            var node = null;
            while(i--){
                node = nodes[i];
                if(depth < target_depth){
                    if(!node.expanded){
                        this.expand_node(node);
                    }
                    this.expand_to_depth(target_depth, node.children, depth+1);
                }
                if(depth == target_depth){
                    if(node.expanded){
                        this.collapse_node(node);
                    }
                }
            }
        },

        part_layout:function(node){
            //logger.debug('part_layout');
            var root = this.jm.mind.root;
            if(!!root){
                var root_layout_data = root._data.layout;
                if(node._data.layout.direction == jm.direction.right){
                    root_layout_data.outer_height_right=this._layout_offset_subnodes_height(root_layout_data.right_nodes);
                }else{
                    root_layout_data.outer_height_left=this._layout_offset_subnodes_height(root_layout_data.left_nodes);
                }
                this.bounds.s = Math.max(root_layout_data.outer_height_left,root_layout_data.outer_height_right);
                this.cache_valid = false;
            }else{
                logger.warn('can not found root node');
            }
        },

        set_visible:function(nodes,visible){
            var i = nodes.length;
            var node = null;
            var layout_data = null;
            while(i--){
                node = nodes[i];
                layout_data = node._data.layout;
                if(node.expanded){
                    this.set_visible(node.children,visible);
                }else{
                    this.set_visible(node.children,false);
                }
                node._data.layout.visible = visible;
            }
        },

        is_expand:function(node){
            return node.expanded;
        },
        
        is_visible:function(node){
            var layout_data = node._data.layout;
            if(('visible' in layout_data) && !layout_data.visible){
                return false;
            }else{
                return true;
            }
        },
    };

    // view provider
    jm.view_provider= function(jm, options){
        this.opts = options;
        this.jm = jm;
        this.layout = jm.layout;

        this.container = null;
        this.e_panel = null;
        this.e_nodes= null;
        this.e_canvas = null;

        this.canvas_ctx = null;
        this.size = {w:0,h:0};

        this.selected_node = null;
        this.editing_node = null;
    };

    jm.view_provider.prototype={
        init:function(){
            logger.debug('view.init');

            this.container = $g(this.opts.container);
            if(!this.container){
                logger.error('the options.view.container was not be found in dom');
                return;
            }
            this.e_panel = $c('div');
            this.e_canvas = $c('canvas');
            this.e_nodes = $c('jmnodes');
            this.e_editor = $c('input');

            this.e_panel.className = 'jsmind-inner';
            this.e_panel.appendChild(this.e_canvas);
            this.e_panel.appendChild(this.e_nodes);

            this.e_editor.className = 'jsmind-editor';
            this.e_editor.type = 'text';

            var v = this;
            jm.util.dom.add_event(this.e_editor,'keydown',function(e){
                var evt = e || event;
                if(evt.keyCode == 13){v.edit_node_end();evt.stopPropagation();}
            });
            jm.util.dom.add_event(this.e_editor,'blur',function(e){
                v.edit_node_end();
            });
            //add by tyd 
            var container = this.jm.options.container;
            $(this.e_editor).bind('input propertychange', function() {
            	if(container=="jsmind_container"){
                	$('.new_table_name input').val($(this).val());
                }else{
                	$('.new_column_name input').val($(this).val());
                }
            });
            //add by tyd end
            this.container.appendChild(this.e_panel);
            this.init_canvas();
        },

        add_event:function(obj,event_name,event_handle){
            jm.util.dom.add_event(this.e_nodes,event_name,function(e){
                var evt = e || event;
                event_handle.call(obj,evt);
            });
        },

        get_nodeid:function(element){
            return element.getAttribute('nodeid');
        },

        is_node:function(element){
            return (element.tagName.toLowerCase() == 'jmnode');
        },

        
        is_expander:function(element){
            return (element.tagName.toLowerCase() == 'jmexpander');
        },

        is_expanderp:function(element){
            return (element.tagName.toLowerCase() == 'jmexpanderp');
        },
        
        reset:function(){
            logger.debug('view.reset');
            this.selected_node = null;
            this.clear_lines();
            this.clear_nodes();
            this.reset_theme();
        },

        reset_theme:function(){
            var theme_name = this.jm.options.theme;
            if(!!theme_name){
                this.e_nodes.className = 'theme-' + theme_name;
            }else{
                this.e_nodes.className = '';
            }
        },

        load:function(){
            logger.debug('view.load');
            this.init_nodes();
        },

        expand_size:function(){
            var min_size = this.layout.get_min_size();
            var min_width = min_size.w + this.opts.hmargin*2;
            var min_height = min_size.h + this.opts.vmargin*2;
            var client_w = this.e_panel.clientWidth;
            var client_h = this.e_panel.clientHeight;
            if(client_w < min_width){client_w = min_width;}
            if(client_h < min_height){client_h = min_height;}
            this.size.w = client_w;
            this.size.h = client_h;
        },

        init_canvas:function(){
            var ctx = this.e_canvas.getContext('2d');
            this.canvas_ctx = ctx;
        },

        init_nodes_size:function(node){
            var view_data = node._data.view;
            view_data.width = view_data.element.clientWidth;
            view_data.height = view_data.element.clientHeight;
        },

        init_nodes:function(){
            var nodes = this.jm.mind.nodes;
            var doc_frag = $d.createDocumentFragment();
            for(var nodeid in nodes){
                this.create_node_element(nodes[nodeid],doc_frag);
            }
            this.e_nodes.appendChild(doc_frag);
            for(var nodeid in nodes){
                this.init_nodes_size(nodes[nodeid]);
            }
        },

        add_node:function(node){
            this.create_node_element(node,this.e_nodes);
            this.init_nodes_size(node);
            /* 以下是添加node的逻辑代码  by tyd*/
            //只有主树有以下操作
            if(node.data.level==1||node.data.level==2){
            	var pk = node.data.pk;
                //init paramsMap
                var keywordObj = new Object();
                var filterList = new Array();
                keywordObj.filter = filterList;
                var groupList = new Array();
                keywordObj.group = groupList;
                var orderList = new Array();
                keywordObj.order = orderList;
                paramsMap.put(pk,keywordObj);
                //init joinsMap
                var joinsList = new Array();
                joinsMap.put(pk,joinsList);
                //init targetsMap
                var targetList = new Array();
                targetsMap.put(pk,targetList);
                //init subtreeMap
                var topic = "unde";
                var sql = "select * from "+topic;
                var mind = {
    				"meta":{
    					"name":"example",
    					"author":"hizzgdev@163.com",
    					"version":"0.2"
    				},
    				"format":"node_array"
    			};
    			mind.data = [
    				{"id":pk, "isroot":true, "topic":topic,"level":"3","sql":sql}
    			];						
    			subtreeMap.put(pk,mind);
				this.jm.push_sourceids(node.parent,node);
				this.jm.push_joinObj(node.parent,node);
            }
        },

        create_node_element:function(node,parent_node){
            var view_data = null;
            if('view' in node._data){
                view_data = node._data.view;
            }else{
                view_data = {};
                node._data.view = view_data;
            }
            var d = $c('jmnode');
            //modified by tyd
            if(this.jm.options.container=='jsmind_container'){
                var div = $c('div');
                div.style.width='6px';
                div.style.height='33.3%';
                div.style.backgroundColor='#FF6159';
                div.style.margin="-9px 0px 0px -10px";
                div.style.visibility = 'hidden';
                d.appendChild(div);
                var div2 = $c('div');
                div2.style.width='6px';
                div2.style.height='33.3%';
                div2.style.backgroundColor='#FFC030';
                div2.style.margin="2px 0px 0px -10px";
                div2.style.visibility = 'hidden';
                d.appendChild(div2);
                var div3 = $c('div');
                div3.style.width='6px';
                div3.style.height='33.3%';
                div3.style.backgroundColor='#2ACF42';
                div3.style.margin="13px 0px 0px -10px";
                div3.style.visibility = 'hidden';
                d.appendChild(div3);
            }
            
            if(node.isroot){
                d.className = 'root';
            }else{
                var d_e = $c('jmexpander');
                $t(d_e,'-');
                d_e.setAttribute('nodeid',node.id);
                d_e.style.visibility = 'hidden';
                parent_node.appendChild(d_e);
                view_data.expander = d_e;
                
                var d_e_p = $c('jmexpanderp');
                $t(d_e_p,'+');
                d_e_p.setAttribute('nodeid',node.id);
                d_e_p.style.visibility = 'visible';
                parent_node.appendChild(d_e_p);
				view_data.expanderp = d_e_p;
            }
            if(this.opts.support_html){
                $h(d,node.topic);
            }else{
                $t(d,node.topic);
            }
            //新增两个参数title和onmouseover
            //d.setAttribute('title',node.id);
            //d.setAttribute('onmouseover','showTooltip(this);');
            //d.style.borderColor='red';
            d.setAttribute('nodeid',node.id);
            d.style.visibility='hidden';
            parent_node.appendChild(d);
            view_data.element = d;
            if(this.jm.options.container!='jsmind_container'){
            	$(d).hover(
            		function(e){
            			var element = e.target || event.srcElement;
            			var $element = $('#showTip_jsmind_container2_3');
            			$element.css('top',element.offsetTop+element.clientHeight);
            			$element.css('left',element.offsetLeft);
            			var content = node.data.content;
            			content = "0b"+content;
            			var background = node.data.border_color;
            			if(background==error_color){
            				var flag = false;
            				var num = 1;
            				var contentStr = "";
            				$.each(transErrorEnum,function(index,item){
            					flag = powerConjunction(content,item);
            					if(flag){
            						switch(index){
    		                		case 0:
    		                			contentStr+=num+".出参别名为空<br/>";
    		                			break;
    		                		case 1:
    		                			contentStr+=num+".出参别名含有特殊字符或中文<br/>";
    		                			break;
    		                		case 2:
    		                			contentStr+=num+".出参别名重复<br/>";
    		                			break;
    		                		case 3:
    		                			contentStr+=num+".常量值为空<br/>";
    		                			break;
    		                		case 4:
    		                			contentStr+=num+".数据挖掘的路径或类型为空<br/>";
    		                			break;
    		                		case 5:
    		                			contentStr+=num+".入参个数不足<br/>";
    		                			break;
    		                		case 6:
    		                			contentStr+=num+".入参类型不匹配<br/>";
    		                			break;
    	  	                		}
            						num++;
            					}
            				});
            				$element.tipso('update', 'background', background);
                			$element.tipso('update', 'content', contentStr);
                			$element.tipso('show');
            			}
            		},
            		function(e){
            			var $element = $('#showTip_jsmind_container2_3');
            			$element.tipso('hide');
            		}
            	);
            }
        },

        remove_node:function(node){
            if(this.selected_node != null && this.selected_node.id == node.id){
                this.selected_node = null;
            }
            if(this.editing_node != null && this.editing_node.id == node.id){
                node._data.view.element.removeChild(this.e_editor);
                this.editing_node = null;
            }
            var children = node.children;
            var i = children.length;
            while(i--){
                this.remove_node(children[i]);
            }
            if(node._data.view){
                var element = node._data.view.element;
                var expander = node._data.view.expander;
                var expanderp = node._data.view.expanderp;
                this.e_nodes.removeChild(element);
                this.e_nodes.removeChild(expander);
                this.e_nodes.removeChild(expanderp);
                node._data.view.element = null;
                node._data.view.expander = null;
                node._data.view.expanderp = null;
            }
        },
        
        update_node:function(node){
            var view_data = node._data.view;
            var element = view_data.element;
            if(this.opts.support_html){
                $h(element,node.topic);
            }else{
                $t(element,node.topic);
            }
            view_data.width = element.clientWidth;
            view_data.height = element.clientHeight;
        },

        select_node:function(node){
        	var selected_node = this.selected_node;
			if(!!selected_node){
				selected_node._data.view.element.className =
				selected_node._data.view.element.className.replace(/\s*selected\s*/i,'');
            }
            if(!!node){
				//在这里添加点击事件			
				if(node.data.level=="1"||node.data.level=="2"){
					_jm1.deleteflag=true;
					_jm2.deleteflag=false;
					//当选中节点且节点发生变化，需要保存当前节点的子树状态和右边的属性值
					if(this.jm.get_editable()){
						save_current(selected_node);
					}
					/**********************以上是存储的操作，以下是查询展现的操作*******************************/
					clear_panel_node();
					var nodepk = node.data.pk;
					var columnArray = new Array();
					var tabledoms = "";
					var tableMap = new Map();
					var firstcolumndoms = "";
					//如果是末节点，则columnArray的数据来自数据源的字段，否则来自"子节点的别名.子节点的as"的列表总和
					if(node.data.level==1){
						//处理columnArray和初始化tabledoms和初始化tableMap和初始化firstcolumndoms
						var dataArray2 = _jm1.data.get_data('node_array').data;
						var sourceids = node.data.sourceids;
						$.each(sourceids,function(index, item){
							//var columndoms="<option value=''>请选择</option>";
							var columndoms="<option value=''>请选择</option>";
							var columnsTemp = new Array();
							var dataArray = subtreeMap.get(item).data;
							var alias;
							//查出对应的子节点别名,alias只可能一个值
							$.each(dataArray2,function(i, element){
								if(element.pk==item){
									alias = element.topic;
									return false;
								}
							});
							$.each(dataArray,function(i, element){
								//element.parentid==item表示该transentity是出参
								if(element.parentid==item){
									var obj = new Object();
									obj.fk = element.id;
									obj.name = alias+"."+element.topic;
									obj.type = element.columnType;
									columnsTemp.push(obj);
									//顺带初始化firstcolumndoms
									if(index==0){
										firstcolumndoms += '<option value="'+obj.fk+'">'+obj.name+'</option>';
									}
									columndoms += '<option value="'+obj.fk+'">'+obj.name+'</option>';
								}
							});
							tabledoms+='<option value="'+item+'">'+alias+'</option>';
							tableMap.put(item,columndoms);
							columnArray = columnArray.concat(columnsTemp);
						});
					}else if(node.data.level==2){
						columnArray = tableColumnsMap.get(node.data.sourceid);
					}
					//初始化 col_con
					$('.dt_d .col_con').html("");
					//初始化源字段
					var $sourceFields = $('.sourceFieldEvent .tableContainer tr[class!="contentTitle"]');
					$sourceFields.remove();
					var col_con_doms = "";
					var columndoms2="";
					var line_color = _jm2.options.view.line_color;
					$.each(columnArray, function(index, item){
						var dom = "<p fk = '"+item.fk+"' textValue = '"+item.name+"' columnType='"+item.type+"' level='4' line_color='"+line_color+"' class='draggable'>"+item.name+"</p>";							
						col_con_doms+=dom;
						var optionvalue = item.fk||item.name;
						var dom2 = '<option value="'+optionvalue+'">'+item.name+'</option>'; 
						columndoms2+=dom2;
						
						$('.sourceFieldEvent .tableContainer').append( $('<tr><td>'+item.name+'</td><td>'+item.type+'</td><td></td><td></td><td></td><td><i class="single"></i></td><td></td></tr>') );
					});
					$('.dt_d .col_con').append($(col_con_doms));
					initDragable();
					//选择事件
					$('.sourceFieldEvent .single').unbind('click').click(function () {
						//查看源字段不可编辑
			           /* if ($(this).hasClass('singleChecked')) {
			                $(this).removeClass('singleChecked');
			            } else {
			                $(this).addClass('singleChecked')
			            }*/
				    });
					
					//初始化tableName
					var tableNameNew = "";
					tableNameNew = node.topic;
					$('.new_table_name input').val(tableNameNew);
					$('.new_table_name span').first().html(node.data.source_name);
					$('.new_table_name input').css('width',250-$('.new_table_name span').first().width());
					//初始化join
					var joinsListNew = new Array();
					joinsListNew = joinsMap.get(nodepk);
					$(sourceids).each(function(index,item){
						if(index>0){
							addJoinRecord(tabledoms,firstcolumndoms,tableMap);
						}
					});
					$.each(joinsListNew,function(index,item){
						var currenttable = $($('.joins .related_table')[index]);
						currenttable.find('.tableA').val(item.tableA_id);
						currenttable.find('.template_join_r .condition1').html(tableMap.get(item.tableA_id));
						currenttable.find('.joinType').val(item.joinType);
						currenttable.find('.tableB').val(item.tableB_id);
						currenttable.find('.template_join_r .condition3').html(tableMap.get(item.tableB_id));
						$.each(item.onList,function(i,element){
							addJoinRecord_mini(currenttable);
							$(currenttable.find('.join')[i]).find('.condition1').val(element.condition1);
							$(currenttable.find('.join')[i]).find('input').eq(0).val(element.condition1_text);
							$(currenttable.find('.join')[i]).find('.condition2').val(element.condition2);
							$(currenttable.find('.join')[i]).find('.condition3').val(element.condition3);
							$(currenttable.find('.join')[i]).find('input').eq(1).val(element.condition3_text);
							$(currenttable.find('.operations')[i]).find('.condition4').val(element.condition4);
							$(currenttable.find('.operations')[i]).find('.condition5').val(element.condition5);
						});
					});
					//初始化filter
					var filterListNew = new Array();
					filterListNew = paramsMap.get(nodepk).filter;
					$('.filters .filter').find('.condition1').html(columndoms2);
					$.each(filterListNew, function(i, item){
						addFilterRecord();
						$($('.filters .filter')[i+1]).find('.condition1').val(item.condition1);
						$($('.filters .filter')[i+1]).find('.condition2').val(item.condition2);
						$($('.filters .filter')[i+1]).find('.condition3').val(item.condition3);
						$($('.filters .filter')[i+1]).find('.condition4').val(item.condition4);
						$($('.filters .filter')[i+1]).find('.condition5').val(item.condition5);
					});
					//初始化group
					var groupListNew = new Array();
					groupListNew = paramsMap.get(nodepk).group;
					$('.groups .group').find('select').html(columndoms2);
					$.each(groupListNew, function(i, item){
						addGroupRecord();
						$($('.groups .group').find('select')[i+1]).val(item.column);
					}); 
					//初始化order
					var orderListNew = new Array();
					orderListNew = paramsMap.get(nodepk).order;
					$('.orders .order').find('select').first().html(columndoms2);
					$.each(orderListNew, function(i, item){
						addOrderRecord();
						$($('.orders .order')[i+1]).find('select').first().val(item.column);
						$($('.orders .order')[i+1]).find('select').last().val(item.asc);
					}); 
					//初始化targets
					var targetListNew = new Array();
					targetListNew = targetsMap.get(nodepk);
					$.each(targetListNew,function(i,item){
						var tableName = item.saveTargetParams[0].value;
						var model = item.saveTargetParams[1].value;
						var dom = $('<div class="target" data-id="'+item.num+'"><label>'+tableName+'</label><span class="edit"><i class="fa fa-pencil-square-o"></i></span><span class="trash2"><i class="fa fa-trash2"></i></span></div>');
			    		$('.targets').append(dom);
						$('.targets .edit').unbind('click').on('click', function(){
							var $this = $(this);
							$reloadConnection(function(){
								$bindEditClickEvent(targetsMap, nodepk, $this.parent().attr('data-id'));
								$('.target_layer').show();
						    	$('.mask').show();
							});
							
				    	    /*$('#sjlj').val(item.conId);
				    	    $('.table_name').val(tableName);
				    	    $('#ms').val(model);
				    	    $('.target_layer').show();
				    	    $('.mask').show();*/
				    	});
			    		$('.targets .fa-trash2').unbind('click').on('click', function(e){
			                try{
			                	var num = $(e.target.parentElement.parentElement).attr('data-id');
			                    $(e.target.parentElement.parentElement).slideUp('slow',function(){
			                        e.target.parentElement.parentElement.remove();
			                        var dataArray = targetsMap.get(nodepk);
			                        var newArray = $.grep( dataArray, function(n,i){
			     	    			   	return n.num!=num;
			                        });
			                        if(newArray.length==0){
			                        	node.data.isSave = 0;
			                        }
			                        targetsMap.put(nodepk,newArray);
			                    });
			                }catch(e){
			                    console.log(e)
			                }
			            });
					});
					//隐藏new_column_name等
					hide_column_constant_predict();
					//初始化子树
					$('#tabbox2 ul').eq(0).find('li').eq(0).click();
					open_detail(nodepk);
				}else{
					_jm1.deleteflag=false;
					_jm2.deleteflag=true;
					/**********************以上是存储的操作，以下是查询展现的操作*******************************/
					//为了保证移动时右边属性显示一致，所以不放进if(node.parent.isroot){}里
					$('.new_column_name').show();
					var columnNameNew = "";
					columnNameNew = node.topic;
					$('.new_column_name input').val(columnNameNew);
					$('.new_column_name span').first().html(node.data.source_name);
					$('.new_column_name input').css('width',250-$('.new_column_name span').first().width());
					if(node.parent.isroot){
						
					}else{
						$('.new_column_name').hide();
					}	
					if(node.data.functionType==2){
						$('.new_type_value').show();
						$('.new_constant_value').show();
						var constantType = node.data.columnType;
						$('.new_type_value select').val(constantType);
						var constantValueNew = node.data.constantValue;
						$('.new_constant_value input').val(constantValueNew);
						$('.new_constant_value input').css('width',250-$('.new_constant_value span').first().width());
					}else{
						$('.new_type_value').hide();
						$('.new_constant_value').hide();
					}
					if(node.data.functionType==9){
						$.ajax({
				            url: urlId + '/selectByUserid',
				            type:'POST',
				            async:false,
				            data:{user_id:userId},
				            dataType:"json",
				            success:function(data) {
				            	var optionStr="<option value=0>自定义</option>";
				            	$.each(data,function(index,item){
				            		optionStr+="<option value="+item.id+">"+item.name+"</option>";
				            	});
				            	$('.new_predict_value select').html($(optionStr));
				            },
				            error : function() {
				                $.dialog("加载数据挖掘时异常！");
				            }
				        });
						var udfInfosMap_min = udfInfosMap.get(flowId_global);
						if(udfInfosMap_min){
							var udfInfoNew = udfInfosMap_min.get(node.id);
							if(udfInfoNew){
								$('.new_predict_value select').val(udfInfoNew.miningid);
								$('.new_predict_value input').eq(0).val(udfInfoNew.path);
								$('.new_predict_value input').eq(1).val(udfInfoNew.type);
							}else{
								$('.new_predict_value select').val('');
								$('.new_predict_value input').eq(0).val('');
								$('.new_predict_value input').eq(1).val('');
							}
						}else{
							$('.new_predict_value select').val('');
							$('.new_predict_value input').eq(0).val('');
							$('.new_predict_value input').eq(1).val('');
						}
						$('.new_predict_value').show();
					}else{
						$('.new_predict_value').hide();
					}
				}
                this.selected_node = node;
                node._data.view.element.className += ' selected';
            }
        },

        select_clear:function(){
            this.select_node(null);
        },

        get_editing_node:function(){
            return this.editing_node;
        },

        is_editing:function(){
            return (!!this.editing_node);
        },

        edit_node_begin:function(node){
            if(this.editing_node != null){
                this.edit_node_end();
            }
            this.editing_node = node;
            var view_data = node._data.view;
            var element = view_data.element;
            var topic = node.topic;
            this.e_editor.value = topic;
            //防止debug和数据出口标识消失  modified by tyd
            //element.innerHTML = '';
            var eles = element.getElementsByTagName('*');
        	$(element).html($(eles));
        	
            element.appendChild(this.e_editor);
            element.style.zIndex = 5;
            this.e_editor.focus();
            this.e_editor.select();
        },

        edit_node_end:function(){
            if(this.editing_node != null){
                var node = this.editing_node;
                this.editing_node = null;
                var view_data = node._data.view;
                var element = view_data.element;
                var topic = this.e_editor.value;
                element.style.zIndex = 'auto';
                element.removeChild(this.e_editor);
                //modified by tyd
                /*if(jm.util.text.is_empty(topic)){
                    if(this.opts.support_html){
                        $h(element,node.topic);
                    }else{
                        $t(element,node.topic);
                    }
                }else if(node.topic === topic){
                	this.jm.view.update_node(node);
                    this.jm.layout.layout();
                    this.jm.view.show(false);
                }else{
                	this.jm.update_node(node.id,topic);
                }*/
                var selected_node = this.jm.get_selected_node();
        		selected_node.topic = topic;
        		this.jm.view.update_node(selected_node);
        		this.jm.layout.layout();
        		this.jm.view.show(false);
                if(this.jm.options.container=="jsmind_container"){
                	
                }else{
                	_jm2.check_subnode_alias();
                }
            }
        },

        get_view_offset:function(){
            var bounds = this.layout.bounds;
            var _x = (this.size.w - bounds.e - bounds.w)/2-210;
            var _y = this.size.h / 2;
            return{x:_x, y:_y};
        },

        resize:function(){
            this.e_canvas.width = 1;
            this.e_canvas.height = 1;
            this.e_nodes.style.width = '1px';
            this.e_nodes.style.height = '1px';

            this.expand_size();
            this._show();
        },

        _show:function(){
            this.e_canvas.width = this.size.w;
            this.e_canvas.height = this.size.h;
            this.e_nodes.style.width = this.size.w+'px';
            this.e_nodes.style.height = this.size.h+'px';
            this.show_nodes();
            this.show_lines();
            //this.layout.cache_valid = true;
            this.jm.invoke_event_handle(jm.event_type.resize,{data:[]});
        },

        _center_root:function(){
            // center root node
            var outer_w = this.e_panel.clientWidth;
            var outer_h = this.e_panel.clientHeight;
            if(this.size.w > outer_w){
                var _offset = this.get_view_offset();
                this.e_panel.scrollLeft = _offset.x - outer_w/2;
            }
            if(this.size.h > outer_h){
                this.e_panel.scrollTop = (this.size.h - outer_h)/2;
            }
        },

        show:function(keep_center){
            logger.debug('view.show');
            this.expand_size();
            this._show();
            if(!!keep_center){
                this._center_root();
            }
        },

        relayout:function(){
            this.expand_size();
            this._show();
        },

        clear_nodes:function(){
            var mind = this.jm.mind;
            if(mind == null){
                return;
            }
            var nodes = mind.nodes;
            var node = null;
            for(var nodeid in nodes){
                node = nodes[nodeid];
                node._data.view.element = null;
                node._data.view.expander = null;
                node._data.view.expanderp = null;
            }
            this.e_nodes.innerHTML = '';
        },

        show_nodes:function(){
            var nodes = this.jm.mind.nodes;
            var node = null;
            var node_element = null;
            var expander = null;
            var expanderp = null;
            var p = null;
            var p_expander= null;
            var expander_text = '-';
            var view_data = null;
            var _offset = this.get_view_offset();
            for(var nodeid in nodes){
                node = nodes[nodeid];
                view_data = node._data.view;
                node_element = view_data.element;
                expander = view_data.expander;
                expanderp = view_data.expanderp;
                if(!this.layout.is_visible(node)){
                    node_element.style.display = 'none';
                    expander.style.display = 'none';
                    expanderp.style.display = 'none';
                    continue;
                }
                p = this.layout.get_node_point(node);
                view_data.abs_x = _offset.x + p.x;
                view_data.abs_y = _offset.y + p.y;
                node_element.style.left = (_offset.x+p.x) + 'px';
                node_element.style.top = (_offset.y+p.y) + 'px';
                if(!node.isroot){
					node_element.style.display = '';
					node_element.style.visibility = 'visible';
				}else{
					node_element.style.display = 'none;';
					node_element.style.visibility = 'hidden';
				}
                /*node_element.style.display = '';
                node_element.style.visibility = 'visible';*/
                if(!node.isroot && node.children.length>0){
                    expander_text = node.expanded?'-':'+';
                    p_expander= this.layout.get_expander_point(node);
                    expander.style.left = (_offset.x + p_expander.x) + 'px';
                    expander.style.top = (_offset.y + p_expander.y) + 'px';
                    expander.style.display = '';
                    expander.style.visibility = 'visible';
                    $t(expander,expander_text);
                }
                // hide expander while all children have been removed
                if(!node.isroot && node.children.length==0){
                    expander.style.display = 'none';
                    expander.style.visibility = 'hidden';
                }
                if(!node.isroot){
                	if(node.parent.isroot){
                		var p_expanderp= this.layout.get_expander_point_p(node);
     					expanderp.style.left = (_offset.x + p_expanderp.x) + 'px';
     					expanderp.style.top = (_offset.y + p_expanderp.y) + 'px';	
     					expanderp.style.display = '';
                	}else{
                		expanderp.style.display = 'none';
                	}
                 }
            }
        },

        clear_lines:function(canvas_ctx){
            var ctx = canvas_ctx || this.canvas_ctx;
            jm.util.canvas.clear(ctx,0,0,this.size.w,this.size.h);
        },

        show_lines:function(canvas_ctx){
            this.clear_lines(canvas_ctx);
            var nodes = this.jm.mind.nodes;
            var node = null;
            var pin = null;
            var pout = null;
            var _offset = this.get_view_offset();
            for(var nodeid in nodes){
                node = nodes[nodeid];
                if(!!node.isroot){continue;}
                if(('visible' in node._data.layout) && !node._data.layout.visible){continue;}
                //隐藏根节点的线
				if(node.parent.isroot){continue;}
                pin = this.layout.get_node_point_in(node);
                pout = this.layout.get_node_point_out(node.parent);
                //添加了一个line_color参数
                this.draw_line(pout,pin,_offset,canvas_ctx,node.data.line_color);
            }
        },
        //添加了一个line_color参数，让线的颜色根据每个节点的参数值来改变
        draw_line:function(pin,pout,offset,canvas_ctx,line_color){
            var ctx = canvas_ctx || this.canvas_ctx;
            //ctx.strokeStyle = this.opts.line_color;
            ctx.strokeStyle = line_color;
            ctx.lineWidth = this.opts.line_width;
            ctx.lineCap = 'round';
            
            jm.util.canvas.bezierto(
                ctx,
                pin.x + offset.x,
                pin.y + offset.y,
                pout.x + offset.x,
                pout.y + offset.y);
        },
    };

    // shortcut provider
    jm.shortcut_provider= function(jm, options){
        this.jm = jm;
        this.opts = options;
        this.mapping = options.mapping;
        this.handles = options.handles;
        this._mapping = {};
    };

    jm.shortcut_provider.prototype = {
        init : function(){
            jm.util.dom.add_event($d,'keydown',this.handler.bind(this));
			//把添加事件禁止
            //this.handles['addchild'] = this.handle_addchild;
            //this.handles['addbrother'] = this.handle_addbrother;
            this.handles['editnode'] = this.handle_editnode;
            this.handles['delnode'] = this.handle_delnode;
//            this.handles['toggle'] = this.handle_toggle;
//            this.handles['up'] = this.handle_up;
//            this.handles['down'] = this.handle_down;
//            this.handles['left'] = this.handle_left;
//            this.handles['right'] = this.handle_right;

            for(var handle in this.mapping){
                if(!!this.mapping[handle] && (handle in this.handles)){
                    this._mapping[this.mapping[handle]] = this.handles[handle];
                }
            }
        },

        enable_shortcut : function(){
            this.opts.enable = true;
        },

        disable_shortcut : function(){
            this.opts.enable = false;
        },

        handler : function(e){
            if(this.jm.view.is_editing()){return;}
            var evt = e || event;
            if(!this.opts.enable){return true;}
            var kc = evt.keyCode;
            if(kc in this._mapping){
                this._mapping[kc].call(this,this.jm,e);
            }
        },

        handle_addchild: function(_jm,e){
            var selected_node = _jm.get_selected_node();
            if(!!selected_node){
                var nodeid = jm.util.uuid.newid();
                var node = _jm.add_node(selected_node, nodeid, 'New Node');
                if(!!node){
                    _jm.select_node(nodeid);
                    _jm.begin_edit(nodeid);
                }
            }
        },
        handle_addbrother:function(_jm,e){
            var selected_node = _jm.get_selected_node();
            if(!!selected_node && !selected_node.isroot){
                var nodeid = jm.util.uuid.newid();
                var node = _jm.insert_node_after(selected_node, nodeid, 'New Node');
                if(!!node){
                    _jm.select_node(nodeid);
                    _jm.begin_edit(nodeid);
                }
            }
        },
        handle_editnode:function(_jm,e){
            var selected_node = _jm.get_selected_node();
            if(!!selected_node){
                _jm.begin_edit(selected_node);
            }
        },
        handle_delnode:function(_jm,e){
        	if(_jm.deleteflag){
        		var selected_node = _jm.get_selected_node();
                if(!!selected_node && !selected_node.isroot){
    				//取消删除后自动选中父节点
                    //_jm.select_node(selected_node.parent);
                	//_jm.remove_node(selected_node);
                	var nodeid = selected_node.id;
    				var parent = selected_node.parent;
    				var parentid = parent.id;
    				var children = selected_node.children;
    				var children_ids = new Array();
    				$.each(children,function(index,item){
    					children_ids.push(item.id);
    				});
    				$.each(children_ids,function(index,item){
    					_jm.move_node(item, nodeid, parentid, "-1");
    				});
    				_jm.select_node(nodeid);
    				_jm.remove_node(selected_node);
                }
        	}
        },
        handle_toggle:function(_jm,e){
            var evt = e || event;
            var selected_node = _jm.get_selected_node();
            if(!!selected_node){
                _jm.toggle_node(selected_node.id);
                evt.stopPropagation();
                evt.preventDefault();
            }
        },
        handle_up:function(_jm,e){
            var evt = e || event;
            var selected_node = _jm.get_selected_node();
            if(!!selected_node){
                var up_node = _jm.find_node_before(selected_node);
                if(!up_node){
                    var np = _jm.find_node_before(selected_node.parent);
                    if(!!np && np.children.length > 0){
                        up_node = np.children[np.children.length-1];
                    }
                }
                if(!!up_node){
                    _jm.select_node(up_node);
                }
                evt.stopPropagation();
                evt.preventDefault();
            }
        },

        handle_down:function(_jm,e){
            var evt = e || event;
            var selected_node = _jm.get_selected_node();
            if(!!selected_node){
                var down_node = _jm.find_node_after(selected_node);
                if(!down_node){
                    var np = _jm.find_node_after(selected_node.parent);
                    if(!!np && np.children.length > 0){
                        down_node = np.children[0];
                    }
                }
                if(!!down_node){
                    _jm.select_node(down_node);
                }
                evt.stopPropagation();
                evt.preventDefault();
            }
        },

        handle_left:function(_jm,e){
            this._handle_direction(_jm,e,jm.direction.left);
        },
        handle_right:function(_jm,e){
            this._handle_direction(_jm,e,jm.direction.right);
        },
        _handle_direction:function(_jm,e,d){
            var evt = e || event;
            var selected_node = _jm.get_selected_node();
            var node = null;
            if(!!selected_node){
                if(selected_node.isroot){
                    var c = selected_node.children;
                    var children = [];
                    for(var i=0;i<c.length;i++){
                        if(c[i].direction === d){
                            children.push(i)
                        }
                    }
                    node = c[children[Math.floor((children.length-1)/2)]];
                }
                else if(selected_node.direction === d){
                    var children = selected_node.children;
                    var childrencount = children.length;
                    if(childrencount > 0){
                        node = children[Math.floor((childrencount-1)/2)]
                    }
                }else{
                    node = selected_node.parent;
                }
                if(!!node){
                    _jm.select_node(node);
                }
                evt.stopPropagation();
                evt.preventDefault();
            }
        },
    };


    // plugin
    jm.plugin = function(name,init){
        this.name = name;
        this.init = init;
    };

    jm.plugins = [];

    jm.register_plugin = function(plugin){
        if(plugin instanceof jm.plugin){
            jm.plugins.push(plugin);
        }
    };

    jm.init_plugins = function(sender){
        $w.setTimeout(function(){
            jm._init_plugins(sender);
        },0);
    };

    jm._init_plugins = function(sender){
        var l = jm.plugins.length;
        var fn_init = null;
        for(var i=0;i<l;i++){
            fn_init = jm.plugins[i].init;
            if(typeof fn_init === 'function'){
                fn_init(sender);
            }
        }
    };

    // quick way
    jm.show = function(options,mind){
        var _jm = new jm(options);
        _jm.show(mind);
        return _jm;
    };

    // register global variables
    $w[__name__] = jm;
})(window);
