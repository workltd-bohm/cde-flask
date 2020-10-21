import os
import io
import json
import uuid
from datetime import datetime
import zipfile
import shutil
from threading import Thread
import time

from app import *

from pathlib import Path


@app.route('/get_file/<path:file_name>', methods=['POST', 'GET'])
def get_file(file_name):
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        request_json = {
                        # 'file_id':request.args.get('file_id'),
                        'file_name': file_name}
        print('POST data: %s ' % request_json)
        if db.connect(db_adapter):
            result = db.get_file(db_adapter, request_json['file_name'])
            if result:
                print(result.file_name)
                response = make_response(result.read())
                # response.mimetype = result.file_name.split('.')[-1]
                return response
            else:
                print(str(msg.STORED_FILE_NOT_FOUND))
                resp = Response()
                resp.status_code = msg.STORED_FILE_NOT_FOUND['code']
                resp.data = str(msg.STORED_FILE_NOT_FOUND['message'])
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


@app.route('/get_shared_file/<path:file_name>', methods=['POST', 'GET'])
def get_shared_file(file_name):
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        request_json = {
                        # 'file_id':request.args.get('file_id'),
                        'file_name':file_name}
        print('POST data: %s ' % request_json)
        if db.connect(db_adapter):
            result = db.get_file(db_adapter, request_json['file_name'])
            if result:
                print(result.file_name)
                resp = Response(result.file_name)
                # response.headers.set('Content-Type', 'mime/jpeg')
                resp.headers.set(
                    'Content-Disposition', 'attachment', filename='%s' % result.file_name)
                resp.status_code = msg.DEFAULT_OK['code']
                return send_file(
                     io.BytesIO(result.read()),
                     attachment_filename=result.file_name)
            else:
                print("not_found")
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


@app.route('/get_folder/<path:parent_id>/<path:folder_name>', methods=['POST', 'GET'])
def get_folder(parent_id, folder_name):
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        project_name = session.get("project")["name"]
        request_json = {
                        'parent_id': parent_id,
                        'folder_name': folder_name}
        print('POST data: %s ' % request_json)
        if db.connect(db_adapter):
            u = session['user']
            response = db.get_project(db_adapter, project_name, u)
            project = Project.json_to_obj(response)
            ic = project.find_ic(request_json, folder_name, project.root_ic)
            print(ic.to_json())
            path = os.getcwd() + '\\'
            millis = int(round(time.time() * 1000))
            try:
                if not os.path.exists(path + 'tmp\\'):
                    os.mkdir(path + 'tmp\\')
                if not os.path.exists(path + 'tmp\\' + u['id'] + '_' + str(millis)):
                    os.mkdir(path + 'tmp\\' + u['id'] + '_' + str(millis))
            except OSError as err:
                print("Creation of the directory %s failed" % path + '\n' + err)
            path = os.getcwd() + '\\tmp\\' + u['id'] + '_' + str(millis) + '\\'
            json_to_temp_folder_struct(path, ic)

            zipf = zipfile.ZipFile('tmp/' + u['id'] + '_' + str(millis) + '/' + ic.name + '.zip', 'w', zipfile.ZIP_DEFLATED)

            print('Zipping: %s' % 'tmp/' + u['id'] + '_' + str(millis) + '/' + ic.name)
            zipdir('tmp/' + u['id'] + '_' + str(millis) + '/' + ic.name, zipf)
            zipf.close()
            print(ic.name + '.zip')

            resp = send_file(os.getcwd() + '\\tmp\\' + u['id'] + '_' + str(millis) + '\\' + ic.name + '.zip',
                             mimetype='zip',
                             attachment_filename=ic.name + '.zip',
                             as_attachment=True)

            thread = Thread(target=remove_folder, kwargs={'path': os.getcwd() + '\\tmp\\' + u['id'] + '_' + str(millis)})
            thread.start()

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


@app.route('/upload_file', methods=['POST'])
def upload_file():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        # print(json.loads(request.get_data()))
        if 'file' not in request.files:
            print('No file part')
            resp = Response()
            resp.status_code = msg.DEFAULT_ERROR['code']
            resp.data = str(msg.DEFAULT_ERROR['message'])
            return resp

        file = request.files['file'].read()
        # print(file)
        print(request.form['data'])
        request_json = json.loads(request.form['data'])  # test_json_request
        set_project_data(request_json)
        directory = request_json['parent_path']
        u = {'user_id': session['user']['id'], 'username': session['user']['username']}
        # if request_json['is_file']:  directory = directory[:directory.rfind('/')]
        details = Details(u, 'Created file', datetime.now().strftime("%d.%m.%Y-%H:%M:%S"), request_json['new_name'] +
                          "." + request_json['new_name'].split('.')[-1])
        file_obj = File(str(uuid.uuid1()),
                        '.'.join(request_json['new_name'].split('.')[:-1]),
                        request.files['file'].filename,
                        directory,
                        [details],
                        directory + '/' + request_json['new_name'],
                        "." + request_json['new_name'].split('.')[-1],
                        request_json['ic_id'],
                        '',
                        [],
                        [],
                        '',
                        'description') # request_json['description'])
        # try:
        file_obj.project_code = request_json['project_code']
        file_obj.company_code = request_json['company_code']
        file_obj.project_volume_or_system = request_json['project_volume_or_system']
        file_obj.project_level = request_json['project_level']
        file_obj.type_of_information = request_json['type_of_information']
        file_obj.role_code = request_json['role_code']
        file_obj.file_number = request_json['file_number']
        file_obj.status = request_json['status']
        file_obj.revision = request_json['revision']
        # except Exception:
        #     pass
        # print(file_obj.to_json())
        if db.connect(db_adapter):
            # with open('app/templates/activity/activity.html', "rb") as f:
            #     encoded = Binary(f.read())  # request_json['file']
            encoded = file
            result = db.upload_file(db_adapter, request_json['project_name'], file_obj, encoded)
            if result:
                print(">>", result["message"])
                resp = Response()
                resp.status_code = result["code"]
                resp.data = result["message"]
                return resp
        else:
            print(">", str(msg.DB_FAILURE))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp
    
    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/create_dir', methods=['POST'])
