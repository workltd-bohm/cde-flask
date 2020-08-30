from app import *


@app.route('/dashborad')
def dashboard():
    print('Data posting path: %s' % request.path)
    if session.get('user'):
        return redirect('/')
    else:
        return redirect('/login')

@app.route('/generic_sub', methods=["POST"])
def generic_sub():
    request_data = {}
    print('Data posting path: %s' % request.path)
    try:
        request_data = json.loads(request.get_data())
    except:
        return "405"
    if session.get('user'):
        print(">", request_data)
    return request_data
