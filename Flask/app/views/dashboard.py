from app import *


@app.route('/dashborad')
def dashboard():
    print('Data posting path: %s' % request.path)
    main.IsLogin()
    if session.get('user'):
        return redirect('/')
    else:
        return redirect('/login')


@app.route('/generic_sub', methods=["POST"])
def generic_sub():
    print('Data posting path: %s' % request.path)
    main.IsLogin()
    request_data = {}
    try:
        request_data = json.loads(request.get_data())
    except:
        return "405"
    if session.get('user'):
        print(">", request_data)
    return request_data
