import os
import json
import uuid

from app import *


@app.route('/input')
def input():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        file = open('app/static/file/input.json', 'r').read()
        return file

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_project')
def get_project():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        request_data = app.test_json_request_project  # json.loads(request.get_data())
        project_name = request_data['project_name']
        user = request_data['user']

        if db.connect(db_adapter):
            result = db.get_project(db_adapter, project_name, user)
            if result:
                project = Project(result['project_id'], result['project_name'], Project.json_folders_to_obj(result['root_ic']))
                return project.to_json()
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

