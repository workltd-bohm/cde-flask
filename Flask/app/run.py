from app import app
import config as cfg

# CORS(app, resources={r"/*": {"Access-Control-Allow-Origin": "*"}})


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


if __name__ == '__main__':
    # Bind to PORT if defined, otherwise default to 5000.
    app.run(host='0.0.0.0', port=cfg.config['basic'].PORT, debug=cfg.config['basic'].DEBUG)#, use_reloader=False)




