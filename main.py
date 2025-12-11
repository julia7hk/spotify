import os

from flask import Flask

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)    # temp random key

# in .env file
# client_id
# client_secret
# redirect_uri

scope = 'playlist-read-private'

# multiple scopes
# scope = 'playlist-read-private,streaming' 

if __name__ == '__main__':
    app.run(debug=True)