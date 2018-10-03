var Playlist_Tracks = [];
var listening = false;
var accessToken; 
var correctIndex;
var currentState;
var timer;


$(document).ready(function() {
    
  chrome.runtime.sendMessage({state: false});
  

  chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.CurrentState.AccessToken != null){
        accessToken = request.CurrentState.AccessToken;
        GetPlaylistTracks();
        
        
        
        $("#start").click(GetCurrentData);
    }
  });

});


function GetToken(){
    console.log(randomString);
    $.ajax({
       type:"GET",
       url:"http://127.0.0.1:8080/tokens",
       success: function(data){ 
          console.log(data.Access);
          GetPlaylistTracks(data.Access);
          accessToken = data.Access;
       } ,
       error: function(jqXHR,textStatus, errorThrown){
           alert("failure");
       }
        
   });
    
}

    
var TrackName;
var Time_Remaining;
    
var PreviousTrack;
function GetCurrentData(){
    if(accessToken == null){
        GetToken();
    }
    else{
        $.ajax({
            type: "GET",
            url: 'https://api.spotify.com/v1/me/player',
            headers: {
                Authorization: 'Bearer ' + accessToken
            },
            success: function(data){

                if(data.is_playing){

                    TrackName = data.item.name;
                    Time_Remaining = data.item.duration_ms - data.progress_ms;

                    $('#time_remaining').text(Time_Remaining.toString());
                    $('#song_name').text(TrackName.toString());
                    GenerateQuestion(TrackName.toString(), Time_Remaining);
                }
            } 
        });
    }
}


function GenerateQuestion(correct_song, time){
    var random_songs = [];
    timer = time;
    $("#button_container").attr("hidden", true);
    
    $("#question").removeAttr("hidden");

    for(var i=0; i<4; i++){
        var placed = false;
       
        do{
            var random_index = Math.round((Math.random()*Playlist_Tracks.length));
            if( !random_songs.includes(Playlist_Tracks[random_index]) && !(Playlist_Tracks[random_index] === correct_song) ){
                random_songs[i] = Playlist_Tracks[random_index];
                placed= true;
            }
       
        }while(!placed)        
            
        $('#Q'+i.toString()).text(random_songs[i]);
        
        
        
    }
    correctIndex =  Math.round((Math.random()*3));
    $('#Q'+correctIndex.toString()).text(correct_song);
    
    $("#form").submit(function(e){
        e.preventDefault();
        console.log($("input[name=song_name]:checked").val())
        CheckCorrect( $("input[name=song_name]:checked").val() );
    });
    setTimeout(GetCurrentData, time);
    
        
}

function CheckCorrect(index){
    if(correctIndex != null){
        $('#form').attr("hidden", true);
        
        if(correctIndex == index){
            $('#message_container').attr('hidden', false);
            $('#message').text("Congrats you got it right");
        }
        
        else{
            $('#message_container').attr('hidden', false);
            $('#message').text("Congrats you got it right");
        
            $('#message').text("Not quite right!");
        }
    }
    
    SendAlertMessage(timer);
    
}
    
function GetPlaylistTracks(){
    if(accessToken != null){
        
        $.ajax({
            type:"GET",
            url: 'https://api.spotify.com/v1/me/playlists',
            headers:{
                Authorization: 'Bearer ' + accessToken
            },
            success: function(data){
                
                $.ajax({
                    type:"GET",
                    url: data.items[0].tracks.href,
                    headers:{
                        Authorization: 'Bearer ' + accessToken
                    },
                    success: function(tdata){
                        for(var i=0; i < tdata.items.length; i++){
                            Playlist_Tracks[i] = tdata.items[i].track.name;
                        }
                        GetCurrentData(accessToken);
                    }

                });
            }
        });
    }
    
    
}

function SendAlertMessage(rtime){
    chrome.runtime.sendMessage({message: true, time: rtime});
}
               
