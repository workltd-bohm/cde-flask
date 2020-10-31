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
    # user.update({'project_code': 'SV', 'company_code': 'WRK'})
    username = session.get('user')['username']
    picture = session.get('user')['picture']
    id = session.get('user')['id']
    email = session.get('user')['email']
    menu = render_template("menu/menu.html", username=username, picture=picture)
    dashboard = render_template("dashboard/dashboard.html")
    activity = render_template("activity/activity.html", activity_name="BLANK")
    popup = render_template("popup/generic.html")
    preview = render_template("popup/preview.html")

    return render_template("index.html",
                           email=email,
                           menu=menu,
                           dashboard=dashboard,
                           activity=activity,
                           popup=popup,
                           preview=preview,
                           user=user)
