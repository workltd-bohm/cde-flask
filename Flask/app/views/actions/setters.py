import os
import json
import uuid
from datetime import datetime

from app import *


@app.route('/clear_projects')
def clear_projects():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        if db.connect(db_adapter):
            db.clear_db(db_adapter, session['user'])
            session.get("project")["name"] = ''
            session.get("user")["picture"] = ''
            session.modified = True
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp
    
    return redirect('/')


@app.route('/select_project', methods=['POST'])
def select_project():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        session.get("project")["name"] = request_data['choose_project']
        session.modified = True
        resp = Response()
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = str(msg.DEFAULT_OK['message'])
        return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/create_project', methods=['POST'])
def create_project():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        user = session.get('user')
        name_id = str(uuid.uuid1())
        u = {'user_id': session['user']['id'], 'username': session['user']['username']}
        details = Details(u, 'Created project', datetime.now().strftime("%d.%m.%Y-%H:%M:%S"), request_data['project_name'])
        root_obj = IC(name_id,
                      request_data['project_name'],
                      ".",
                      [details],
                      request_data['project_name'],
                      'root',
                      '',
                      [],
                      [],
                      [])
        project = Project("default", request_data['project_name'], root_obj)
        # print(project.to_json())
        if db.connect(db_adapter):
            result, id = db.upload_project(db_adapter, project, user)
            if result:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                resp = Response()
                resp.status_code = result["code"]
                resp.data = result["message"]
                return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp
    
    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/upload_existing_project', methods=['POST', 'GET'])
def upload_existing_project():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    # print('>>>>>>>>>>>>>>>>>', request.args)
    # print('>>>>>>>>>>>>>>>>>', request.form)

    user = session['user']

    if main.IsLogin():
        if db.connect(db_adapter):
            path = request.form['path']
            is_dir = request.form['is_dir']
            project = db.get_project(db_adapter, path.split('/')[0], user)
            u = {'user_id': session['user']['id'], 'username': session['user']['username']}
            if not project:
                logger.log(LOG_LEVEL, str(msg.PROJECT_NOT_FOUND['message']))
                resp = Response()
                resp.status_code = msg.PROJECT_NOT_FOUND['code']
                resp.data = str(msg.PROJECT_NOT_FOUND['message'])
                return resp
            else:
                project = Project.json_to_obj(project)
                if is_dir == 'false':
                    file = request.files['file'].read()
                    counter = request.form['counter']
                    total = request.form['total']
                    original_path = path
                    logger.log(LOG_LEVEL, 'Path: {}'.format(path))
                    logger.log(LOG_LEVEL, 'Percentage: {}'.format(str((int(counter) / int(total)) * 100) + '%'))
                    current_file_path_old = path.split('/')
                    file_name = current_file_path_old[-1]
                    current_file_path_backup = current_file_path_old[:]
                    current_file_path = current_file_path_old[1:-1]
                    parent_id = project.root_ic.ic_id
                    parent_ic = project.root_ic

                    for i in range(0, len(current_file_path)):
                        name = current_file_path[i]
                        new_id = str(uuid.uuid1())
                        if i < 1:
                            parent_directory = ('/').join(current_file_path_backup[0:1])
                            path = ('/').join(current_file_path_backup[0:1])
                        else:
                            parent_directory = ('/').join(current_file_path_backup[0:i + 1])
                            path = ('/').join(current_file_path_backup[0:i + 1])
                        path = path + '/' + name
                        details = Details(u, 'Created folder', datetime.now().strftime("%d.%m.%Y-%H:%M:%S"), name)
                        ic_new = Directory(new_id,
                                           name,
                                           parent_directory,
                                           [details],
                                           path,
                                           parent_id,
                                           '',
                                           [],
                                           [],
                                           []
                                           )

                        parent_id = new_id

                        project.added = False
                        message, ic = project.update_ic(ic_new, parent_ic)
                        # message, ic = db.create_folder(db_adapter, project.name, ic_new)
                        parent_ic = ic_new
                        if message == msg.IC_ALREADY_EXISTS:
                            parent_id = ic.ic_id
                            parent_ic = ic

                    message = db.update_project(db_adapter, project, user)
                    if message == msg.PROJECT_SUCCESSFULLY_UPDATED:
                        new_id = str(uuid.uuid1())
                        name = ('.').join(file_name.split('.')[:-1])
                        parent_directory = ('/').join(current_file_path_backup[:-1])
                        details = Details(u, 'Created file', datetime.now().strftime("%d.%m.%Y-%H:%M:%S"), name +
                                          ('').join(['.', file_name.split('.')[-1]]))
                        ic_new_file = File(new_id, name, name, parent_directory, [details], original_path,
                                           ('').join(['.', file_name.split('.')[-1]]), parent_id, '',
                                           [], [], [], '', '')

                        project.added = False
                        encoded = file
                        result = db.upload_file(db_adapter, project.name, ic_new_file, encoded)

                        if result != msg.IC_SUCCESSFULLY_ADDED:
                            logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                            resp = Response()
                            resp.status_code = result['code']
                            resp.data = result['message']
                            return resp
                        else:
                            return request.form['path']
                else:
                    folders = json.loads(request.form['folders'])
                    for folder in folders:
                        logger.log(LOG_LEVEL, 'Folder: {}'.format(folder))
                        current_dir_path = folder['path'].split('/')[1:]
                        parent_id = project.root_ic.ic_id
                        parent_ic = project.root_ic
                        for i in range(0, len(current_dir_path)):
                            name = current_dir_path[i]
                            new_id = str(uuid.uuid1())
                            if i < 1:
                                parent_directory = ('/').join(current_dir_path[0:1])
                            else:
                                parent_directory = ('/').join(current_dir_path[0:i + 1])
                            path = ('/').join(current_dir_path[:i])
                            details = Details(u, 'Created folder', datetime.now().strftime("%d.%m.%Y-%H:%M:%S"), name)
                            ic_new = Directory(new_id,
                                               name,
                                               parent_directory,
                                               [details],
                                               path,
                                               parent_id,
                                               '',
                                               [],
                                               [],
                                               []
                                               )

                            parent_id = new_id

                            project.added = False
                            message, ic = project.update_ic(ic_new, parent_ic)
                            # message, ic = db.create_folder(db_adapter, project.name, ic_new)
                            parent_ic = ic_new
                            logger.log(LOG_LEVEL, 'Response message: {}'.format(message["message"]))
                            if message == msg.IC_ALREADY_EXISTS:
                                parent_id = ic.ic_id
                                parent_ic = ic
                        message = db.update_project(db_adapter, project, user)
                        logger.log(LOG_LEVEL, 'Response message: {}'.format(message["message"]))

                    resp = Response()
                    resp.status_code = msg.PROJECT_SUCCESSFULLY_UPLOADED['code']
                    resp.data = msg.PROJECT_SUCCESSFULLY_UPLOADED['message']
                    return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp
    return redirect('/')


