var e=Object.defineProperty,t=Object.assign,s=(t,s,o)=>("symbol"!=typeof s&&(s+=""),s in t?e(t,s,{enumerable:!0,configurable:!0,writable:!0,value:o}):t[s]=o);import{P as o,a as n}from"./vendor.cc851aa9.js";!function(e=".",t="__import__"){try{self[t]=new Function("u","return import(u)")}catch(s){const o=new URL(e,location),n=e=>{URL.revokeObjectURL(e.src),e.remove()};self[t]=e=>new Promise(((s,r)=>{const i=new URL(e,o);if(self[t].moduleMap[i])return s(self[t].moduleMap[i]);const a=new Blob([`import * as m from '${i}';`,`${t}.moduleMap['${i}']=m;`],{type:"text/javascript"}),c=Object.assign(document.createElement("script"),{type:"module",src:URL.createObjectURL(a),onerror(){r(new Error(`Failed to import: ${e}`)),n(c)},onload(){s(self[t].moduleMap[i]),n(c)}});document.head.appendChild(c)})),self[t].moduleMap={}}}("/phaser-test/assets/");class r extends o.Scene{constructor(){super("preloader")}preload(){this.load.spritesheet("sokoban","/phaser-test/assets/sokoban_tilesheet.a7f7b83c.png",{frameWidth:64}),this.load.image("character","/phaser-test/assets/characters.abe55e0a.png"),this.load.image("concrete","/phaser-test/assets/concrete.b037b885.jpg")}create(){this.scene.start("game")}}class i extends o.Scene{constructor(){super("game"),s(this,"cursors"),s(this,"player"),this.player=null,this.playerSprites={}}init(){this.cursors=this.input.keyboard.addKeys({up:o.Input.Keyboard.KeyCodes.UP,down:o.Input.Keyboard.KeyCodes.DOWN,left:o.Input.Keyboard.KeyCodes.LEFT,right:o.Input.Keyboard.KeyCodes.RIGHT,space:o.Input.Keyboard.KeyCodes.SPACE,shift:o.Input.Keyboard.KeyCodes.SHIFT,up_alt:o.Input.Keyboard.KeyCodes.W,down_alt:o.Input.Keyboard.KeyCodes.S,left_alt:o.Input.Keyboard.KeyCodes.A,right_alt:o.Input.Keyboard.KeyCodes.D}),this.connection=this.registry.get("connection"),this.gameState=this.registry.get("gameState")}create(){this.scale;const e=this.connection.hostId;this.peerId=this.connection.peerId,this.add.tileSprite(0,0,1e3,1e3,"concrete"),this.add.text(6,6,"Game join code: "+e,{font:"12px Arial",fill:"#ffffff"}).setScrollFactor(0),this.renderPlayerSprites(),this.input.on("pointermove",(e=>{if(!this.player)return;const t=o.Math.Angle.Between(this.player.x,this.player.y,e.x+this.cameras.main.scrollX,e.y+this.cameras.main.scrollY);this.player.setRotation(t+Math.PI/2)}))}renderPlayerSprites(){const e=this.gameState.getPlayers();for(let t of e)this.playerSprites[t.id]?this.playerSprites[t.id].setX(t.x).setY(t.y).setTexture(t.texture).setRotation(t.rotation):(this.playerSprites[t.id]=this.physics.add.sprite(t.x,t.y,t.texture).setRotation(t.rotation),t.id===this.peerId&&(this.player=this.playerSprites[t.id],this.cameras.main.startFollow(this.player)))}updatePlayer(){let e={id:this.peerId,x:this.player.x,y:this.player.y,texture:this.player.texture.key,rotation:this.player.rotation};this.gameState.updatePlayer(e)}update(){if(!this.player)return;const e=200;this.cursors.left.isDown||this.cursors.left_alt.isDown?this.player.setVelocity(-200,0):this.cursors.right.isDown||this.cursors.right_alt.isDown?this.player.setVelocity(e,0):this.cursors.up.isDown||this.cursors.up_alt.isDown?this.player.setVelocity(0,-200):this.cursors.down.isDown||this.cursors.down_alt.isDown?this.player.setVelocity(0,e):this.player.setVelocity(0,0),this.updatePlayer(),this.renderPlayerSprites()}}const a=new class{constructor(){this.isHosting=null,this.guestConnections={},this.hostConnection=null,this.peerId=function(e=6){let t="";const s="abcdefghijklmnopqrstuvwxyz0123456789";for(let o=0;o<e;o++)t+=s.charAt(Math.floor(Math.random()*s.length));return t}(),this.hostId=null,this.peer=new n(this.peerId,{host:"richard-peerjs-server.herokuapp.com",port:443,path:"/",secure:!0}),this.peer.on("open",(e=>{this.peerId=e,console.log("Connection to server established. ID is: "+e)})),this.peer.on("error",(e=>{console.log("Error1: ",e),console.log("reconnecting"),this.peer.disconnect(),this.peer.reconnect()}))}async beginHosting(){console.error("hosting"),this.isHosting=!0,this.hostId=this.peerId,this.peer.on("connection",(async e=>{this.guestConnections[e.peer]=e,e.send("hello from host"),console.log("Connecting to peer "+e.peer),await this.setupConnectionHandlers(e),this.onGuestConnected&&this.onGuestConnected(e.peer,e.metadata)}))}async connectToHost(e,t){this.isHosting=!1,console.log("connecting to "+e),this.hostConnection=this.peer.connect(e,{metadata:t}),this.hostConnection.send("hello from guest"),this.hostId=this.hostConnection.peer,console.log("waiting for connection..."),await this.setupConnectionHandlers(this.hostConnection),this.onConnectedToHost&&this.onConnectedToHost(this.hostConnection.peer,this.hostConnection.metadata)}sendToHost(e){if(this.isHosting)throw new Error("Cannot send data to host if you are hosting");this.hostConnection.send(e)}sendToGuest(e,t){if(!this.isHosting)throw new Error("Cannot send data to guest if you are not the host");this.guestConnections[e].send(t)}sendToAllGuests(e){if(!this.isHosting)throw new Error("Cannot send data to guest if you are not the host");for(let t of Object.keys(this.guestConnections))this.guestConnections[t].open&&this.guestConnections[t].send(e)}async ensureConnectionOpen(e){return new Promise(((t,s)=>{e.open&&t(),console.log(e),e.on("open",(function(){console.log("Connection open"),t()})),e.on("error",(function(e){console.error("Connection error",e),s()})),this.peer.on("error",(e=>{console.error(e),s()}))}))}async setupConnectionHandlers(e){await this.ensureConnectionOpen(e),e.on("data",(e=>{console.log(e),this.onMessage&&this.onMessage(e)})),e.on("close",(()=>{console.error("Connection closed")}))}},c=new class{constructor(e){this.connection=e,this.setupConnectionHandlers(),this.state={players:{}}}onChange(){this.connection.isHosting?this.connection.sendToAllGuests({type:"game-state",data:this.state}):console.error("cannot sent data to all guests if you are not the host")}sendPlayerStateToHost(e){this.connection.isHosting?console.error("cannot sent player data to host if you are the host"):this.connection.sendToHost({type:"player-state",data:e})}setupConnectionHandlers(){this.connection.onGuestConnected=(e,t)=>{console.log("connected "+e),this.addPlayer(t)},this.connection.onMessage=e=>{switch(e.type){case"game-state":this.state=e.data;break;case"player-state":this.state.players[e.data.id]=e.data}}}addPlayer(e){this.state.players[e.id]=e,this.onChange()}getPlayers(){return Object.values(this.state.players)}updatePlayer(e){this.state.players[e.id]=t(t({},this.state.players[e.id]),e),this.connection.isHosting?this.onChange():this.sendPlayerStateToHost(this.state.players[e.id])}}(a);window.connection=a,window.gameState=c;const h={type:o.AUTO,width:800,height:600,parent:"game-container",physics:{default:"arcade",arcade:{gravity:{y:0}}},scale:{mode:o.Scale.FIT},scene:[r,i]};function l(){document.querySelector("#game-setup").style.display="none";const e=new o.Game(h);e.registry.set("connection",a),e.registry.set("gameState",c)}window.onload=function(){const e=document.querySelector("#username"),t=document.querySelector("#join-game-id"),s=document.querySelector("#join-button");document.querySelector("#host-button").addEventListener("click",(()=>{e.value?function(e){c.addPlayer({id:a.peerId,name:e,x:100,y:100,texture:"character",rotation:0}),a.beginHosting();const t=window.origin+window.pathname+"?gameId="+a.hostId;window.history.pushState({path:t},"",t),l()}(e.value):alert("Please enter a username")})),s.addEventListener("click",(()=>{e.value?t.value?async function(e,t){const s={id:a.peerId,name:e,x:200,y:200,texture:"character",rotation:0};try{await a.connectToHost(t,s),l()}catch(o){alert("could not connect to game ID "+t)}}(e.value,t.value):alert("Please enter a game ID to join"):alert("Please enter a username")}))};
//# sourceMappingURL=index.fbf3837e.js.map