from app import *


@app.route('/input')
def input():
    print('Data posting path: %s' % request.path)
    if session.get('user'):
        file = open('app/static/file/input.json', 'r').read()
        return file
    else:
        return redirect('/login')
