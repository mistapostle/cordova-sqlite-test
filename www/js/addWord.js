 (function() {
     alert('g');

     function loadJamAddDict() {
         Kii.initializeWithSite("20d948e8", "2f2b0e2ba0c9f1dbc85020c83c625021", KiiSite.CN);
         window.jamAddDict = {
             isInited: false,
             init: function() {
                 var username = "kroot";
                 var password = "clientEsiwksa";

                 KiiUser.authenticate(username, password, {
                     // Called on successful registration
                     success: function(theUser) {
                         // Print some info to the log
                         console.log("User authenticated!");
                         console.log(theUser);

                         jamAddDict.isInited = true;
                         jamAddDict.addWord();

                     },
                     // Called on a failed authentication
                     failure: function(theUser, errorString) {
                         // Print some info to the log
                         alert("Error authenticating: " + errorString);
                     }
                 });
             },
             addWord: function() {
                 var appBucket = Kii.bucketWithName("words");

                 var obj = appBucket.createObject();
                 var name = $(".wordbook-js > .keyword").text();
                 var yinbiao = $(".pronounce > .phonetic").text();
                 var meaning = $(".trans-container").html();
                 obj.set("name", name);
                 obj.set("yinbiao", yinbiao);
                 obj.set("meaning", meaning);

                 if (confirm(name + "\nYinbiao:\n" + yinbiao + "\nMeaning:\n" + meaning)) {
                     var clause1 = KiiClause.equals("name", name);
                     var query = KiiQuery.queryWithClause(clause1);
                     query.setLimit(1);
                     appBucket.executeQuery(query, {
                         success: function(queryPerformed, resultSet, nextQuery) {
                             if (resultSet && resultSet.length> 0 ) {
                                 alert("already exists");
                                 console.log("resultSet", resultSet);
                             } else {
                                 var obj = appBucket.createObject();
                                 var name = $(".wordbook-js > .keyword").text();
                                 var yinbiao = $(".pronounce > .phonetic").text();
                                 var meaning = $(".trans-container").html();
                                 obj.set("name", name);
                                 obj.set("yinbiao", yinbiao);
                                 obj.set("meaning", meaning);
                                 obj.save({
                                     success: function(theObject) {
                                         console.log("Object saved!");
                                         console.log(theObject);
                                         alert("ok");
                                     },
                                     failure: function(theObject, errorString) {
                                         console.log("Error saving object: " + errorString);
                                         alert("errorString:" + errorString);
                                     }
                                 });
                             }
                         },
                         failure: function(queryPerformed, anErrorString) {
                             alert("get error while query" + anErrorString)
                             console.log(anErrorString);
                         }
                     })



                 }
             }
         };
     }

     function go() {
         if (window.jamAddDict === undefined) {
             //$('head').append('<script src="http://127.0.0.1:9994/js/addWord.js" type="text/javascript"></script>')
             loadJamAddDict();

         }

         if (!jamAddDict.isInited) {
             jamAddDict.init();
         } else {
             jamAddDict.addWord();
         }
     }

     if (window.Kii === undefined) {
         //$('head').append('<script src="http://127.0.0.1:9994/lib/KiiSDK.js" type="text/javascript"></script>');
         $.getScript("http://127.0.0.1:9994/lib/KiiSDK.js")
             .done(function(script, textStatus) {
                 console.log(textStatus);
                 go();

             })
             .fail(function(jqxhr, settings, exception) {
                 $("div.log").text("Triggered ajaxError handler.");
             });
         return;
     } else {
         go();
     }

 })()
