
var imagesPath="images/";var delayBetweenIcons=.1;var useRollover=true;var hoverScale=1.05;var speed=1;var playOnStart=true;var iconLinks=[];var tls=[];var tlsIdle=[];var tlsRollover=[];var tlsReverse=[];var tlsActive=[];var iconNames=[];var iconStyles=[];var thisIcons=[];var allIconsF=[];$(document).ready(function(){$(".animatedsvg").each(function(index,elem){var thisS=Snap(elem);for(var i=0;i<iconNames.length;i++){tlsActive[i]=false;if($(this).hasClass(iconNames[i])){var toLoad=iconNames[i];Snap.load(imagesPath+toLoad+".svg",function(f){thisS.attr({visibility:"hidden"});var appended=thisS.append(f);determineIcon(index,toLoad,appended,elem);});};};});});function makeVisible(appended,vis)
{appended.attr({visibility:vis});}
var currentWaypoints=0;function playWhenVisible(iconNum)
{currentWaypoints++;setTimeout(function(){tls[iconNum].play();currentWaypoints=0;},delayBetweenIcons*1000*currentWaypoints)}
function determineIcon(index,toLoad,f,elem)
{allIconsF[index]=f;setTimeout(function(){var thisIcon=f.select("#"+toLoad).node;thisIcons[index]=thisIcon;iconStyles[index]=thisIcon.style;if(window[toLoad]){window[toLoad](index,f,thisIcon);}
tls[index].stop();tlsRollover[index].stop();if(useRollover&&iconLinks[index]){thisIcon.addEventListener('click',function(){if(tlsActive[index]){window.location.href=iconLinks[index];}})
iconStyles[index].cursor="pointer";thisIcon.addEventListener('mouseenter',function(){if(tlsActive[index]){TweenLite.to(thisIcon,.5,{scale:hoverScale,transformOrigin:"50% 50%",ease:Elastic.easeOut});if(tlsRollover[index])
tlsRollover[index].restart();}});thisIcon.addEventListener('mouseleave',function(){if(tlsActive[index]){TweenLite.to(thisIcon,.5,{scale:1,transformOrigin:"50% 50%",ease:Elastic.easeOut});if(tlsRollover[index])
tlsRollover[index].restart();}});}
setTimeout(function(){makeVisible(f,"visible");},30);var waypoint=new Waypoint({element:elem,handler:function(){var thisWaypoint=parseInt(this.key.replace("waypoint-",""));playWhenVisible(thisWaypoint);},offset:'bottom-in-view'})},delayBetweenIcons*1000*index)}
function animationComplete(index,isActive)
{tlsActive[index]=isActive;if(isActive){if(tlsIdle[index])
tlsIdle[index].play();}else{if(tlsIdle[index])
tlsIdle[index].pause();}}
function restartIcons(iconToRestart)
{(function myLoop(i){setTimeout(function(){makeVisible(allIconsF[iconToRestart[iconToRestart.length-i]],"visible");tls[iconToRestart[iconToRestart.length-i]].restart();if(--i)myLoop(i);},delayBetweenIcons*1000)})(iconToRestart.length);}
function playIcons(iconToTweenIn)
{for(var i=0;i<iconToTweenIn.length;i++){tls[iconToTweenIn[i]].play();};}
function reverseIcons(iconsToReverse)
{for(var i=0;i<iconsToReverse.length;i++){tls[iconsToReverse[i]].reversed(!tls[iconsToReverse[i]].reversed())};}
function toIdle(iconsToIdle)
{for(var i=0;i<iconsToIdle.length;i++){if(tlsIdle[iconsToIdle[i]])
tlsIdle[iconsToIdle[i]].play();};}
var titleText="";var subtitleText="";var subtitleText2="";var buttonText="";var readMoreURL=["#","#"];var deskIconNames=["seobanner"];iconNames=iconNames.concat(deskIconNames);var easeVar=Circ;window['seobanner']=function(index,f,thisIcon)
{var desktopcomAnimation=new TimelineLite().from(f.select("#desktopcom").node,.9,{scaleY:0,transformOrigin:"bottom",ease:easeVar.easeOut}).from(f.select("#g1").node,1.0,{scaleY:0,transformOrigin:"bottom",repeat:-1,repeatDelay:5},.5).from(f.select("#g2").node,1.0,{scaleY:0,transformOrigin:"bottom",repeat:-1,repeatDelay:5},.5).from(f.select("#g3").node,1.0,{scaleY:0,transformOrigin:"bottom",repeat:-1,repeatDelay:5},.5).from(f.select("#g4").node,1.0,{scaleY:0,transformOrigin:"bottom",repeat:-1,repeatDelay:5},.5).from(f.select("#g5").node,1.0,{scaleY:0,transformOrigin:"bottom",repeat:-1,repeatDelay:5},.5).from(f.select("#g6").node,1.0,{scaleY:0,transformOrigin:"bottom",repeat:-1,repeatDelay:5},.5).from(f.select("#gline").node,1.0,{alpha:0,repeat:-1,repeatDelay:5},.5)
var gear2Animation=new TimelineLite().from(f.select("#gear2").node,0.6,{alpha:0,repeat:-1,yoyo:true,repeatDelay:0.3},"0")
var wrench1Animation=new TimelineLite().from(f.select("#wrench1").node,1.4,{alpha:0,repeat:-1,yoyo:true,repeatDelay:0.5},"0")
var localAnimation=new TimelineLite().from(f.select("#local").node,.1,{alpha:0,x:0,y:-17,ease:Circ.easeIn},1)
var tagAnimation=new TimelineLite().from(f.select("#tag").node,1.9,{scale:0,transformOrigin:"50% 50%",ease:Elastic.easeOut})
var keyAnimation=new TimelineLite().from(f.select("#key").node,1,{scale:0,transformOrigin:"50% 50%",ease:Elastic.easeOut}).from(f.select("#keyscale").node,0.7,{scale:0,transformOrigin:"50% 50%",ease:Elastic.easeOut,repeat:-1,repeatDelay:5},.5)
var linkAnimation=new TimelineLite().from(f.select("#link").node,2,{scale:0,transformOrigin:"50% 50%",ease:Elastic.easeOut}).to(f.select("#linkmove").node,2,{scale:1.3,transformOrigin:"center",repeat:-1,yoyo:true,repeatDelay:0},"1")
var mailAnimation=new TimelineLite().from(f.select("#mail").node,0.4,{y:70})
var sitemapAnimation=new TimelineLite().from(f.select("#sitemap").node,0.5,{scaleY:0,transformOrigin:"bottom",ease:easeVar.easeOut}).from(f.select("#p1").node,0.7,{scale:0,transformOrigin:"50% 50%",ease:Elastic.easeOut,repeat:-1,repeatDelay:8},.5).from(f.select("#line1").node,0.8,{scale:0,transformOrigin:"50% 50%",ease:Elastic.easeOut,repeat:-1,repeatDelay:8},.5).from(f.select("#p2").node,0.8,{scale:0,transformOrigin:"50% 50%",ease:Elastic.easeOut,repeat:-1,repeatDelay:8},.5).from(f.select("#line2").node,0.8,{scale:0,transformOrigin:"50% 50%",ease:Elastic.easeOut,repeat:-1,repeatDelay:8},.5)
var pencilAnimation=new TimelineLite().from(f.select("#pencil").node,0.7,{y:70})
var testspeedAnimation=new TimelineLite().from(f.select("#odometer").node,.3,{scale:0,transformOrigin:"50% 50%",ease:Elastic.easeOut}).from(f.select("#testspeed").node,0.7,{scale:0,transformOrigin:"50% 50%",ease:Elastic.easeOut,repeat:-1,repeatDelay:7},.5)
var webpageAnimation=new TimelineLite().from(f.select("#webpage").node,0.3,{y:70}).from(f.select("#webpagegraph").node,0.6,{alpha:0,repeat:-1,yoyo:true,repeatDelay:0.8},"0")
var searchAnimation=new TimelineLite().from(f.select("#search").node,0.6,{y:70}).to(f.select("#magnifier").node,1.4,{scale:1.3,transformOrigin:"center",repeat:-1,yoyo:true,repeatDelay:0},"1")
var ppcAnimation=new TimelineLite().from(f.select("#ppc").node,2,{scale:0,transformOrigin:"50% 50%",ease:Elastic.easeOut}).to(f.select("#ppcbig").node,2,{scale:1.3,transformOrigin:"center",repeat:-1,yoyo:true,repeatDelay:0},"1")
var mobileAnimation=new TimelineLite().from(f.select("#mobile").node,1,{scale:0,transformOrigin:"50% 50%",ease:Elastic.easeOut}).to(f.select("#gear").node,20,{rotation:360,transformOrigin:"50% 50%",repeat:-1,ease:Linear.easeNone},0)
var h1Animation=new TimelineLite().from(f.select("#h1").node,.2,{scaleY:0,transformOrigin:"bottom",ease:easeVar.easeOut})
var targetAnimation=new TimelineLite().from(f.select("#target").node,.3,{scaleY:0,transformOrigin:"bottom",ease:easeVar.easeOut}).from(f.select("#ring5").node,.3,{scale:0,transformOrigin:"50% 50%"}).from(f.select("#ring4").node,.3,{scale:0,transformOrigin:"50% 50%"},"-=.2").from(f.select("#ring3").node,.3,{scale:0,transformOrigin:"50% 50%"},"-=.2").from(f.select("#ring2").node,.3,{scale:0,transformOrigin:"50% 50%"},"-=.2").from(f.select("#ring1").node,.3,{scale:0,transformOrigin:"50% 50%"},"-=.2").from(f.select("#darts").node,.1,{alpha:0,x:15,y:-6,ease:Circ.easeIn},1)
var number1Animation=new TimelineLite().from(f.select("#number1").node,0.2,{y:70}).from(f.select("#star1").node,0.7,{scale:0,transformOrigin:"50% 50%",ease:Elastic.easeOut,repeat:-1,repeatDelay:7},.5)
var gear1Animation=new TimelineLite().from(f.select("#gear1").node,.2,{scaleY:0,transformOrigin:"bottom",ease:easeVar.easeOut}).to(f.select("#gear3").node,8,{rotation:-360,transformOrigin:"50% 50%",repeat:-1,ease:Linear.easeNone},0)
var circlegraphAnimation=new TimelineLite().from(f.select("#circlegraph").node,.4,{scale:0,transformOrigin:"50% 50%",ease:Quad.easeOut},"-=.2").to(f.select("#circlegraphrotate").node,10,{rotation:-360,transformOrigin:"50% 50%",repeat:-1,ease:Linear.easeNone},0)
var textAnimations=new TimelineLite();if(f.select("#maintitle")){f.select("#maintitle").node.textContent=titleText;textAnimations.from(f.select("#maintitle").node,.3,{alpha:0,ease:easeVar.easeOut});}
if(f.select("#subtitle")){f.select("#subtitle").node.textContent=subtitleText;textAnimations.from(f.select("#subtitle").node,.3,{alpha:0,ease:easeVar.easeOut},"-=.2");}
if(f.select("#subtitle2")){f.select("#subtitle2").node.textContent=subtitleText2;textAnimations.from(f.select("#subtitle2").node,.3,{alpha:0,ease:easeVar.easeOut},"-=.2");}
if(f.select("#readmorebutton")&&buttonText!=""){f.select("#buttontext").node.textContent=buttonText;textAnimations.from(f.select("#readmorebutton").node,.3,{alpha:0,ease:easeVar.easeOut,onComplete:function(){var readMoreLink=f.select("#readmorebutton").node;readMoreLink.style.cursor="pointer";readMoreLink.onmouseover=function(){TweenMax.to(readMoreLink,0.2,{opacity:.5});}
readMoreLink.onmouseout=function(){TweenMax.to(readMoreLink,0.2,{opacity:1});}
readMoreLink.addEventListener("click",function(){window.location.href=readMoreURL[index];},false);}},"-=.2");}else{f.select("#readmorebutton").attr({visibility:"hidden"});}
var tl=new TimelineLite({onStart:animationComplete,onStartParams:[index,true],onReverseComplete:animationComplete,onReverseCompleteParams:[index,false]}).add(desktopcomAnimation,0.6).add(gear1Animation,.6).add(wrench1Animation,.9).add(localAnimation,.6).add(tagAnimation,.8).add(keyAnimation,.8).add(linkAnimation,.9).add(mailAnimation,.6).add(sitemapAnimation,.4).add(pencilAnimation,.6).add(testspeedAnimation,.8).add(webpageAnimation,.6).add(searchAnimation,.6).add(ppcAnimation,1.1).add(mobileAnimation,.6).add(h1Animation,.8).add(targetAnimation,1.3).add(number1Animation,.6).add(gear2Animation,1.1).add(circlegraphAnimation,.6).add(textAnimations,.3).timeScale(speed);tls[index]=tl;var tlRollover=new TimelineLite();tlsRollover[index]=tlRollover;}