def create_dir():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        set_project_data(request_data)
        print(request_data)
        u = {'user_id': session['user']['id'], 'username': session['user']['username']}
        details = Details(u, 'Created folder', datetime.now().strftime("%d.%m.%Y-%H:%M:%S"), request_data['new_name'])
        folder = Directory(str(uuid.uuid1()),
                    request_data['new_name'],
                    request_data['parent_path'],
                    [details],
                    request_data['parent_path'] + '/' + request_data['new_name'],
                    request_data['ic_id'],
                    '',
                    [],
                    [])
        if db.connect(db_adapter):
            result, ic = db.create_folder(db_adapter, request_data['project_name'], folder)
            if result:
                print(result["message"])
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


@app.route('/rename_ic', methods=['POST'])
def rename_ic():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        set_project_data(request_data)
        print(request_data)
        if db.connect(db_adapter):
            rename = {
                "project_name": request_data["project_name"],
                "parent_id": request_data['parent_id'],
                "ic_id": request_data['ic_id'],
                "path": request_data["parent_path"],
                "old_name": request_data["old_name"],
                "new_name": request_data["new_name"],
                "is_directory": True if "is_directory" in request_data else False,
            }
            u = {'user_id': session['user']['id'], 'username': session['user']['username']}
            result = db.rename_ic(db_adapter, rename, u)
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


@app.route('/delete_ic', methods=['POST'])
def delete_ic():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        delete_ic_data = json.loads(request.get_data())
        set_project_data(delete_ic_data)
        delete_ic_data['user_id'] = session['user']['id']
        print(delete_ic_data)
        if db.connect(db_adapter):
            result = db.delete_ic(db_adapter, delete_ic_data)
            if result:
                if result == msg.PROJECT_SUCCESSFULLY_DELETED:
                    session.get("project").update({'section': 'project'})
                    session.get("project").update({'position': None})
                    session.modified = True
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


# ----------------------------------------------------

@app.route('/get_dir')
def get_dir():
    print('Data posting path: %s' % request.path)
    print(json.dumps(path_to_dict('app')))
    return redirect('/')


@app.route('/set_dir')
def set_dir():
    print('Data posting path: %s' % request.path)
    obj = path_to_obj('app')
    print(obj.to_json())

    print(Project.json_folders_to_obj(obj.to_json()).to_json())
    return redirect('/')

# ----------------------------------------------------

def path_to_obj(path, parent=False, parent_id=""):
    p = Path(path)
    name = p.stem
    new_id = str(uuid.uuid1())
    parent = parent if parent != False else path # new_id
    u = {'user_id': session['user']['id'], 'username': session['user']['username']}
    details = Details(u, 'Date created', datetime.now().strftime("%d.%m.%Y-%H:%M:%S"))
    if os.path.isdir(path):
        root = Directory(new_id,
                         name,
                         parent,
                         [details],
                         path,
                         parent_id,
                         '',
                         [],
                         [path_to_obj(path + '/' + x, path, new_id) for x in os.listdir(path)
                          if not x.endswith(".pyc") and "__pycache__" not in x])
    else:
        root = File(new_id, name, name, parent, [details], path, p.suffix, new_id, '', [], [],  '', '')
    return root


def path_to_dict(path):
    d = {'name': os.path.basename(path), 'path': path}
    if os.path.isdir(path):
        d['type'] = "directory"
        d['children'] = [path_to_dict(os.path.join(path, x)) for x in os.listdir(path) if not x.endswith(".pyc")
                         and "__pycache__" not in x]
    else:
        d['type'] = "file"
    return d


def json_to_temp_folder_struct(path, ic):
    if ic.is_directory:
        try:
            os.mkdir(path + ic.name)
        except OSError:
            print("Creation of the directory %s failed" % path)
        for sub_folder in ic.sub_folders:
            json_to_temp_folder_struct(path + ic.name + '\\', sub_folder)
    else:
        if db.connect(db_adapter):
            result = db.get_file(db_adapter, ic.name + ic.type)
            if result:
                # print(result.file_name)
                response = result.read()
                f = open(path + ic.name + ic.type, "wb+")
                f.write(response)
                f.close()
            else:
                print(str(msg.STORED_FILE_NOT_FOUND))


def zipdir(path, ziph):
    # ziph is zipfile handle
    for root, dirs, files in os.walk(path):
        for file in files:
            ziph.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), os.path.join(path, '..')))


def set_project_data(data):
    if "project" in data:
        session.get("project").update(data["project"])
        session.modified = True
        print(session.get("project"))


def remove_folder(path):
    time.sleep(30)
    # Delete the zip file if not needed
    shutil.rmtree(path)
