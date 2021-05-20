from app import *
import os
import zipfile
import shutil
from threading import Thread
import time
import uuid
import copy
from datetime import datetime


@app.route('/set_color_multi', methods=['POST'])
def set_color_multi():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        dirs.set_project_data(request_data, True)
        project_name = session.get("project")["name"]
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            user = session.get('user')
            if project_name == 'Shared':
                result = db.get_project_from_shared(db_adapter, request_data[0], user)
                project_name = result['project_name']

            # Check Roles
            result = db.get_project(db_adapter, project_name, user)
            my_roles = db.get_my_roles(db_adapter, user)
            for project in my_roles['projects']:
                if project['project_id'] == result['project_id']:       # find project matching this one
                    if project['role'] > Role.DEVELOPER.value:          # exit with error if user is not at least developer
                        resp = Response()
                        resp.status_code = msg.USER_NO_RIGHTS['code']
                        resp.data = msg.USER_NO_RIGHTS['message']
                        return resp
            
            result = ''
            for req in request_data:
                color_change = {
                    "project_name": project_name,
                    "ic_id": req["ic_id"],
                    "color": req["color"],
                }
                result = db.change_color(db_adapter, color_change)
            db.close_connection(db_adapter)
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
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/copy_multi', methods=['POST'])
def copy_multi():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        dirs.set_project_data(request_data, True)
        project_name = session.get("project")["name"]
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


def deep_new_ids(ic, parent_ic, to_copy=False):
    delete_ic_data = ic.to_json()
    ic.ic_id = str(uuid.uuid1())
    full_name = ic.name
    if hasattr(ic,"type"):
        full_name += ic.type
    ic.path = parent_ic.path + "/" + full_name
    ic.parent = parent_ic.path
    ic.parent_id = parent_ic.ic_id
    if not ic.is_directory:
        if to_copy:
            result = db.upload_file(db_adapter, session.get("project")["name"], ic)
        else:
            result = db.update_file(db_adapter, session.get("project")["name"], ic)
        if result["code"] != 200: return result
            # delete_ic_data['user_id'] = session['user']
            # delete_ic_data['project_name'] = session.get("project")["name"]
            # delete_ic_data["delete_name"] = full_name
            # result = db.delete_ic(db_adapter, delete_ic_data)
            # if result["code"] != 200: return result

    for x in ic.sub_folders:
        if not deep_new_ids(x, ic, to_copy): return msg.DEFAULT_OK

    return msg.DEFAULT_OK


