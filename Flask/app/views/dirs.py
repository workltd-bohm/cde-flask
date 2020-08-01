import os
import json
from bson.binary import Binary

from pathlib import Path
from app import *
from app.model.project import Project


test_json_request = {
    'project_id': '5f25580d49e1b44fef634b56',
    'project_name': 'test-project',
    'dir_path': 'app/templates/activity',
    'file_name': 'activity111.html',
    'user': '',
    'file': '',
    'description': 'test description'
}


@app.route('/upload_file')
def upload_file():
    print('Data posting path: %s' % request.path)
    request_json = test_json_request  # json.loads(request.data)
    print('POST data: %s ' % request_json)
    project = None
    file_obj = File(request_json['dir_path'] + '/' + request_json['file_name'],
                    request_json['file_name'].split('.')[0],
                    request_json['dir_path'],
                    [],
                    request_json['dir_path'] + '/' + request_json['file_name'],
                    request_json['file_name'].split('.')[1],
                    '',
                    request_json['description'])
    if db.connect(db_adapter):
        with open('app/templates/activity/activity.html', "rb") as f:
            encoded = Binary(f.read())  # request_json['file']
        result = db.upload_file(db_adapter, request_json['project_name'], file_obj, encoded)
        if result:
            print("successful - file uploaded")
        else:
            print("not_uploaded")
    else:
        print(str(msg.DB_FAILURE))
    return redirect('/')


@app.route('/get_project')
def get_project():
    print('Data posting path: %s' % request.path)

    if db.connect(db_adapter):
        result = db.get_project(db_adapter, "test-project")
        if result:
            print(result)
            project = Project(result['project_id'], result['project_name'], Project.json_folders_to_obj(result['root_ic']))
            print((project.to_json()))
        else:
            print("not_found")
    else:
        print(str(msg.DB_FAILURE))
    return redirect('/')


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
        root = File(path, name, parent, [], path, p.suffix)
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
