import os
import json
from pathlib import Path
from app import *


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
                         [json_to_obj(x).to_json() for x in json_file['sub_folders']])
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
                         [path_to_obj(path + '/' + x).to_json() for x in os.listdir(path)
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
