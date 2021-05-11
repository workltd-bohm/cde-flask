from app import *


@app.route('/dashboard')
def dashboard():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if not main.IsLogin(): return redirect('/login')
    return redirect('/')