@app.route('/upload_project')
def upload_project():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        root_obj = dirs.path_to_obj('root')
        project = Project("default", "test-project", root_obj)
        user = {'id': session.get('user')['id'], 'role': 'OWNER'}
        # print(root_obj)
        if db.connect(db_adapter):
            result, id = db.upload_project(db_adapter, project, user)
            if result:
                logger.log(LOG_LEVEL, result)
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    return redirect('/')


@app.route('/set_color', methods=['POST'])
def set_color():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        dirs.set_project_data(request_data, True)
        project_name = session.get("project")["name"]
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            color_change = {
                "project_name": project_name,
                "ic_id": request_data["ic_id"],
                "color": request_data["color"],
            }
            result = db.change_color(db_adapter, color_change)
            if result:
                resp = Response()
                resp.status_code = result["code"]
                resp.data = result["message"]
                return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/share_project', methods=['POST'])
def share_project():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            result = db.share_project(db_adapter, request_data, session['user'])
            if result:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                resp = Response()
                resp.status_code = result["code"]
                resp.data = result["message"]
                return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    return redirect('/')


@app.route('/send_comment', methods=['POST'])
def send_comment():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            u = {'user_id': session['user']['id'],
                 'username': session['user']['username'],
                 'picture': session['user']['picture']}
            comment = Comments(u, request_data['comment'], datetime.now().strftime("%d.%m.%Y-%H:%M:%S"))
            result = db.add_comment(db_adapter, request_data, comment)
            if result:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                resp = Response()
                resp.status_code = result["code"]
                resp.data = render_template("activity/single_comment.html",
                                            comment=comment.to_json(),
                                            picture=u['picture']
                                            )
                return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    return redirect('/')


@app.route('/add_tag', methods=['POST'])
def add_tag():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        if request_data['project_name'] == '':
            request_data['project_name'] = session['project']['name']
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))

        if db.connect(db_adapter):
            result = db.add_tag(db_adapter, request_data, request_data['tags'])
            if result:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                resp = Response()
                resp.status_code = result["code"]
                resp.data = result['message']
                return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    return redirect('/')


@app.route('/remove_tag', methods=['POST'])
def remove_tag():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            result = db.remove_tag(db_adapter, request_data, request_data['tag'])
            if result:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                resp = Response()
                resp.status_code = result["code"]
                resp.data = result['message']
                return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    return redirect('/')


@app.route('/activate_undo', methods=['POST'])
def activate_undo():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        undo = session.get("undo")
        #print(undo)

        position = session.get("project")["position"]
        project_name = session.get("project")["name"]
        user = session.get('user')

        if db.connect(db_adapter) and undo["user"] == user and undo["project_name"] == project_name:
            result = db.get_project(db_adapter, project_name, user)
            if result and undo["data"]:
                project = Project(result['project_id'], result['project_name'], Project.json_folders_to_obj(undo["data"]['root_ic']))
                # print(project.to_json()['root_ic']["sub_folders"])
                # print(undo["data"]['root_ic']["sub_folders"])
                result, id = db.update_project(db_adapter, project, user)
                if result:
                    #session.get("project")["position"] = undo["position"]

                    session["undo"] = {}
                    session.get("project")["undo"] = False
                    session.modified = True
                    resp.status_code = msg.DEFAULT_OK['code']
                    resp.data = str(msg.DEFAULT_OK['message']) #json.dumps({"json": project.to_json(), "project" : position})
                    return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp
