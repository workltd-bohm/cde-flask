from app import *


@app.route('/dashborad')
def dashboard():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if not main.IsLogin(): return redirect('/login')
    return redirect('/')

