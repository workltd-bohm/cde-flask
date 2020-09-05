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

# @app.route('/data/<path:sen_path>', methods = ['POST'])
# def data(sen_path):
#     print('Data posting path: %s' %request.path)
#     json_data = json.loads(request.get_data())
#     print('POST data: %s ' %json_data)
#     if json_data['Sensor-ID'] in running_sensors:
#         sensor = running_sensors[json_data['Sensor-ID']]
#         sensor.set_is_active(True)
#         sensor.update_time(int(round(time.time())))
#
#         latest_data = SensorData(json_data['Data'], json_data['Timestamp'])
#         sensor.set_latest_data(latest_data)
#
#         resp = Response(status=200)
#         resp.status_code = 200
#
#     else:
#         resp = Response(status=400)
#         resp.status_code = 400
#         resp.data = "Sensor with Sensor-ID: %s, is not registered." %json_data['Sensor-ID']
#
#     return resp