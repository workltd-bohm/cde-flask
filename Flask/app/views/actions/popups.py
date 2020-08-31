import os
import json
import uuid

from app import *


@app.route('/get_all_projects')
def get_all_projects():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_all_projects(db_adapter)
            if result:
                response = {'data':[]}
                response['html'] = render_template("popup/choose_project_popup.html")
                for project in result:
                    response['data'].append(project['project_name'])
                print(">>>", response)
                resp = Response()
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps(response)
                return resp
            else:
                print("not_found")
        else:
            print(str(msg.DB_FAILURE))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_new_project')
def get_new_project():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        response = {
            'html': render_template("popup/new_project_popup.html"),
            'data':[]
        }
        print(response)
        resp = Response()
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_new_folder', methods=['GET', 'POST'])
def get_new_folder():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        project_name = app.test_json_request_project['project_name']
        print(request_data)
        if db.connect(db_adapter):
            result = db.get_all_projects(db_adapter)
            if result:
                response = {
                    'html': render_template("popup/new_folder_popup.html",
                            parent_path=request_data["parent_path"],
                            project_name=project_name,
                        ),
                    'data':[]
                }
                resp = Response()
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps(response)
                return resp
            else:
                print("not_found")

        else:
            print(str(msg.DB_FAILURE))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp