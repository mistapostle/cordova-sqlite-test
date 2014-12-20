 var jamTouch = function() {

     console.log("this is inited");
      var touchStart = "mousedown";
     var touchLeave = "mouseleave";
     var touchCancel = "mouseleave";
     var touchEnd = "mouseup";
     var touchMove = "mousemove";

     var isTouch = false;
     if( 'ontouchstart' in document.documentElement ){
        isTouch = true;
        touchStart = "touchstart";
        touchLeave = "touchleave";
        touchCancel ="touchcancel";
        touchEnd = "touchend";
        touchMove = "touchmove"; 
        console.log("isTouch true")
     }
    

     var startX = 0,
         startY = 0,
         started = false;

     function getXY(e) {
         var r;
         if (isTouch) {
            console.log("e.originalEvent.touches"+ e.originalEvent.touches);

             var re = e.originalEvent.touches[0];
             console.log("re"+re + "re.pagex " + re.pageX +" re.screenX" + re.screenX + " re.clientX " + re.clientX );
             r = [re.pageX , re.pageY];
         }else{

         //r = [e.screenX , e.screenY]
             r = [e.pageX, e.pageY]
        }
         console.log(r);
         return r;
     }

     $("#inputZone").bind(touchStart, function(e) {
         console.log("touchStart");

         e.preventDefault();
         var p = getXY(e);
         startX = p[0], startY = p[1];
         started = true;
     });
     $("#inputZone").bind(touchMove, function(e) {
        e.preventDefault();
         if (started) {
             console.log("touchMove");
             var p = getXY(e);
             var tX = p[0],
                 tY = p[1];
             if (Math.abs(tX - startX) + Math.abs(tY - startY) > 2) {
                 //draw
                 var c = this;
                 var position = $(c).position();
                 // console.log(position.left);
                  console.log(position.top); 
                 var ctx = c.getContext("2d");
                 ctx.lineWidth = 2;
                 ctx.strokeStyle = "#FF0000";
                 ctx.beginPath();
                 ctx.moveTo(startX - position.left, startY - position.top);
                 ctx.lineTo(tX - position.left, tY - position.top);
                 ctx.stroke();
                 startX = tX, startY = tY;
             }
         }
     });

     function onTouchEnd(e) {

        e.preventDefault();
         started = false;
     }
     $("#inputZone").bind(touchLeave, function(e) {
         console.log("touchLeave");
         onTouchEnd(e);
     });
     $("#inputZone").bind(touchEnd, function(e) {
         console.log("touchEnd");
         onTouchEnd(e);
     });



     $(".touch-clear").bind("click", function(e) {
         console.log("click");
         var zone = $(" #inputZone")[0];
         var ctx = zone.getContext("2d"); // $(zone).width() ,$(zone).height() 
         console.log("w=" + $(zone).width(), " h=" + $(zone).height());
         ctx.clearRect(0, 0, $(zone).width(), $(zone).height());
     });
     /*
ctx.lineWidth = 4;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
      ctx.lineTo(touches[i].pageX, touches[i].pageY);
*/
     console.log("this is inited");
 }
