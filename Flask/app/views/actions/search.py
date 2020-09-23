from app import *

import app.views.actions.getters as gtr

def filter_out(request_json, files):
    filtered = []
    for file in files:
        diff = False
        for (key, value) in request_json.items():
            if value and getattr(file, key) != value:
                diff = True
                break
        if not diff:
            filtered.append(file)

    return filtered


@app.route('/get_filtered_files', methods=['POST', 'GET'])
def get_filtered_files():
    print('Data posting path: %s' % request.path)
    project_name = request.args.get('project_name')
    request_json = app.test_json_request_get_filtered_files
    if request.get_data(): request_json = json.loads(request.get_data())
    print(request_json)
    resp = Response()
    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_project(db_adapter, project_name, session['user'])
            files = []
            p = Project.json_to_obj(result)
            p.extract_files(p.root_ic, files)
            filtered = filter_out(request_json, files)

            res = [file.to_json()['name'] + file.to_json()['type'] for file in filtered]

            response = {
                'html': render_template("activity/filter_results.html",
                                        filtered=res
                                        ),
                'data': []
            }
            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps(response)
            return resp
        else:
            print(str(msg.DB_FAILURE))

            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp


@app.route('/get_filter_activity', methods=['GET'])
def get_filter_activity():
    resp = Response()
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        filter_file = gtr.get_input_file_fixed()
        response = {
            'html': render_template("activity/filter_activity.html",
                                    inputs=filter_file
                                    ),
            'data': []
        }
        # print(response)
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp
