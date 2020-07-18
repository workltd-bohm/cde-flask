from app import *


@app.route('/dashborad')
def dashboard():
    print('Data posting path: %s' % request.path)
    if session.get('user'):
        pass
    else:
        return redirect('/login')
