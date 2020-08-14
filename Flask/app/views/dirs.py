import os
import json
import uuid

from pathlib import Path
from app import *
from app.model.project import Project
from app.model.role import Role


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

test_json_request_project = {
    'project_name': 'test-project',
    'user': '',
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
    # print(file)
    request_json = json.loads(request.form['data'])[0]  # test_json_request
    print(request_json)
    file_obj = File(str(uuid.uuid1()),
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
            print(result)
            return result
        # else:
        #     print("not_uploaded")
        #     return 'not successful - file not uploaded'
    else:
        print(str(msg.DB_FAILURE))
    return redirect('/')


@app.route('/create_dir', methods=['POST'])
def create_dir():
    print('Data posting path: %s' % request.path)
    request_data = json.loads(request.get_data())
    folder = IC(str(uuid.uuid1()),
                request_data['folder_name'],
                request_data['parent'],
                [],
                request_data['parent'] + '/' + request_data['folder_name'],
                [])
    if db.connect(db_adapter):
        result = db.create_folder(db_adapter, request_data['project_name'], folder)
        if result:
            print(result)
            return result
    else:
        print(str(msg.DB_FAILURE))

    return redirect('/')


@app.route('/select_project', methods=['POST'])
def select_project():
    print('Data posting path: %s' % request.path)
    request_data = json.loads(request.get_data())
    test_json_request_project['project_name'] = request_data['project_name']

    return redirect('/')


@app.route('/get_all_projects')
def get_all_projects():
    print('Data posting path: %s' % request.path)

    if db.connect(db_adapter):
        result = db.get_all_projects(db_adapter)
        response = {'projects':[]}
        if result:
            print(result)
            for project in result:
                response['projects'].append(project['project_name'])
            print(response)
            return json.dumps(response)
        else:
            print("not_found")
    else:
        print(str(msg.DB_FAILURE))
    return ""


@app.route('/get_project')
def get_project():
    print('Data posting path: %s' % request.path)
    request_data = test_json_request_project  # json.loads(request.get_data())
    project_name = request_data['project_name']
    user = request_data['user']

    if db.connect(db_adapter):
        result = db.get_project(db_adapter, project_name, user)
        if result:
            # print(result)
            project = Project(result['project_id'], result['project_name'], Project.json_folders_to_obj(result['root_ic']))
            # print((project.to_json()))
            return project.to_json()
        else:
            print("not_found")
    else:
        print(str(msg.DB_FAILURE))
    return ""


@app.route('/create_project', methods=['POST'])
def create_project():
    print('Data posting path: %s' % request.path)
    request_data = json.loads(request.get_data())
    request_data['user']['role'] = Role.OWNER.name
    user = request_data['user']
    root_obj = IC(str(uuid.uuid1()),
                  request_data['project_name'],
                  '.',
                  [],
                  request_data['project_name'],
                  [])
    project = Project("default", request_data['project_name'], root_obj)
    # print(project.to_json())
    if db.connect(db_adapter):
        result = db.upload_project(db_adapter, project, user)
        if result:
            print(result)
            return result
    else:
        print(str(msg.DB_FAILURE))
    return redirect('/')


@app.route('/upload_project')
def upload_project():
    print('Data posting path: %s' % request.path)
    root_obj = path_to_obj('app', '.')
    project = Project("default", "test-project", root_obj)
    user = {'id': '17b16930-c5f6-11ea-99bc-50e085759747', 'role': 'OWNER'}
    if db.connect(db_adapter):
        result = db.upload_project(db_adapter, project, user)
        if result:
            print(result)
    else:
        print(str(msg.DB_FAILURE))
    return redirect('/')


@app.route('/rename_ic', methods=['POST'])
def rename_ic():
    print('Data posting path: %s' % request.path)
    print(json.loads(request.get_data()))
    request_data = json.loads(request.get_data())
    if db.connect(db_adapter):
        result = db.rename_ic(db_adapter, request_data)
        if result:
            print(result)
            return result
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


def path_to_obj(path, parent_id):
    p = Path(path)
    name = p.stem
    parent = parent_id
    if os.path.isdir(path):
        new_id = str(uuid.uuid1())
        root = Directory(new_id,
                         name,
                         parent,
                         [],
                         path,
                         [path_to_obj(path + '/' + x, new_id) for x in os.listdir(path)
                          if not x.endswith(".pyc") and "__pycache__" not in x])
    else:
        root = File(str(uuid.uuid1()), name, name, parent, [], path, p.suffix, '', '')
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
