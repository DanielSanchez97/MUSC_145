var State = {
    playing: false,
    AccessToken: null,
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.state != null){
        if(!request.state){
            if(State.AccessToken == null){
                GetToken();
            }

            else{
                SendState();
            }
        }
    }
      
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
  
        if(request.message && request.time != null){
    
            
            if(request.time > 0){
                setTimeout(alertNewSong, request.time);
            }
        }
      
    }
);

function alertNewSong(){
    alert("new song");
}


function GetToken(){
    if(State.AccessToken != null){
        SendState();
    }
    
    else{
        $.ajax({
           type:"GET",
           url:"http://127.0.0.1:8080/tokens",
           success: function(data){ 
            State.AccessToken = data.Access;
            SendState();

           } ,
           error: function(jqXHR,textStatus, errorThrown){
               alert("failure");
           }

       });
    }
    
}


function SendToken(token){
    chrome.runtime.sendMessage({Access: token});
}

function SendState(){
    chrome.runtime.sendMessage({CurrentState: State});
}
