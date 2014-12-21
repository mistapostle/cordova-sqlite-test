var TaskService = {
    tingxieSechudle: [5, 30, 12 * 60, 24 * 60, 2 * 24 * 60, 4 * 24 * 60, 7 * 24 * 60, 15 * 24 * 60, 30 * 24 * 60],
    taskReviewDone: function(task) {
        if (task.taskType == WDB.WTaskType.Tingxie) {

            if (task.stage < this.tingxieSechudle.length) {
                task.nextReviewDate = new Date(new Date().getTime() + this.tingxieSechudle[task.stage] * 1000 * 60);

                task.stage++;
            } else {

                task.stage = -2;
            }
            task.lastReviewDate = new Date();
            WDB.flush();
        }
    },
    taskReviewFailed: function(task) {
        if (task.taskType == WDB.WTaskType.Tingxie) {

            if (task.stage > 0) {
                task.stage--;


            }
            task.nextReviewDate = new Date();

            task.lastReviewDate = new Date();
            WDB.flush();
        }
    }
}
var NotificationService = {
    add: function(numberofWords) {
        window.plugin.notification.local.add({
            id: 1008, // A unique id of the notifiction
            date: new Date(), // This expects a date object
            message: "背单词吧同学,就" + numberofWords + "个", // The message that is displayed
            title: "ww2", // The title of the message
            // repeat:     String,  // Has the options of 'secondly', 'minutely', 'hourly', 'daily', 'weekly', 'monthly', 'yearly'
            badge: numberofWords, // Displays number badge to notification
            sound: 'TYPE_ALARM', // A sound to be played
            //   json:       {action},  // Data to be passed through the notification
            autoCancel: false, // Setting this flag and the notification is automatically canceled when the user clicks it
            ongoing: true, // Prevent clearing of notification (Android only)
        });
    },
    cancel: function() {
        window.plugin.notification.local.cancel("1008");
    },
    init: function() {
        window.plugin.notification.local.onclick = function(id, state, json) {
            console.log('onclick notification');
            alert('ok')
        };

    }
}

var KiiSerivce = {
        isInited: false,
        init: function(callback) {
            Kii.initializeWithSite("20d948e8", "2f2b0e2ba0c9f1dbc85020c83c625021", KiiSite.CN);
            var username = "kroot";
            var password = "clientEsiwksa";

            KiiUser.authenticate(username, password, {
                // Called on successful registration
                success: function(theUser) {
                    // Print some info to the log
                    console.log("User authenticated!");
                    console.log(theUser);
                    KiiSerivce.isInited = true;
                    callback.apply();

                },
                // Called on a failed authentication
                failure: function(theUser, errorString) {
                    // Print some info to the log
                    alert("Error authenticating: " + errorString);
                }
            });
        },
        loadWords: function(cb) {
            if (!KiiSerivce.isInited) {
                KiiSerivce.init(function() {
                    KiiSerivce._loadWords(cb)
                });
            } else {
                KiiSerivce._loadWords(cb);
            }
        },
        _loadWords: function(cb) {
            var appBucket = Kii.bucketWithName("words");
            // Build "all" query
            var all_query = (localStorage.getItem("latestKiiWordCreatedAt") &&
                KiiQuery.queryWithClause(KiiClause.greaterThan("_created",
                    parseInt(localStorage.getItem("latestKiiWordCreatedAt"))))) || KiiQuery.queryWithClause();

            all_query.sortByAsc("_created");
            // Define the callbacks
            var total = 0;
            var queryCallbacks = {
                success: function(queryPerformed, resultSet, nextQuery) {
                    // do something with the results
                    for (var i = 0; i < resultSet.length; i++) {
                        var obj = resultSet[i];
                        console.log("to load :" + obj.get("name") + " , _created=" + obj.getCreated());
                        total++;
                        WDB.checkAndAddWordAndTingxieTask(obj.get("name"), obj.get("meaning"), obj.get("yinbiao"));

                        localStorage.setItem("latestKiiWordCreatedAt", obj.getCreated());
                    }
                    if (nextQuery != null) {
                        // There are more results (pages).
                        // Execute the next query to get more results.
                        appBucket.executeQuery(nextQuery, queryCallbacks);
                    } else {

                        cb();
                        alert("load finished , total " + total + " words get from Kii");
                    }
                },
                failure: function(queryPerformed, anErrorString) {
                    alert("query failed : " + anErrorString);

                }
            }

            // Execute the query
            appBucket.executeQuery(all_query, queryCallbacks);
        }

    } //end of KiiService 
DictService = {
    ids: {},
    names: {},
    lookupNameById: function(id) {
        if (!DictService.names.hasOwnProperty(id)) {
            DictService.names[id] = localStorage.getItem("dictNames/" + id);
        }
        return DictService.names[id];
    },
    lookupIdByName: function(name) {
        if (!DictService.ids.hasOwnProperty(name)) {
            DictService.ids[name] = localStorage.getItem("dictIds/" + name);
        }
        return DictService.ids[name];
    },
    lookupDictCount: function() {
        return localStorage.getItem("dictCount");
    },
    addDict: function(name) {
        var id = DictService.lookupIdByName(name);
        if (!id) {
            var count = DictService.lookupDictCount();
            if (!count) {
                count = 0;
            } else {
                count = parseInt(count);
            }
            count += 1;
            localStorage.setItem("dictCount", count);
            id = count;
            localStorage.setItem("dictIds/" + name, id);
            localStorage.setItem("dictNames/" + id, name);
            DictService.ids[name] = id;
            DictService.names[id] = name;
        }
        return id;
    },
    importDict: function(filePath,dictName) {
        var dictId = DictService.addDict(dictName);
         FileService.openFile(filePath, function _read(file){
            var reader = new FileReader();
            
            reader.onloadend = function(evt) {
                
                var content = evt.target.result;
                var lines = content.split('\n');
                content = null;
                evt.target.result = null;
                var len = lines.length;
                for(var i = 0 ; i < len ; i++){
                    var line = lines[i].split(',');
                    var word = line[0];
                    var offset = line[1];
                    var length = line[2];
                    WDB.addDictWord(word, offset,length, dictId);
                }
            };
            reader.readAsText(file);
        });


    }
}
FileService = (function(){
    function openFile(filePath, success, fail){
        function onSuccess(fileSystem) {
            console.log(fileSystem.name);
            fileSystem.root.getFile(filePath, null, gotFileEntry, onfail);
        }

        function gotFileEntry(fileEntry) {
            fileEntry.file(gotFile, onfail);
        }

        function gotFile(file) {
            success(file);
        }
 
        function onfail(evt) {
                alert(evt.target.error.code);
                if(fail) fail(evt);
            }
            //TODO check phonegap ready
            // request the persistent file system
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onSuccess, onfail);
    }
})()