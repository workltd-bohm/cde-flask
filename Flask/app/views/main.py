from app import *
from datetime import timedelta
import os


def IsLogin():
    # session.permanent = True
    app.permanent_session_lifetime = timedelta(days=3)
    # print('IsLogin()', session['project'])
    if session.get('user'):
        return True
    return False


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'img/brush2.png',
                               mimetype='img/brush2.png')


@app.route('/')
def index():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    
    if not IsLogin(): return redirect('/login')
    
    user = session.get('user')
    # user.update({'project_code': 'SV', 'company_code': 'WRK'})
    username = session.get('user')['username']
    picture = session.get('user')['picture']
    id = session.get('user')['id']
    email = session.get('user')['email']

    # views
    menu =      render_template("menu/menu.html", username=username, picture=picture)
    dashboard = render_template("dashboard/dashboard.html")
    activity =  render_template("activity/activity.html", activity_name="BLANK")
    popup =     render_template("popup/generic.html")
    preview =   render_template("popup/preview.html")

    return render_template("index.html",
                           email =      email,
                           menu =       menu,
                           dashboard =  dashboard,
                           activity =   activity,
                           popup =      popup,
                           preview =    preview,
                           user =       user,
                           sign =       user['username'][0]
                           )
