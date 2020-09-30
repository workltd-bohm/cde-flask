import os
import json
import uuid

from app import *

import app.views.actions.getters as gtr


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


@app.route('/get_upload_project')
def get_upload_project():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        response = {
            'html': render_template("popup/upload_folder_popup.html"),
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


@app.route('/get_new_folder', methods=['POST'])
def get_new_folder():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        project_name = session.get("project")["name"]
        print(request_data)
        if db.connect(db_adapter):
            result = db.get_project(db_adapter, project_name, session.get('user'))
            if result:
                response = {
                    'html': render_template("popup/new_folder_popup.html",
                            parent_path=request_data["parent_path"],
                            parent_id=request_data["parent_id"],
                            ic_id=request_data["ic_id"],
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

@app.route('/get_new_file', methods=['POST'])
def get_new_file():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        project_name = session.get("project")["name"]
        print(request_data)
        if db.connect(db_adapter):
            user = session.get('user')
            result = db.get_project(db_adapter, project_name, user)
            if result:
                filter_file = gtr.get_input_file_fixed()
                filter_file.pop('uniclass_2015', None)
                response = {
                    'html': render_template("popup/file_input_popup.html",
                            project_path=request_data["project_path"],
                            parent_id=request_data["parent_id"],
                            ic_id=request_data["ic_id"],
                            project_name=project_name,
                            project_code=user['project_code'],
                            company_code=user['company_code'],
                            is_file=request_data["is_file"],
                            inputs=filter_file
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

@app.route('/get_rename_ic', methods=['POST'])
def get_rename_ic():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        project_name = session.get("project")["name"]
        print(request_data)
        if db.connect(db_adapter):
            result = db.get_project(db_adapter, project_name, session['user'])
            if result:
                filter_file = gtr.get_input_file_fixed()
                response = {
                    'html': render_template("popup/rename_ic_popup.html",
                            parent_path=request_data["parent_path"],
                            parent_id=request_data["parent_id"],
                            ic_id=request_data["ic_id"],
                            project_name=project_name,
                            old_name=request_data["old_name"],
                            is_directory = True if request_data["is_directory"] else False,
                            inputs=filter_file
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

@app.route('/get_delete_ic', methods=['POST'])
def get_delete_ic():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        project_name = session.get("project")["name"]
        print(request_data)
        if db.connect(db_adapter):
            result = db.get_all_projects(db_adapter)
            if result:
                response = {
                    'html': render_template("popup/delete_ic_popup.html",
                            parent_path=request_data["parent_path"],
                            parent_id=request_data["parent_id"],
                            ic_id=request_data["ic_id"],
                            project_name=project_name,
                            delete_name=request_data["delete_name"],
                            is_directory = True if request_data["is_directory"] else False
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

@app.route('/get_share', methods=['GET'])
def get_share():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        # request_data = json.loads(request.get_data())
        project_name = session.get("project")["name"]
        # print(request_data)
        if db.connect(db_adapter):
            user = session.get('user')
            result = db.get_project(db_adapter, project_name, user)
            if result:
                print('>>>>>>>', result['project_id'])
                response = {
                    'html': render_template("popup/share_project.html",
                            project_id=result["project_id"]
                        ),
                    'data':[]
                }
                print('>>>>>>>', response)
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