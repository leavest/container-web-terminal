(this["webpackJsonpweb-terminal"]=this["webpackJsonpweb-terminal"]||[]).push([[0],{123:function(e,n,t){e.exports=t(214)},128:function(e,n,t){},143:function(e,n,t){},214:function(e,n,t){"use strict";t.r(n);var a=t(0),o=t.n(a),c=t(8),i=t.n(c),r=(t(128),t(40)),s=t(41),l=t(43),u=t(42),m=t(44),d=t(118),h=t(30),p=(t(129),t(90)),f=(t(131),t(67)),y=(t(215),t(120)),v=(t(135),t(10)),b=(t(137),t(68)),k=(t(91),t(66)),g=(t(140),t(121)),w=t(55),E=t(110),O=t(47),C=(t(143),function(e){function n(e){var t;return Object(r.a)(this,n),(t=Object(l.a)(this,Object(u.a)(n).call(this,e))).fetchDocker=function(){var e="".concat(O.api,"/api/docker/containers");fetch(e).then((function(e){return e.json()})).then((function(e){if(t._isMounted)if(Array.isArray(e)){var n={title:o.a.createElement("span",null,"docker"),value:"docker",key:"docker",children:e.map((function(e){return{title:o.a.createElement("span",null,e),value:e,key:"docker.".concat(e)}}))};t.setState({menuData:[].concat(Object(w.a)(t.state.menuData),[n]),menus:[].concat(Object(w.a)(t.state.menus),[t.parseMenu(n)])})}else console.log(e)})).catch((function(e){t._isMounted&&console.log(e)}))},t.fetchKubernetes=function(){var e="".concat(O.api,"/api/kubernetes/containers");fetch(e).then((function(e){return e.json()})).then((function(e){if(t._isMounted)if(Array.isArray(e)){var n={title:o.a.createElement("span",null,"kubernetes"),value:"kubernetes",key:"kubernetes",children:e.map((function(e){return{title:o.a.createElement("span",null,e.namespace),value:e.namespace,key:"kubernetes.".concat(e.namespace),children:e.pods.map((function(n){return{title:o.a.createElement("span",null,n.name),value:n.name,key:"kubernetes.".concat(e.namespace,".").concat(n.name),children:n.containers.map((function(t){return{title:o.a.createElement("span",null,t),value:t,key:"kubernetes.".concat(e.namespace,".").concat(n.name,".").concat(t)}}))}}))}}))};t.setState({menuData:[].concat(Object(w.a)(t.state.menuData),[n]),menus:[].concat(Object(w.a)(t.state.menus),[t.parseMenu(n)])})}else console.log(e)})).catch((function(e){t._isMounted&&console.log(e)}))},t.handleResize=function(){var e=document.body.getBoundingClientRect().height,n=document.body.getBoundingClientRect().width,a=e-40,c=n-200;a>100&&c>100?(t.state.panes.forEach((function(e){e.content=o.a.createElement("iframe",{id:e.key,src:e.url,title:e.title,style:{border:0,height:a,width:c}})})),t.setState({iframeHeight:a})):(t.state.panes.forEach((function(e){e.content=void 0})),t.state.panes.length>0&&g.a.error("\u7a97\u53e3\u592a\u5c0f"))},t.parseMenu=function(e){return Array.isArray(e.children)?o.a.createElement(b.a.SubMenu,{key:e.key,title:o.a.createElement(k.a,{title:e.title},e.title)},e.children.map(t.parseMenu)):o.a.createElement(b.a.Item,{key:e.key,onDoubleClick:function(){return t.add(e.key)}},o.a.createElement(v.a,{type:"cloud"}),e.title)},t.onChange=function(e){t.setState({activeKey:e})},t.onEdit=function(e,n){t[n](e)},t.add=function(e){var n=t.state.panes,a=e;if(n.some((function(e){return e.key===a})))t.setState({panes:n,activeKey:a});else{var c=e.split("."),i=c[c.length-1],r="/terminal/".concat(c.join("/"));n.push({title:i,url:r,content:o.a.createElement("iframe",{id:a,src:r,title:i,style:{border:0,height:t.state.iframeHeight,width:"100%"}}),key:a}),t.setState({panes:n,activeKey:a})}},t.remove=function(e){var n,a=t.state.activeKey;t.state.panes.forEach((function(t,a){t.key===e&&(n=a-1)}));var o=t.state.panes.filter((function(n){return n.key!==e}));o.length&&a===e&&(a=n>=0?o[n].key:o[0].key),t.setState({panes:o,activeKey:a})},t.onOpenChange=function(e){t.setState({openKeys:e})},t.onSearch=function(e){var n=e.target.value;if(t.openKeys=[],n){var a=t.state.menuData.map((function(e){return t.searchMenu(e,n,n)})).filter((function(e){return null!==e}));t.setState({menus:a.map(t.parseMenu)})}else t.setState({menus:t.state.menuData.map(t.parseMenu)})},t.searchMenu=function(e,n,a){var c=e.title;if(a){var i=e.value.indexOf(a),r=e.value.substr(0,i),s=e.value.substr(i+a.length);i>-1&&(c=o.a.createElement("span",null,r,o.a.createElement("span",{style:{color:"#f50"}},a),s))}if(Array.isArray(e.children)){Array.isArray(t.openKeys)&&t.openKeys.push(e.key),e.value.includes(n)&&(n=void 0);var l=e.children.map((function(e){return t.searchMenu(e,n,a)})).filter((function(e){return null!==e}));if(!n||e.value.includes(n)||l.length>0)return{children:l,title:c,value:e.value,key:e.key}}else if(!n||e.value.includes(n))return{title:c,value:e.value,key:e.key};return null},t.state={menuData:[],kubernetesData:[],menus:[],panes:[],openKeys:[],iframeHeight:0,activeKey:void 0},t.openKeys=[],t.handleResize=Object(E.debounce)(t.handleResize,500),t}return Object(m.a)(n,e),Object(s.a)(n,[{key:"componentDidMount",value:function(){var e=this;this._isMounted=!0,this.fetchDocker(),this.fetchKubernetes(),this.handleResize(),window.addEventListener("resize",(function(){return e.handleResize()}))}},{key:"componentWillUnmount",value:function(){var e=this;this._isMounted=!1,window.removeEventListener("resize",(function(){return e.handleResize()}))}},{key:"render",value:function(){var e=document.getElementById("root").getBoundingClientRect().height;return o.a.createElement(f.a,{style:{minHeight:"100vh",maxHeight:"100vh"}},o.a.createElement(f.a.Sider,null,o.a.createElement("div",{style:{height:40,background:"#fff",borderBottom:"1px solid #eee"}},o.a.createElement(y.a,{className:"search-input",placeholder:"\u641c\u7d22...",prefix:o.a.createElement(v.a,{type:"search"}),onChange:this.onSearch})),o.a.createElement(b.a,{mode:"inline",inlineIndent:12,style:{height:e-40,border:"none"},openKeys:this.state.openKeys,onOpenChange:this.onOpenChange},this.state.menus)),o.a.createElement(f.a.Content,null,o.a.createElement(p.a,{hideAdd:!0,onChange:this.onChange,activeKey:this.state.activeKey,type:"editable-card",onEdit:this.onEdit,tabBarStyle:{margin:0}},this.state.panes.map((function(e){return o.a.createElement(p.a.TabPane,{tab:e.title,key:e.key},e.content)})))))}}]),n}(a.Component)),S=t(46),j=t(63),M=t.n(j),K=t(116),z=t(117),R=(t(211),function(e){function n(e){var t;Object(r.a)(this,n),(t=Object(l.a)(this,Object(u.a)(n).call(this,e))).initConnection=function(){t.conn=new WebSocket(t.ws_url),t.conn.onopen=t.onConnectionOpen.bind(Object(S.a)(t)),t.conn.onmessage=t.onConnectionMessage.bind(Object(S.a)(t)),t.conn.onclose=t.onConnectionClose.bind(Object(S.a)(t))},t.onConnectionOpen=function(){t.connected=!0,t.flag=setInterval((function(){t.connected?t.conn.send(JSON.stringify({Op:"resize",Cols:t.term.cols,Rows:t.term.rows})):clearInterval(t.flag)}),25e3),t.onTerminalResize(),t.term.focus()},t.onConnectionMessage=function(e){t.term.write(e.data)},t.onConnectionClose=function(){t.connected&&(t.conn.close(),t.connected=!1,t.term.write("connection cloesd"))},t.initTerminal=function(){var e=new z.FitAddon;t.term=new K.Terminal({fontSize:14,fontFamily:'Consolas, "Courier New", monospace',bellStyle:"sound",cursorBlink:!0}),t.term.loadAddon(e),t.term.open(document.getElementById("root")),t.debouncedFit=M()((function(){e.fit()}),100),t.debouncedFit(),window.addEventListener("resize",(function(){return t.debouncedFit()})),t.term.onData((function(e){return t.onTerminalSendString(e)})),t.term.onResize(t.onTerminalResize)},t.onTerminalSendString=function(e){t.connected&&t.conn.send(JSON.stringify({Op:"stdin",Data:e,Cols:t.term.cols,Rows:t.term.rows}))},t.onTerminalResize=function(){t.connected&&t.conn.send(JSON.stringify({Op:"resize",Cols:t.term.cols,Rows:t.term.rows}))};var a=t.props.match.params.namespace,o=t.props.match.params.pod,c=t.props.match.params.container;return t.connected=!1,a&&o&&c?t.ws_url="".concat(O.webSocket,"/ws/kubernetes/").concat(a,"/").concat(o,"/").concat(c):c&&(t.ws_url="".concat(O.webSocket,"/ws/docker/").concat(c)),t.initTerminal(),t}return Object(m.a)(n,e),Object(s.a)(n,[{key:"componentDidMount",value:function(){this.initConnection()}},{key:"componentWillUnmount",value:function(){var e=this;window.removeEventListener("resize",(function(){return e.debouncedFit()})),this.conn&&this.connected&&this.conn.close(),this.term&&this.term.destroy()}},{key:"render",value:function(){return o.a.createElement("div",{id:"terminal"})}}]),n}(a.Component)),D=function(e){function n(){return Object(r.a)(this,n),Object(l.a)(this,Object(u.a)(n).apply(this,arguments))}return Object(m.a)(n,e),Object(s.a)(n,[{key:"render",value:function(){return o.a.createElement(d.a,null,o.a.createElement(h.c,null,o.a.createElement(h.a,{exact:!0,path:"/terminal/kubernetes/:namespace/:pod/:container",component:R}),o.a.createElement(h.a,{exact:!0,path:"/terminal/docker/:container",component:R}),o.a.createElement(h.a,{component:C})))}}]),n}(a.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));i.a.render(o.a.createElement(D,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))},47:function(e,n,t){var a;"http:"===window.location.protocol?a="ws://":"https:"===window.location.protocol&&(a="wss://");var o=a+window.location.host,c=window.location.origin;e.exports={api:c,webSocket:o}}},[[123,1,2]]]);
//# sourceMappingURL=main.fe6fc387.chunk.js.map