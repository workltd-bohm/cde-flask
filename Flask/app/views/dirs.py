import os
import json
from bson.binary import Binary

from pathlib import Path
from app import *
from app.model.project import Project


test_json_request = {
    'project_id': '5f25580d49e1b44fef634b56',
    'project_name': 'test-project',
    'original_name': 'original_name',
    'dir_path': 'app/templates/activity',
    'file_name': 'activity111.html',
    'user': '',
    'file': '',
    'description': 'test description'
}

test_json_request_file = {
    'file_id': '5f2e7166bc71e9ecb31305ba',
    'file_name': 'SV-WRK-XX-XX-MI-W-3201-B1-P01.01-test',
}


@app.route('/clear_db')
def clear_db():
    print('Data posting path: %s' % request.path)
    if db.connect(db_adapter):
        db.clear_db(db_adapter)
    else:
        print(str(msg.DB_FAILURE))
    return redirect('/')


@app.route('/get_file')
def get_file():
    print('Data posting path: %s' % request.path)
    request_json = test_json_request_file  # json.loads(request.data)
    print('POST data: %s ' % request_json)
    if db.connect(db_adapter):
        result = db.get_file(db_adapter, request_json['file_id'], request_json['file_name'])
        if result:
            print(result['file'])
        else:
            print("not_found")
    else:
        print(str(msg.DB_FAILURE))
    return redirect('/')


@app.route('/upload_file', methods=['POST'])
def upload_file():
    print('Data posting path: %s' % request.path)
    # print(json.loads(request.get_data()))
    if 'file' not in request.files:
        print('No file part')
        # return redirect(request.url)
    file = request.files['file'].read()
    print(file)
    request_json = json.loads(request.form['data'])[0]  # test_json_request
    print(request_json)
    file_obj = File(request_json['dir_path'] + '/' + request_json['file_name'],
                    '.'.join(request_json['file_name'].split('.')[:-1]),
                    request_json['original_name'],
                    request_json['dir_path'],
                    [],
                    request_json['dir_path'] + '/' + request_json['file_name'],
                    "." + request_json['file_name'].split('.')[-1],
                    '',
                    request_json['description'])
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
            print("successful - file uploaded")
            return 'successful - file uploaded'
        else:
            print("not_uploaded")
            return 'not successful - file not uploaded'
    else:
        print(str(msg.DB_FAILURE))
    return redirect('/')


@app.route('/create_dir', methods=['POST'])
def create_dir():
    print('Data posting path: %s' % request.path)
    request_data = json.loads(request.get_data())
    folder = IC(request_data['parent'] + '/' + request_data['folder_name'],
             request_data['folder_name'],
             request_data['parent'],
             [],
             request_data['parent'] + '/' + request_data['folder_name'],
             [])
    if db.connect(db_adapter):
        result = db.create_folder(db_adapter, request_data['project_name'], folder)
        if result:
            print("successful - folder created")
            return 'successful - folder created'
        else:
            print("not_created")
            return 'not successful - folder not created'

    return redirect('/')


@app.route('/get_project')
def get_project():
    print('Data posting path: %s' % request.path)

    if db.connect(db_adapter):
        result = db.get_project(db_adapter, "test-project")
        if result:
            # print(result)
            project = Project(result['project_id'], result['project_name'], Project.json_folders_to_obj(result['root_ic']))
            # print((project.to_json()))
            return (project.to_json())
        else:
            print("not_found")
    else:
        print (str(msg.DB_FAILURE))
    return ""


@app.route('/upload_project')
def upload_project():
    print('Data posting path: %s' % request.path)
    root_obj = path_to_obj('app')
    project = Project("default", "test-project", root_obj)
    print(project.to_json())
    if db.connect(db_adapter):
        uploaded = db.upload_project(db_adapter, project)
        if uploaded:
            print("successful - project uploaded")
        else:
            print("not_successful - name already exists in the DB")
    else:
        print(str(msg.DB_FAILURE))
    return redirect('/')


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


def path_to_obj(path):
    p = Path(path)
    name = p.stem
    parent = str(p.parent)
    if os.path.isdir(path):
        root = Directory(str(path),
                         name,
                         parent,
                         [],
                         path,
                         [path_to_obj(path + '/' + x) for x in os.listdir(path)
                          if not x.endswith(".pyc") and "__pycache__" not in x])
    else:
        root = File(path, name, name, parent, [], path, p.suffix)
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
