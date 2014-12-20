(function() {
'use strict';

// animation exaple C:\jam\angular-1.2.21\angular-1.2.21\docs\examples\example-ngView-directive
var module = angular.module('myApp', ['ngRoute', 'ngAnimate']);

var isTTSReady = false;

function applyCommonScope($scope, $data) {
    $scope.pop = function() {
        $("div[ng-view]").removeClass("lowPage").addClass("upPage");
        $data.aclass = "lowPage"
            // alert("ok");
    };

    $scope.push = function() {
        $("div[ng-view]").removeClass("upPage").addClass("lowPage");
        $data.aclass = "upPage"
            //alert("ok");
    };

    //$scope.aclass = $data.aclass; 
    $data.aclass = "";
} 
function onDeviceReady() {
    try{
        NotificationService.init();
    }catch(err){
        console.error(err)
    }
    console.log("start");
    WDB.init();
    console.log("done");
    angular.bootstrap(document, ['myApp']);
}
if(document.onDeviceReady ){
    document.addEventListener(onInitEvent,onDeviceReady, false)
}else{
    $(onDeviceReady);
} 
var TingxieController = module.controller('TingxieController', function($scope, $data) {
    applyCommonScope($scope, $data);
    WDB.queryCurrentTask(WDB.WTaskType.Tingxie, function(tasks) {

        var taskLen = tasks.length;
        //$data.tasks = tasks;
        $scope.tasks = tasks;
        $scope.currentTaskIndex = 0;
        $scope.ct = tasks[0];

        function toNext() {
            $scope.currentTaskIndex++;
            if ($scope.currentTaskIndex < taskLen) {
                $scope.ct = tasks[$scope.currentTaskIndex];
                $scope.speak();
                $scope.reset();
            } else {
                $scope.isAllDone = true;
            }
        }
        $scope.iRemember = function() {
            TaskService.taskReviewDone($scope.ct);
            toNext();
        }
        $scope.iForget = function() {
            TaskService.taskReviewFailed($scope.ct);
            taskLen++;
            tasks.push($scope.ct);
            toNext();
        }

        $scope.speak = function() {
            if (isTTSReady) {
                tts.speak($scope.ct.word.name);
            } else {
                alert('tts is not ready');
            }
        }
        $scope.more = function() {
            //window.plugins.copy($scope.ct.word.name);
            cordova.exec(null, null, "Clipboard", "copy", [$scope.ct.word.name]);
        }
        $scope.$apply();
        $scope.speak();
        console.log("task[0].ct.word.name=" + tasks[0].word.name);
        //$scope.ons.navigator.pushPage('tingxie.html'); 

    });
    $scope.top = $(".view-animate").height();

    $scope.reset = function() {
        $scope.isShowMeaning = false;
        $scope.isShowName = false;
        $scope.isDrawing = true;
    }
    $scope.showAll = function() {
        $scope.isShowMeaning = true;
        $scope.isShowName = true;
        $scope.isDrawing = false;
    }

    $scope.reset();

})

var MasterController = module.controller('MasterController', function($scope, $data) {
    /*$scope.items = $data.items;  */
    applyCommonScope($scope, $data);
    $scope.timers = [];

    function init() {
        WDB.queryCurrentTaskCount(WDB.WTaskType.Tingxie, function(c) {

            $scope.tingxieCount = c;
            $scope.$apply();
            console.log("tingxieCount=" + c);
            if (c > 0)
                NotificationService.add(c, new Date());
        });

    }
    init();
    function delayInit(){
        setTimeout( init , 2000);
    }
    if (typeof(tts) !== 'undefined' && !isTTSReady) {
        tts.startup(function() {
            alert('tts ok');
            isTTSReady = true
        }, function(e) {
            alert('tts dead');
            console.log(e)
        });
    }

    $scope.showTingxie = function() {
        console.log("showTingxie");
        /*
        WDB.queryCurrentTask(WDB.WTaskType.Tingxie, function(tasks) {
            $data.tasks = tasks;
            console.log("task[0].ct.word.name=" + tasks[0].word.name);
            //$scope.ons.navigator.pushPage('tingxie.html');
            document.location.href="#/tingxie";
        });
        */
    }
    $scope.cancelNotification = function() {
        NotificationService.cancel();
    }
    $scope.importWords = function() {
        //Error: Invalid XML: <!DOCTYPE html>
        //https://bitbucket.org/mistapostle/workword/raw/f8b38fb675dd219d03678b1a687ca4e41807298c/data/2.xml
        //http://vdisk.weibo.com/s/ET_PJ08A01ws    http://www.filetolink.com/ddb721d063
        $.get("http://www.filetolink.com/download/?h=df68973e216528a404b8811bf4f05613&t=1412839210&f=ddb721d063", function(data) {
            var xml = $($.parseXML(data));
            var items = xml.find("item");
            items.each(function(index, item) {
                var i = $(item);
                var word = i.find('word').text();
                var meaning = i.find('trans').text();
                WDB.checkAndAddWordAndTingxieTask(word, meaning, i.find('phonetic').text());

            })
            init();
        });
    }
    $scope.importWordsFromKii = function() {
        KiiSerivce.loadWords(delayInit);

    }
    $scope.clearDB = function() {
        if (confirm("Are you sure to remove all data ?")){
            WDB.removeAll();
            delayInit();
        }
            

    }


    function addTimer() {
            $scope.timers.push(new Date());
            $scope.$apply()
        }
        //$scope.addTimer = function(){
        //setInterval(addTimer,1000*60);
        //}
    addTimer();

    $scope.import = function() {
            function onSuccess(fileSystem) {
                console.log(fileSystem.name);
                fileSystem.root.getFile("a.txt", null, gotFileEntry, fail);
            }

            function gotFileEntry(fileEntry) {
                fileEntry.file(gotFile, fail);
            }

            function gotFile(file) {
                //        readDataUrl(file);
                readAsText(file);
            }

            function readAsText(file) {
                var reader = new FileReader();
                reader.onloadend = function(evt) {
                    console.log("Read as text");
                    console.log(evt.target.result);
                };
                reader.readAsText(file);
            }

            function fail(evt) {
                    console.log(evt.target.error.code);
                }
                //TODO check phonegap ready
                // request the persistent file system
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onSuccess, fail);

        }
        /*
    $scope.showDetail = function(index) {
      var selectedItem = $data.items[index];
      $data.selectedItem = selectedItem;
      $scope.ons.navigator.pushPage('detail.html', {title : selectedItem.title});
    }*/
});

module.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/main', {
            templateUrl: 'partials/main.html',
            controller: 'MasterController'
        }).
        when('/tingxie', {
            templateUrl: 'partials/tingxie.html',
            controller: 'TingxieController'
        }).
        otherwise({
            redirectTo: '/main'
        });
    }
]);
module.factory('$data', function() {
    var data = {};

    data.words = [{
            name: "Prey",
            yinbiao: "[pre]",
            meaning: "<p>Vi.<br>捕食</p><p>N.<br>猎物</p>"
        }, {
            name: "Day",
            yinbiao: "[De]",
            meaning: "<p>N.<br>日</p>"
        }

    ];
    data.items = [{
        title: 'Item 1 Title',
        icon: 'comments-o',
        description: 'Item 1 Description'
    }, {
        title: 'Another Item Title',
        icon: 'desktop',
        description: 'Item 2 Description'
    }, {
        title: 'Yet Anoter Item Title',
        icon: 'heart-o',
        description: 'Item 3 Description'
    }];

    return data;
});




})();
