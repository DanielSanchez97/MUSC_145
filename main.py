import json
from flask import Flask, request, redirect, g, render_template, jsonify
import requests
import base64
from urllib.parse import quote
# Authentication Steps, paramaters, and responses are defined at https://developer.spotify.com/web-api/authorization-guide/
# Visit this url to see all the steps, parameters, and expected response. 


app = Flask(__name__, static_url_path='/static')

#  Client Keys
CLIENT_ID = "9f4f25b8b8df489e9057ce78e7eea953"
CLIENT_SECRET = "3d397fc9f6e143c48aaead9b3ecbaff6"

# Spotify URLS
SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_BASE_URL = "https://api.spotify.com"
API_VERSION = "v1"
SPOTIFY_API_URL = "{}/{}".format(SPOTIFY_API_BASE_URL, API_VERSION)


# Server-side Parameters
CLIENT_SIDE_URL = "http://127.0.0.1"
PORT = 8080
REDIRECT_URI = "{}:{}/callback/q".format(CLIENT_SIDE_URL, PORT)
SCOPE = "user-read-currently-playing playlist-read-private user-read-playback-state "
STATE = ""
SHOW_DIALOG_bool = True
SHOW_DIALOG_str = str(SHOW_DIALOG_bool).lower()


auth_query_parameters = {
    "response_type": "code",
    "redirect_uri": REDIRECT_URI,
    "scope": SCOPE,
    # "state": STATE,
    # "show_dialog": SHOW_DIALOG_str,
    "client_id": CLIENT_ID
}

ACCESS_TOKEN =0
REFRESH_TOKEN =0 

@app.route("/")
def index():
    # Auth Step 1: Authorization
    url_args = "&".join(["{}={}".format(key, quote(val)) for key,val in auth_query_parameters.items()])
    auth_url = "{}/?{}".format(SPOTIFY_AUTH_URL, url_args)
    return redirect(auth_url)


@app.route("/callback/q")
def callback():
    global ACCESS_TOKEN
    global REFRESH_TOKEN
    # Auth Step 4: Requests refresh and access tokens
    auth_token = request.args['code']
    code_payload = {
        "grant_type": "authorization_code",
        "code": str(auth_token),
        "redirect_uri": REDIRECT_URI,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET
    }
  

    post_request = requests.post(SPOTIFY_TOKEN_URL, data=code_payload)
    
    

    # Auth Step 5: Tokens are Returned to Application
    response_data = json.loads(post_request.text)
    ACCESS_TOKEN = response_data["access_token"]
    REFRESH_TOKEN = response_data["refresh_token"]
    token_type = response_data["token_type"]
    expires_in = response_data["expires_in"]

    # Auth Step 6: Use the access token to access Spotify API
    authorization_header = {"Authorization":"Bearer {}".format(ACCESS_TOKEN)}

    # Get profile data
    user_profile_api_endpoint = "{}/me".format(SPOTIFY_API_URL)
    profile_response = requests.get(user_profile_api_endpoint, headers=authorization_header)
    profile_data = json.loads(profile_response.text)

    # Get user playlist data
    playlist_api_endpoint = "{}/playlists".format(profile_data["href"])
    playlists_response = requests.get(playlist_api_endpoint, headers=authorization_header)
    playlist_data = json.loads(playlists_response.text)
    
    # Combine profile and playlist data to display
    display_arr = [profile_data] + playlist_data["items"]
    
    return app.send_static_file('testing.html')

@app.route('/tokens')
def tokens():
    global ACCESS_TOKEN
    global REFRESH_TOKEN
    if (ACCESS_TOKEN != 0 and REFRESH_TOKEN != 0):
        response = {'Access': ACCESS_TOKEN, 'refresh': REFRESH_TOKEN}
        return jsonify(response)
    
    else:
        return jsonify(False)



if __name__ == "__main__":
    app.run(debug=True,port=PORT)
 