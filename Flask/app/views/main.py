from app import *

def IsLogin():
    if session.get('user'):
        return True
    return False

@app.route('/')
def index():
    print('Data posting path: %s' % request.path)
    if not IsLogin(): return redirect('/login')
    user = session.get('user')
    user.update({'project_code': 'SV', 'company_code': 'WRK'})
    username = session['user']['username']
    id = session['user']['id']
    email = session['user']['email']
    menu = render_template("menu/menu.html", username=username)
    dashboard = render_template("dashboard/dashboard.html")
    activity = render_template("activity/activity.html", activity_name="BLANK")
    popup = render_template("popup/generic.html")

    return render_template("index.html",
                            email=email,
                            menu=menu,
                            dashboard=dashboard,
                            activity=activity,
                            popup=popup,
                            user=user)
