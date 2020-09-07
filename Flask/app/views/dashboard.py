from app import *


@app.route('/dashborad')
def dashboard():
    print('Data posting path: %s' % request.path)
    if not main.IsLogin(): return redirect('/login')
    return redirect('/')

