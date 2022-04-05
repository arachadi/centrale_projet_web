// some global variables
var data_music;
var title = document.getElementById("title");
var artist = document.getElementById("artist");
var image = document.getElementById("img_track");
var audio = document.getElementById('audio');
var source = document.getElementById('audioSource');
var index_current = 0;


// Récupérer le fichire JSON 
function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('GET', path);
    httpRequest.send(); 
}

//Remplacer les caracteres specials
function escapeHtml(str)
{
    var map =
    {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, function(m) {return map[m];});
}

//function to play song from index
// changement d'arriere plan de <tr>
function play_music(index,elem){
    index_current = index;
    audio.loop = false;
    music = data_music[index];
    title.innerText = music["title"];
    artist.innerText = music["artist"];
    image.style.backgroundImage = "url("+music["cover"]+")"
    

    if(elem){
      var alltr = document.getElementsByTagName("tr");
      var ref = document.getElementsByClassName("fa-refresh");
      for (var i = 0; i < ref.length; i++) {
        ref[i].style.color = '#fff';
      }
      for (var i = 0; i<alltr.length; i++) {
          alltr[i].style.background = "none";
      }
      elem.style.background = "#100f0f";
    }

    source.src = music["path"];

    audio.load(); //preload audio
    audio.play(); //play audio
}

// function to activate repeat feature
function onrepeat(ele){
  if(!audio.loop){
    audio.loop = true;
    ele.style.color = "#00c546";
  }else if(audio.loop == true){
    ele.style.color = "#fff";
    audio.loop = false;
  }else{
    audio.loop = true;
    ele.style.color = "#00c546";
  }
}

// Remplir le tableau des musiques
function read_music(){
    for (var i=0; i<data_music.length; i++) {
        table_body.innerHTML += '<tr onclick="play_music('+i+',this)" id="tr'+i+'"><th scope="row">'+(i+1)+'</th><td>'+escapeHtml(data_music[i].artist)+'</td><td>'+escapeHtml(data_music[i].title)+'</td><td><i class="fa fa-refresh" aria-hidden="true" onclick="event.stopPropagation();onrepeat(this);"></i></td><td>'+escapeHtml(data_music[i].time)+'</td></tr>';
    }
}

// prends le JSON envoyé par le serveur, et lit la musique
fetchJSONFile('playlist.json', function(data){
    data_music = data;
    read_music();
    var first_tr = document.getElementById("tr0");
    play_music(0,first_tr);
});

// Si la musique est finie, passer a la suivante, si le bouton replay est activé, la musique est repétée
audio.addEventListener('ended',function(){
  if(audio.loop!=true){
    var next_tr = document.getElementById("tr"+(index_current+1));
    var first_tr = document.getElementById("tr0");
    if(next_tr){
      play_music(index_current+1,next_tr);
    }else{
      play_music(0,first_tr);
    }
  }
});





// search songs in table
function search() {
    var input, filter, table, tr, a, i, txtValue;
    input = document.getElementById("search");
    filter = input.value.toUpperCase();
    table = document.getElementById("table_body");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td0 = tr[i].getElementsByTagName("td")[0];
        td1 = tr[i].getElementsByTagName("td")[1];
        
        txtValue = td0.textContent + td1.textContent;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
        } else {
            tr[i].style.display = "none";
        }
    }
}
