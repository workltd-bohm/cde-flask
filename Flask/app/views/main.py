from app import *


@app.route('/')
def index():
    print('Data posting path: %s' % request.path)
    if session.get('user'):
        user = session.get('user')
        user.update({'project_code': 'SV', 'company_code': 'WRK'})
        username = session['user']['username']
        id = session['user']['id']
        email = session['user']['email']
        menu = render_template("menu/menu.html", username=username)
        dashboard = render_template("dashboard/dashboard.html")
        activity = render_template("activity/activity.html", activity_name="BLANK")
        file_input_popup = render_template("popup/file_input_popup.html", project="BLANK")
        new_folder_popup = render_template("popup/new_folder_popup.html", project="BLANK")
        new_project_popup = render_template("popup/new_project_popup.html", project="BLANK")
        choose_project_popup = render_template("popup/choose_project_popup.html", project="BLANK")
        rename_popup = render_template("popup/rename_popup.html", project="BLANK")
        return render_template("index.html",
                               email=email,
                               menu=menu,
                               dashboard=dashboard,
                               activity=activity,
                               file_input_popup=file_input_popup,
                               new_folder_popup=new_folder_popup,
                               new_project_popup=new_project_popup,
                               choose_project_popup=choose_project_popup,
                               rename_popup=rename_popup,
                               user=user)
    else:
        return redirect('/login')

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