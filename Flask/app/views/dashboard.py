from app import *


@app.route('/dashborad')
def dashboard():
    print('Data posting path: %s' % request.path)
    if not main.IsLogin(): return redirect('/login')
    return redirect('/')


@app.route('/generic_sub', methods=["POST"])
def generic_sub():
    print('Data posting path: %s' % request.path)
    if not main.IsLogin(): return redirect('/login')
    request_data = {}
    try:
        request_data = json.loads(request.get_data())
    except:
        return "405"
    if session.get('user'):
        print(">", request_data)
    return request_data
