import os
import io
import json
import uuid

from app import *

from pathlib import Path


@app.route('/get_file/<path:file_name>', methods=['POST', 'GET'])
def get_file(file_name):
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        request_json = {
                        # 'file_id':request.args.get('file_id'),
                        'file_name':file_name}
        print('POST data: %s ' % request_json)
        if db.connect(db_adapter):
            result = db.get_file(db_adapter, request_json['file_name'])
            if result:
                print(result['file_name'])
                resp = Response(result['file'])
                # response.headers.set('Content-Type', 'mime/jpeg')
                resp.headers.set(
                    'Content-Disposition', 'attachment', filename='%s.jpg' % result['file_name'])
                resp.status_code = msg.DEFAULT_OK['code']
                return send_file(
                     io.BytesIO(result['file']),
                     attachment_filename=result['file_name'])
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
        directory = request_json['parent_path']
        # if request_json['is_file']:  directory = directory[:directory.rfind('/')]
        file_obj = File(str(uuid.uuid1()),
                        '.'.join(request_json['new_name'].split('.')[:-1]),
                        request.files['file'].filename,
                        directory,
                        [],
                        directory + '/' + request_json['new_name'],
                        "." + request_json['new_name'].split('.')[-1],
                        request_json['parent_id'],
                        [],
                        '',
                        'description') # request_json['description'])
        try:
            file_obj.project_code = request_json['project_code']
            file_obj.company_code = request_json['company_code']
            file_obj.project_volume_or_system = request_json['project_volume_or_system']
            file_obj.project_level = request_json['project_level']
            file_obj.type_of_information = request_json['type_of_information']
            file_obj.role_code = request_json['role_code']
            file_obj.file_number = request_json['file_number']
            file_obj.status = request_json['status']
            file_obj.revision = request_json['revision']
        except Exception:
            pass
        print(file_obj.to_json())
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
        print(request_data)
        folder = IC(str(uuid.uuid1()),
                    request_data['new_name'],
                    request_data['parent_path'],
                    [],
                    request_data['parent_path'] + '/' + request_data['new_name'],
                    request_data['parent_id'],
                    [])
        if db.connect(db_adapter):
            result = db.create_folder(db_adapter, request_data['project_name'], folder)
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
            result = db.rename_ic(db_adapter, rename)
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
        print(delete_ic_data)
        rename = {
                "parent_id": delete_ic_data['parent_id'],
                "ic_id": delete_ic_data['ic_id'],
                "project_name": delete_ic_data["project_name"],
                "parent_path": delete_ic_data["parent_path"],
                "delete_name": delete_ic_data["delete_name"],
                "is_directory": True if "is_directory" in delete_ic_data else False,
            }
        if db.connect(db_adapter):
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
    if os.path.isdir(path): 
        root = Directory(new_id,
                         name,
                         parent,
                         [],
                         path,
                         parent_id,
                         [path_to_obj(path + '/' + x, path, new_id) for x in os.listdir(path)
                          if not x.endswith(".pyc") and "__pycache__" not in x])
    else:
        root = File(new_id, name, name, parent, [], path, p.suffix, new_id, [],  '', '')
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


def set_project_data(data):
    if "project" in data:
        session.get("project").update(data["project"])
        session.modified = True
        print(session.get("project"))