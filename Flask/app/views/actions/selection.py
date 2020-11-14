from app import *
import os
import zipfile
import shutil
from threading import Thread
import time


@app.route('/set_color_multi', methods=['POST'])
def set_color_multi():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        dirs.set_project_data(request_data, True)
        project_name = session.get("project")["name"]
        print(request_data)
        if db.connect(db_adapter):
            result = ''
            for req in request_data:
                color_change = {
                    "project_name": project_name,
                    "ic_id": req["ic_id"],
                    "color": req["color"],
                }
                result = db.change_color(db_adapter, color_change)
            if result:
                resp = Response()
                resp.status_code = result["code"]
                resp.data = result["message"]
                return resp
        else:
            print(str(msg.DB_FAILURE))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/copy_multi', methods=['POST'])
def copy_multi():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        dirs.set_project_data(request_data, True)
        project_name = session.get("project")["name"]
        print(request_data)

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/move_multi', methods=['POST'])
def move_multi():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        dirs.set_project_data(request_data, True)
        project_name = session.get("project")["name"]
        print(request_data)

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_delete_ic_multi', methods=['POST'])
def get_delete_ic_multi():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        delete_ic_array = json.loads(request.get_data())
        dirs.set_project_data(delete_ic_array, True)
        print(delete_ic_array)
        if db.connect(db_adapter) and "multi" in delete_ic_array:
            user_id = session['user']['id']
            project_name = session.get("project")["name"]
            result = ''
            for delete_ic_data in delete_ic_array["multi"]:
                delete_ic_data['user_id'] = user_id
                delete_ic_data['project_name'] = project_name
                result = db.delete_ic(db_adapter, delete_ic_data)
            if result:
                print(result["message"])
                resp = Response()
                resp.status_code = result["code"]
                resp.data = result["message"]
                return resp
            else:
                print("not_successful - name already exists in the DB")

        else:
            print(str(msg.DB_FAILURE))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/share_multi', methods=['POST'])
def share_multi():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        project_name = session.get("project")["name"]
        print(request_data)

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_ic_multi/<path:json_obj>', methods=['POST', 'GET'])
def get_ic_multi(json_obj):
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        request_data = json.loads(json_obj)
        project_name = session.get("project")["name"]
        print(request_data)
        if db.connect(db_adapter):
            u = session['user']
            response = db.get_project(db_adapter, project_name, u)
            project = Project.json_to_obj(response)
            path = os.getcwd() + '\\'
            millis = int(round(time.time() * 1000))
            try:
                if not os.path.exists(path + 'tmp\\'):
                    os.mkdir(path + 'tmp\\')
                if not os.path.exists(path + 'tmp\\' + u['id'] + '_' + str(millis)):
                    os.mkdir(path + 'tmp\\' + u['id'] + '_' + str(millis))
                if not os.path.exists(path + 'tmp\\' + u['id'] + '_' + str(millis) + '\\BOHM_download'):
                    os.mkdir(path + 'tmp\\' + u['id'] + '_' + str(millis) + '\\BOHM_download')
            except OSError as err:
                print("Creation of the directory %s failed" % path + '\n' + err)
            for req in request_data:
                project.current_ic = None
                project.added = False
                ic = project.find_ic(req, req['ic_name'], project.root_ic)
                if ic:
                    path = os.getcwd() + '\\tmp\\' + u['id'] + '_' + str(millis) + '\\BOHM_download\\'
                    dirs.json_to_temp_folder_struct(path, ic)

            zipf = zipfile.ZipFile('tmp/' + u['id'] + '_' + str(millis) + '/BOHM_download.zip', 'w', zipfile.ZIP_DEFLATED)
            # zip_buffer.seek(0)
            print('Zipping: %s' % 'tmp/' + u['id'] + '_' + str(millis) + '/BOHM_download.zip')
            dirs.zipdir('tmp/' + u['id'] + '_' + str(millis) + '/BOHM_download', zipf)
            zipf.close()

            resp = send_file(os.getcwd() + '\\tmp\\' + u['id'] + '_' + str(millis) + '\\BOHM_download.zip',
                             mimetype='zip',
                             attachment_filename='BOHM_download.zip',
                             as_attachment=True)

            thread = Thread(target=dirs.remove_folder, kwargs={'path': os.getcwd() + '\\tmp\\' + u['id'] + '_' + str(millis)})
            thread.start()

            return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp
