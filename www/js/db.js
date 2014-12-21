/*
var db = openDatabase( 'ww2',
        '1.0', // DB version
        'WW2 database', // DB display name
        5 * 1024 * 1024);
db.transaction(function(tx) {
    tx.executeSql("select * from Word", [],function(tx, results) {
        console.log(results.rows.item(0).meaning)
    });
});

db.transaction(function(tx) {
    tx.executeSql("delete * from Word");
    tx.executeSql("delete * from WTask");
})

var w1 = WDB.addWord( "Prey",
          "<p>Vi.<br>捕食</p><p>N.<br>猎物</p>",
          "[pre]");
WDB.addTingxieTask(w1);

var w2 = WDB.addWord( "Day", 
          "<p>N.<br>日</p>",
          "[De]");
WDB.addTingxieTask(w2);


chrome://settings/cookies

C:\jam\Ripple-UI-0.9.14\Ripple-UI-0.9.14>node bin/ripple emulate --path c:\jam\w
w2\www


{"DictWord":[{"name":"test","meaning":"name is name","dictId":null,"id":"AADBB30E0BEB4CF9BCBF2C2231E1ABE4"}]} 

persistence.db.implementation

*/


var WDB = (function() {
    var DictWord, Word, WTask, WTaskType ;

    function init() {
        persistence.store.cordovasql.config(
            persistence,
            'ww2',
            '1.0', // DB version
            'WW2 database', // DB display name
            //   10 * 1024 * 1024, // DB size
            0 // SQLitePlugin Background processing disabled
        );

        /*
        persistence.store.websql.config(
            persistence,
            'ww2',
            '0.0.3', // DB version
            'WW2 database', // DB display name
            5 * 1024 * 1024, // DB size
            0 // SQLitePlugin Background processing disabled
        );
        */
        //persistence.store.memory.config(persistence); 
        persistence.debug = true;
        DictWord = persistence.define('DictWord', {
            name: "TEXT",
            offSet: "INT",
            length:"INT",
            dictId: "INT"
        });
        DictWord.index("name");

        Word = persistence.define('Word', {
            name: "TEXT",
            meaning: "TEXT",
            yinbiao: "TEXT"
        });
        Word.index("name");

        WTask = persistence.define('WTask', {

            stage: "INT",
            taskType: "INT",
            lastReviewDate: "DATE",
            nextReviewDate: "DATE"
        });
        WTaskType = {
            Tingxie: 0
        };

        Word.hasMany("tasks", WTask, "word");
        WTask.index("taskType");
        WTask.index(["nextReviewDate", "taskType"]);
        persistence.schemaSync();

        WDB.DictWord = DictWord;
        WDB.Word = Word;
        WDB.WTask = WTask;
        WDB.WTaskType = WTaskType;
    }




    function _queryTaskByType(taskType) {
        return WTask.all()
            .filter("taskType", '=', taskType)
            .and(new persistence.PropertyFilter("stage", "!=", -2))
            .and(new persistence.PropertyFilter("nextReviewDate", "<", new Date()))
            .prefetch("word").order("nextReviewDate", true);
    }

    return {
        init: init,
       
        addTingxieTask: function(word) {
            var t = new WTask({
                word: word,
                stage: 0,
                taskType: WTaskType.Tingxie,
                nextReviewDate: new Date()
            });
            persistence.add(t);
            persistence.flush();
            return t;
        },
        flush: function(task) {
            persistence.flush();
        },
        addWord: function(name, meaning, yinbiao) {
            var w = new Word({
                name: name,
                meaning: meaning,
                yinbiao: yinbiao
            });
            persistence.add(w);
            persistence.flush();
            return w;
        },
        addDictWord: function(name, start, length, dictId) {
            var w = new DictWord({
                name: name,
                start: start,
                length: length,
                dictId: dictId
            });
            persistence.add(w);
            persistence.flush();
            return w;
        },
        lockupDictWord: function(name, callback ,limit,dictId) {
            if (!limit) limit = 20
            var ts = DictWord.all().filter("name", ">=", name)
            if (dictId)
                ts.and(new persistence.PropertyFilter("dictId", "=", dictId))

            ts.list(null, function(rs) {
                console.log("rs", rs);
                callback(rs);
            });
        },

        checkAndAddWordAndTingxieTask: function(name, meaning, yinbiao) {
            var self = this;
            this.queryWord(name, function(w) {
                if (!w) {

                    var word = self.addWord(name, meaning, yinbiao);
                    self.addTingxieTask(word);
                }
            })
        },
        queryCurrentTaskCount: function(taskType, callback) {
            var ts = _queryTaskByType(taskType);
            ts.count(null, function(c) {
                console.log("ok");
                callback(c);
            });
        },
        queryCurrentTask: function(taskType, callback) {
            var ts = _queryTaskByType(taskType);
            ts.list(null, function(rs) {
                console.log("rs" + rs);
                callback(rs);
            });
        },
        queryWord: function(name, callback) {

            Word.all().filter("name", "=", name).one(null, function(w) {
                console.log("w=" + w);
                callback(w);
            });
        },
        queryAllWord: function(callback) {

            Word.all().list(null, function(ws) {
                console.log("ws=" + ws);
                callback(ws);
            });
        },
        queryAllTask: function(callback) {

            WTask.all().list(null, function(ws) {
                console.log("ws=" + ws);
                callback(ws);
            });
        },
        removeAll: function() {
            WTask.all().destroyAll();
            Word.all().destroyAll();
            localStorage.removeItem("latestKiiWordCreatedAt");
        }
    }
})();
