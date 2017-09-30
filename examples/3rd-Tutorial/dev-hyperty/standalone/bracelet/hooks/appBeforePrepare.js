var browserify = require('browserify');
var fs = require('fs');
var ncp = require('ncp').ncp;

function bundle(context, file_name, source, target){
    var Q = context.requireCordovaModule('q');
    var deferral = new Q.defer();

	var outFile = fs.createWriteStream(target + '/' + file_name);
    browserify(source + "/" + file_name)
    .transform("babelify", {presets: ["es2015"]})
    .bundle()
    .pipe(outFile);

	outFile.on('finish', function() {
	    //bundle.js has been written
        deferral.resolve();
    })

    return deferral.promise;
}

function copy(context, file_name, source, target){
    var Q = context.requireCordovaModule('q');
    var deferral = new Q.defer();

	var outFile = fs.createWriteStream(target + '/' + file_name);
    fs.createReadStream(source + '/' + file_name)
        .pipe(outFile);

	outFile.on('finish', function() {
	    //bundle.js has been written
        deferral.resolve();
    })

    return deferral.promise;
}

module.exports = function(context) {
    return bundle(context, 'app.js', 'src','www')
        .then(copy(context, 'index.html', 'src', 'www'))
        .then(copy(context, 'bracelet.js', 'src', 'www'))
        .then(ncp('src/templates', 'www/templates'));
}
