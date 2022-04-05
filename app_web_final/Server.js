
//////////////////////////////////////////////////////////////////// Définition de Variables et installation de modules utilisés ////////////////////////////////////////////////////////////
// la framework serveur qu'on va utiliser dans le projet
var express = require('express'); 
var app = express();


// fs sera utilisé pour lire / écrire .. et manipuler des fichiers 
var fs = require('fs');

// Path sera utilisé pour manipuler les chemins des fichiers manipulés
var path = require('path');

// Récupérer la durée d'un fichier .mp3
var getMP3Duration = require('get-mp3-duration') // npm install --save get-mp3-duration

// jsmediatags.read() est la fonction utilisée dans la suite, c'est pour récupérer les données ( tags ) d'un mp3 file
var jsmediatags = require('jsmediatags') 






function image_from_arr(picture){
    try {
        var base64String = "";
        for (var i = 0; i < picture.data.length; i++) {
            base64String += String.fromCharCode(picture.data[i]);
        }
        var dataUrl = "data:" + picture.format + ";base64," + Buffer.from(base64String, 'binary').toString('base64');
        return dataUrl;
        //return dataUrl;

    // Si erreur affichier l'image icon.png dans le fichier image
    }catch (error) {
        return "images/icon.png" 
    }
}


var db = [];
var chemin_music = "public/songs/";

//Extraire les tags ( nom de l'artist, titre, durée, image, ....) du fichier mp3 a l'aide de jsmediatags.read()
function get_tags(next, type, duration, callback){
    jsmediatags.read(next, {
        onSuccess: function(tag) {
            callback(next, type, tag.tags.artist, tag.tags.title, tag.tags.picture, duration);
        },
        onError: function(error) {
          console.log(':(', error.type, error.info);
        }

    });
}
// convet ms to minutes:secondes
function changer_en_ms(ms){
    var minutes = Math.floor(ms / 60000);
    var seconds = ((ms % 60000) / 1000).toFixed(0);
    var duration_ = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    return duration_
}
// fill db and write in JSON file in playlist.json
// fill db with : object with mp3's tags 
// write in JSON file playlist.JSON  
function Remplir_db(next, type, artist, title, picture, duration){
    file_name = path.parse(next).name; // name of the file without extension
    file = path.parse(next).base // name + extension
    path_name_split = file_name.split(" - ");

    if(artist == undefined){
        artist = path_name_split[0];
    }
    if(title == undefined){
        title = path_name_split[1];
    }

    var elem = {"type":type,"artist":artist,"title":title,"path":"/songs/"+file,"time":changer_en_ms(duration),"cover":image_from_arr(picture)};
    db.push(elem);
    write_JSON();
}

function write_JSON(){
    let donnees = JSON.stringify(db);
    fs.writeFile('./public/playlist.json', '', function(erreur) {
        if (erreur) {
            console.log(erreur)}
        }
    );
    fs.writeFile('./public/playlist.json', donnees, function(erreur) {
        if (erreur) {
            console.log(erreur)}
        }
    );
}

// Extraction des vidéos et audios qui existent dans le serveur et stockage de leurs noms dans un fichier JSON

function extraire(dir){

	var files = fs.readdirSync(dir);
    // fonction fs.readdirSync de Node.js
    // Prends un path, et renvoi des informations sur les fichiers qui existent dans ce path

	try {

        for (var x in files) {
                
            var next = path.join(dir,files[x]);
            
            if (fs.lstatSync(next).isDirectory()==true) {

                extraire(next);

            }
            else {
                var ext = path.extname(next); // extension of the file

                if (ext=='.mp3'){
                    buffer = fs.readFileSync(next);
                    duration = getMP3Duration(buffer);                
                    get_tags(next, "audio", duration, Remplir_db);
                }

            }
		
        }
    }

    catch (error) {

        console.log(error);

    }

    

    //console.log(db);
}


dir = __dirname;
extraire(dir);

// REQUETE GET pour afficher le contenu de index.html

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res, next){
    res.render('./public/index.html');
});




// Le serveur écoute sur le port 8080
app.listen(8080, function(){
    console.log(' The server is running on port 8080')
})