@app.route('/move_ic_multi', methods=['POST'])
def move_multi():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data_array = json.loads(request.get_data())
        dirs.set_project_data(request_data_array, True)
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data_array))
        #print("array", request_data_array)
        if db.connect(db_adapter):
            user = session.get('user')
            project_name = session.get("project")["name"]

            # Check Roles
            result = db.get_project(db_adapter, project_name, user)
            my_roles = db.get_my_roles(db_adapter, user)
            for project in my_roles['projects']:
                if project['project_id'] == result['project_id']:       # find project matching this one
                    if project['role'] > Role.DEVELOPER.value:          # exit with error if user is not at least developer
                        resp = Response()
                        resp.status_code = msg.USER_NO_RIGHTS['code']
                        resp.data = msg.USER_NO_RIGHTS['message']
                        return resp

            if "targets" and "to_copy" in request_data_array:
                if project_name == 'Shared':
                    request_json = {}
                    request_json['ic_id'] = request_data_array['from_ic_id']
                    request_json['parent_id'] = request_data_array['from_parent_id']
                    result = db.get_project_from_shared_by_parent_id(db_adapter, request_json, user)
                    project_name = result['project_name']
                response = db.get_project(db_adapter, project_name, user)
                project = Project.json_to_obj(response)

                old_parent_ic = project.find_ic_by_id(
                    {"parent_id": request_data_array["from_parent_id"]}, 
                    request_data_array["from_ic_id"], project.root_ic)
                project.current_ic = None
                project.added = False
                new_parent_ic = project.find_ic_by_id({"parent_id": request_data_array["to_parent_id"]}, request_data_array["to_ic_id"], project.root_ic)
                project.current_ic = None
                project.added = False

                if old_parent_ic == new_parent_ic:
                    #print("old_parent_ic == new_parent_ic")
                    resp.status_code = msg.IC_ALREADY_EXISTS['code']
                    resp.data = str(msg.IC_ALREADY_EXISTS['message'])
                    return resp

                if old_parent_ic and new_parent_ic:
                    for request_data in request_data_array["targets"]:
                        target_ic = project.find_ic_by_id({"parent_id": request_data['parent_id']}, request_data['ic_id'], project.root_ic)
                        project.current_ic = None
                        project.added = False
                        if target_ic:
                            full_name = target_ic.name
                            if hasattr(target_ic, "type"):
                                full_name += target_ic.type

                            same_ic = project.find_ic({"parent_id": request_data_array["to_ic_id"]}, full_name, project.root_ic)
                            project.current_ic = None
                            project.added = False
                            if same_ic and same_ic.name == target_ic.name:
                                #print("same name:",same_ic.name, target_ic.name)
                                resp.status_code = msg.DEFAULT_OK['code']
                                resp.data = str(msg.IC_ALREADY_EXISTS['message'])
                                return resp
                            ##TODO: Enable copy, problem: copy to child, the child iself and something else 
                            ## duplicates the else, if they are first to go
                            # if not request_data_array["to_copy"]:
                            same_ic = project.find_ic_by_id({"parent_id": request_data_array["to_parent_id"]}, request_data_array["to_ic_id"], target_ic)
                            project.current_ic = None
                            project.added = False
                            if same_ic and same_ic != target_ic:
                                #print("same_ic == target_ic", same_ic.ic_id, target_ic.ic_id)
                                resp.status_code = msg.DEFAULT_OK['code']
                                resp.data = str(msg.NOT_ALLOWED['message'])
                                return resp

                            copy_target_ic = copy.deepcopy(target_ic)
                            result = deep_new_ids(copy_target_ic, new_parent_ic, request_data_array["to_copy"])
                            if result != msg.DEFAULT_OK:
                                resp.status_code = msg.DEFAULT_OK['code']
                                resp.data = str(result['message'])
                                return resp

                            details = "Error"
                            usr = {'user_id': session['user']['id'], 'username': session['user']['username']}
                            if not request_data_array["to_copy"]:
                                details = Details(usr, 'Moved',
                                                  datetime.now().strftime("%d.%m.%Y-%H:%M:%S"),
                                                  "Move form '" + old_parent_ic.path + "' to '" + new_parent_ic.path + "'")
                                if old_parent_ic.ic_id == target_ic.ic_id:
                                    delete_name = target_ic.name
                                    if hasattr(target_ic, "type"):
                                        delete_name += target_ic.type

                                    request_data = {'parent_id' : target_ic.parent_id, "delete_name" : delete_name}
                                    result = project.delete_ic(request_data, project.root_ic)
                                    if result != msg.IC_SUCCESSFULLY_DELETED:
                                        resp.status_code = msg.DEFAULT_OK['code']
                                        resp.data = str(result['message'])
                                        return resp
                                else:
                                    old_parent_ic.sub_folders.remove(target_ic)
                            else:
                                details = Details(usr, 'Copied',
                                                  datetime.now().strftime("%d.%m.%Y-%H:%M:%S"),
                                                  "Copy form '" + old_parent_ic.path + "' to '" + new_parent_ic.path + "'")
                            copy_target_ic.history.append(details)

                            new_parent_ic.sub_folders.append(copy_target_ic)
                            db.update_project(db_adapter, project, user)

                    resp.status_code = msg.DEFAULT_OK['code']
                    resp.data = str(msg.DEFAULT_OK['message'])
                    return resp

        else:
            logger.log(LOG_LEVEL, str(msg.DB_FAILURE))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp

