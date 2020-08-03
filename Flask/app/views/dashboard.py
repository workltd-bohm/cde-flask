from app import *


@app.route('/dashborad')
def dashboard():
    print('Data posting path: %s' % request.path)
    if session.get('user'):
        return redirect('/')
    else:
        return redirect('/login')
