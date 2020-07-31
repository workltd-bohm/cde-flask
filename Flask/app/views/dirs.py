import os
import json
from bson.binary import Binary

from pathlib import Path
from app import *
from app.model.project import Project


@app.route('/upload_file')
def upload_file():
    print('Data posting path: %s' % request.path)
    project = None
    if db.connect(db_adapter):
        result = db.get_project(db_adapter, "test-project")
        if result:
            project = Project(result['project_id'], result['project_name'], json_to_obj(result['root_ic']))
        else:
            print("not_found")
    file_obj = File("app/templates/activity/activity.html", "activity", "app\\templates\\activity", [],
                'app/templates/activity/activity.html', '.html', '')
    if db.connect(db_adapter) and project:
        with open('app/templates/activity/activity.html', "rb") as f:
            encoded = Binary(f.read())
        result = db.upload_file(db_adapter, project, file_obj, encoded)
        if result:
            print(result)
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
            project = Project(result['project_id'], result['project_name'], json_to_obj(result['root_ic']))
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

    print(json_to_obj(obj.to_json()).to_json())
    return redirect('/')


def json_to_obj(json_file):
    if 'type' not in json_file:
        root = Directory(json_file['ic_id'],
                         json_file['name'],
                         json_file['parent'],
                         json_file['history'],
                         json_file['path'],
                         [json_to_obj(x) for x in json_file['sub_folders']])
    else:
        root = File(json_file['ic_id'],
                    json_file['name'],
                    json_file['parent'],
                    json_file['history'],
                    json_file['path'],
                    json_file['type'])
    return root


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