@app.route('/get_trash_ic_multi', methods=['POST'])
def get_trash_ic_multi():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        delete_ic_array = json.loads(request.get_data())
        dirs.set_project_data(delete_ic_array, True)
        logger.log(LOG_LEVEL, 'POST data: {}'.format(delete_ic_array))
        #print(delete_ic_array)
        if db.connect(db_adapter):
            if "targets" in delete_ic_array:
                user_id = session['user']['id']
                project_name = session.get("project")["name"]
                project_id = ''
                if project_name == 'Shared':
                    result = db.get_project_from_shared(db_adapter, delete_ic_array, session['user'])
                    project_name = result['project_name']
                    for delete_ic_data in delete_ic_array["targets"]:
                        delete_ic_data['project_id'] = project_id
                final = ''
                for delete_ic_data in delete_ic_array["targets"]:
                    delete_ic_data['user_id'] = user_id
                    delete_ic_data['project_name'] = project_name
                    result = db.trash_ic(db_adapter, delete_ic_data)
                    if result["code"] != 200:
                        final = result
                if final:
                    result = final
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
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp

@app.route('/get_restore_ic_multi', methods=['POST'])
def get_restore_ic_multi():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        restore_ic_array = json.loads(request.get_data())
        dirs.set_project_data(restore_ic_array, True)
        #print(delete_ic_array)
        if db.connect(db_adapter):
            if "targets" in restore_ic_array:
                user_id = session['user']['id']
                project_name = session.get("project")["name"]
                final = ''
                for restore_ic_data in restore_ic_array["targets"]:
                    restore_ic_data['user_id'] = user_id
                    restore_ic_data['project_name'] = project_name
                    result = db.restore_ic(db_adapter, restore_ic_data)
                    if result["code"] != 200:
                        final = result
                if final:
                    result = final
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
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp

@app.route('/get_delete_ic_multi', methods=['POST'])
def get_delete_ic_multi():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        delete_ic_array = json.loads(request.get_data())
        dirs.set_project_data(delete_ic_array, True)
        #print(delete_ic_array)
        if db.connect(db_adapter):
            if "targets" in delete_ic_array:
                user_id = session['user']['id']
                project_name = session.get("project")["name"]
                final = ''
                for delete_ic_data in delete_ic_array["targets"]:
                    delete_ic_data['user_id'] = user_id
                    delete_ic_data['project_name'] = project_name
                    result = db.delete_ic(db_adapter, delete_ic_data)
                    if result["code"] != 200:
                        final = result
                if final:
                    result = final
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
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/share_multi', methods=['POST'])
def share_multi():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        project_name = session.get("project")["name"]
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/get_ic_multi/<path:json_obj>', methods=['POST', 'GET'])
def get_ic_multi(json_obj):
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(json_obj)
        project_name = session.get("project")["name"]
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        
        if db.connect(db_adapter):
            if project_name == 'Shared':
                result = db.get_project_from_shared_by_parent_id(db_adapter, request_data[0], session['user'])
                project_name = result['project_name']
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
                logger.log(LOG_LEVEL, 'Creation of the directory {} failed'.format(path + '\n' + err))

            for req in request_data:
                project.current_ic = None
                project.added = False
                ic = project.find_ic(req, req['ic_name'], project.root_ic)
                if ic:
                    path = os.getcwd() + '\\tmp\\' + u['id'] + '_' + str(millis) + '\\BOHM_download\\'
                    dirs.json_to_temp_folder_struct(path, ic, response)

            zipf = zipfile.ZipFile('tmp/' + u['id'] + '_' + str(millis) + '/BOHM_download.zip', 'w', zipfile.ZIP_DEFLATED)
            # zip_buffer.seek(0)
            # print('Zipping: %s' % 'tmp/' + u['id'] + '_' + str(millis) + '/BOHM_download.zip')
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
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp