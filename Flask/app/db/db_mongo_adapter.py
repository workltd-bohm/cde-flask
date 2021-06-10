from pymongo import *
# from pymongo import DeleteMany
import gridfs
from pymongo.errors import ConnectionFailure
import uuid
from app.model.user import User
from app.model.project import Project
from app.model.marketplace.post import Post
from app.model.marketplace.bid import Bid
from app.model.role import Role
from app.model.access import Access
from app.model.details import Details
from app.model.information_container import IC
from app.model.tag import SimpleTag, ISO19650
import app.model.messages as msg
from app.model.helper import get_iso_tags
import json
from datetime import datetime

from bson.objectid import ObjectId

class DBMongoAdapter:

    def __init__(self):
        self._client = MongoClient('localhost:27017')
        self._db = None

    def connect(self):
        try:
            self._db = self._client.slDB
            self._fs = gridfs.GridFS(self._db)
        except ConnectionFailure(message='', error_labels=None):
            return False
        return True

    def get_user(self, identifier):
        col = self._db.Users
        message = msg.INVALID_USER_PASS
        user = None
        print(identifier)
        result = col.find_one(identifier, {'_id': 0})
        if result:
            if not result['confirmed']:
                message = msg.MESSAGE_SENT_TO_ADMIN
            else:
                # user = User()
                # user.create_user(result)
                # user.id = result['id']
                # user.confirmed = result['confirmed']
                user = result
                message = msg.LOGGED_IN
        # self._close_connection()
        return message, user

    def get_users_dump(self):
        col = self._db.Users
        result = col.find()
        # result = [doc for doc in col.find()]
        # print(result)
        response = []
        if result:
            for doc in result:
                doc.pop('_id', None)
                response.append(doc)
        self._close_connection()
        return response

    def get_all_users(self):
        col = self._db.Users
        result = col.find()
        # print(result)
        usernames = []
        if result:
            for user in result:
                usernames.append(user['username'])
        self._close_connection()
        return usernames

    def set_user(self, user):
        col = self._db.Users
        user_query = {'email': user.email}
        modified_user = None
        message = msg.USER_ALREADY_IN
        if col.find_one(user_query, {'_id': 0}) is None:
            user.id = str(uuid.uuid1())
            user.confirmed = False
            col.insert_one(user.to_json())
            modified_user = user
            message = msg.MESSAGE_SENT_TO_ADMIN
        self._close_connection()
        return message, modified_user

    def edit_user(self, user_json):
        col = self._db.Users
        user_query = {'id': user_json["id"]}
        message = msg.USER_NOT_FOUND
        if col.find_one(user_query, {'_id': 0}):
            col.update_one(user_query, {'$set': user_json})
            message = msg.ACCOUNT_CHANGED
        self._close_connection()
        return message

    def upload_profile_image(self, request_json, file):
        col = self._db.fs.files
        stored_id = str(self._fs.put(file,
                                     file_id='default',
                                     user=request_json['user'],
                                     file_name=request_json['file_name'],
                                     type=request_json['type'],
                                     from_project=False
                                     ))
        col.update_one({'file_id': 'default'},
                       {'$set': {'file_id': str(stored_id)}})
        message = msg.IC_SUCCESSFULLY_ADDED

        self._close_connection()
        return message, str(stored_id)

    def delete_profile_image(self, image_id):
        message = msg.IC_PATH_NOT_FOUND
        if image_id == '':
            image_exists = False
        else:
            image_exists = (self._db.fs.files.find_one({"_id":ObjectId(image_id)}) != None)
        if image_exists:
            self._db.fs.files.delete_one({"_id":ObjectId(image_id)})
            self._db.fs.chunks.delete_many({"files_id":ObjectId(image_id)})
            message = msg.IC_SUCCESSFULLY_REMOVED
        self._close_connection()
        return message

    def confirm_account(self, user):
        col = self._db.Users
        message = msg.USER_NOT_FOUND
        if col.find_one(user, {'_id': 0}):
            col.update_one(user, {'$set': {'confirmed': True}})
            message = msg.ACCOUNT_CONFIRMED
        self._close_connection()
        return message

    def _close_connection(self):
        #print('close')
        self._client.close()

    def upload_folder_structure(self, project, user):
        col = self._db.Projects
        col_roles = self._db.Roles
        col_users = self._db.Users.Roles
        project_query = {'project_name': project.name}
        print(project_query)
        message = msg.PROJECT_ALREADY_EXISTS
        project_id = ''
        if col.find_one(project_query, {'_id': 0}) is None:
            project_id = col.insert_one(project.to_json()).inserted_id
            col.update_one({'project_id': 'default'},
                           {'$set': {'project_id': str(project_id)}})
            role_query = {'project_id': project_id}
            role = col_roles.find_one(role_query, {'_id': 0})
            if not role:
                role = {}
                role['project_id'] = project_id
                role['user'] = [user]
                col_roles.insert_one(role)
            else:
                role['user'].append(user)
                col_roles.update_one({'project_id': project_id}, {'$set': role})

            user_query = {'user_id': user['id']}
            u = col_users.find_one(user_query, {'_id': 0})
            if not u:
                u = {}
                u['projects'] = [{'project_id': str(project_id), 'role': Role.OWNER.value}]
                u['user_id'] = user['id']
                col_users.insert_one(u)
            else:
                # u_json = json.loads(u)
                u['projects'].append({'project_id': str(project_id), 'role': Role.OWNER.value})
                col_users.update_one(user_query,
                               {'$set': u})

            message = msg.PROJECT_SUCCESSFULLY_ADDED
        self._close_connection()
        return message, str(project_id)

    def update_project(self, project, user):
        col = self._db.Projects
        project_query = {'project_name': project.name}
        message = msg.PROJECT_NOT_FOUND
        if col.find_one(project_query, {'_id': 0}):
            print(project.to_json())
            col.update_one(project_query, {'$set': project.to_json()})

            message = msg.PROJECT_SUCCESSFULLY_UPDATED
        self._close_connection()
        return message

    def get_all_projects(self):
        col = self._db.Projects
        result = col.find()
        # print(result)
        self._close_connection()
        return result

    def get_my_projects(self, user):
        col_users = self._db.Users.Roles
        col = self._db.Users
        
        user_query = {'user_id': user['id']}
        result = col_users.find_one(user_query, {'_id': 0})
        projects = []
        if result:
            for pr in result['projects']:
                project = self.get_my_project(pr['project_id'])
                project['overlay_type'] = "project"
                projects.append(project)
        self._close_connection()

        # get shares
        result, ic_shares = self.get_my_shares(user)
        name_id = str(uuid.uuid1())
        us = {
            'user_id':    user['id'],
            'username': user['username'],
            'picture':  user['picture']
        }

        access = Access(us, '', '', Role.ADMIN.value, 'indefinitely')
        
        u = {
            'user_id': user['id'], 
            'username': user['username']
        
        }
        details = Details(u, 'Created project', datetime.now().strftime("%d.%m.%Y-%H:%M:%S"), 'Shared')

        root_obj = IC(name_id,
            'Shared',
            ".",
            [details],
            'Shared',
            'root',
            '',
            [],
            [],
            [],
            [access])

        project = Project("default", 'Shared', root_obj)
        for ic in result:
            project.root_ic.sub_folders.append(ic)
        result = project.to_json()
        result['overlay_type'] = "shared"

        projects.append(result)
        
        return projects

    '''
    Returns My Roles From The DB
    That Means The Function Will
    Return A List Of Projects As
    Their ID !!! NOT OBJECTS !!! 
    '''
    def get_my_roles(self, user):
        col_roles = self._db.Users.Roles
        user_query = {"user_id": user['id']}
        my_roles = col_roles.find_one(user_query, {"_id": 0})
        return my_roles

    def get_my_shares(self, user):
        col_shared = self._db.Projects.Shared
        user_query = {'user_id': user['id']}
        # print(user_query)
        result = col_shared.find()
        # print(result[0])
        ics = []
        ic_shares = []
        if result:
            # result[0].pop('_id', None)
            # print(user['id'])
            for u in result:
                if user['id'] in u:
                    for ic in u[user['id']]:
                        project = self.get_my_project(ic['project_id'])
                        if project:
                            project = Project.json_to_obj(project)
                            project.current_ic = None
                            ics.append(project.find_ic_by_id(ic, ic['ic_id'], project.root_ic))
                            ic_shares.append(ic)
        self._close_connection()
        return ics, ic_shares

    def get_my_project(self, project_id):
        col = self._db.Projects
        project_query = {'project_id': project_id}
        print(project_query)
        result = col.find_one(project_query, {'_id': 0})
        return result

    def get_project(self, project_name, user):
        col = self._db.Projects
        project_query = {'project_name': project_name}
        result = col.find_one(project_query, {'_id': 0})
        self._close_connection()
        return result

    # Finds user's Trashed items 
    def get_my_trash(self, user):
        users_trash =   self._db.Users.Trash
        trash =         self._db.Trash

        user = users_trash.find_one({'user_id': user['id']}, {'_id': 0})
        my_trashed_items = []

        if user:
            for trashed_item in user['trash']:
                item_query = {'project_id': trashed_item['project_id']}

                if trashed_item['type'] == 'project':
                    item_query['project_name'] = trashed_item['project_name']
                elif trashed_item['type'] == 'ic':
                    item_query['ic_id'] = trashed_item['ic_id']

                trash_tmp = trash.find_one(item_query, {'_id': 0})
                if trash_tmp:
                    my_trashed_items.append(trash_tmp) 

        self._close_connection()
        return my_trashed_items

    def update_file(self, project_name, file_obj, file=None):
        col = self._db.Projects
        # col_file = self._db.Projects.Files
        col_file = self._db.fs.files
        col_chunks = self._db.fs.chunks
        project_query = {'project_name': project_name}
        project_json = col.find_one(project_query, {'_id': 0})
        if project_json:
            project = Project.json_to_obj(project_json)
            if file:
                r = col_chunks.delete_many({"files_id": ObjectId(file_obj.stored_id)})
                r = col_file.remove({'file_id': file_obj.stored_id})
                file_obj.stored_id = str(self._fs.put(file,
                                                        file_id='default',
                                                        file_name=file_obj.name+file_obj.type, 
                                                        ic_id=file_obj.ic_id,
                                                        parent=file_obj.parent,
                                                        parent_id=file_obj.parent_id,
                                                        description='file_obj.description',
                                                        from_project=True
                                                        ))
                col_file.update_one({'file_id': 'default'},
                                    {'$set': {'file_id': str(file_obj.stored_id)}})
                project.update_file(file_obj)
            else:
                file_query = {'_id': ObjectId(file_obj.stored_id), 'file_name': file_obj.name+file_obj.type} 
                # print(file_query)
                file_json = col_file.find_one(file_query)
                if file_json is not None:
                    col_file.update_one({'file_id': file_json["file_id"]},
                                        {'$set': {'file_name': file_obj.name+file_obj.type,
                                                  'parent': file_obj.parent,
                                                  'parent_id': file_obj.parent_id,
                                                  'description': file_obj.description}})
                else:
                    print("update_file", msg.STORED_FILE_NOT_FOUND)
                    return msg.STORED_FILE_NOT_FOUND
            # print(file_obj.to_json())
            #project.update_file(file_obj)
            # print(project.to_json())
            col.update_one({'project_name': project.name}, {'$set': project.to_json()})

        self._close_connection()
        return msg.FILE_SUCCESSFULLY_UPDATED

    def update_file_annotations(self, request):
        col_file = self._db.fs.files
        file_query = {'file_id': request['stored_id']}
        stored_file = col_file.find_one(file_query, {'_id': 0})
        # print('get_file', file_query)
        if 'annotations' in stored_file:
            already_in = False
            for i, an in enumerate(stored_file['annotations']):
                if an['id'] == request['id']:
                    stored_file['annotations'][i] = request
                    already_in = True
                    break
            if not already_in:
                stored_file['annotations'].append(request)
        else:
            stored_file['annotations'] = [request]
        col_file.update(file_query, stored_file) 
        self._close_connection()
        return msg.FILE_SUCCESSFULLY_UPDATED

    def delete_file_annotation(self, request):
        col_file = self._db.fs.files
        file_query = {'file_id': request['stored_id']}
        stored_file = col_file.find_one(file_query, {'_id': 0})
        # print('get_file', file_query)
        if 'annotations' in stored_file:
            for i, an in enumerate(stored_file['annotations']):
                if an['id'] == request['id']:
                    stored_file['annotations'].pop(i)
                    break
        col_file.update(file_query, stored_file) 
        self._close_connection()
        return msg.FILE_SUCCESSFULLY_DELETED

    def get_file_annotations(self, stored_id):
        col_file = self._db.fs.files
        file_query = {'file_id': stored_id}
        stored_file = col_file.find_one(file_query, {'_id': 0})
        annotations = []
        if 'annotations' in stored_file:
            annotations = stored_file['annotations']
        self._close_connection()
        return annotations

    def upload_thumb(self, project_name, file_obj, thumb):
        col = self._db.Projects
        # col_file = self._db.Projects.Files
        col_file = self._db.fs.files
        file_query = {'file_name': file_obj.name + '_thumb' + file_obj.type, "parent_id": file_obj.parent_id} 
        file_json = self._fs.find_one(file_query)
        thumb_id = ''
        if file_json is None:
            thumb_id = str(self._fs.put(thumb,
                                            file_id='default',
                                            file_name=file_obj.name + '_thumb' + file_obj.type, 
                                            parent=file_obj.parent,
                                            parent_id=file_obj.parent_id
                                            ))
            col_file.update_one({'file_id': 'default'},
                                {'$set': {'file_id': str(thumb_id)}})

        else:
            print("upload_file", msg.IC_ALREADY_EXISTS)
            return thumb_id
        self._close_connection()
        return thumb_id

    def upload_file(self, project_name, file_obj, file=None):
        col = self._db.Projects
        # col_file = self._db.Projects.Files
        col_file = self._db.fs.files
        project_query = {'project_name': project_name}
        project_json = col.find_one(project_query, {'_id': 0})
        if project_json:
            project = Project.json_to_obj(project_json)
            file_query = {'file_name': file_obj.name+file_obj.type, "parent_id": file_obj.parent_id} 
            file_json = self._fs.find_one(file_query)

            # If No File Is Matching This Query - Create It
            if file_json is None:
                if file:
                    file_obj.stored_id = str(self._fs.put(file,
                                                        file_id='default',
                                                        file_name=file_obj.name+file_obj.type,
                                                        ic_id=file_obj.ic_id, 
                                                        parent=file_obj.parent,
                                                        parent_id=file_obj.parent_id,
                                                        description=file_obj.description,
                                                        from_project=True
                                                        ))
                    # col.update_one({'file_id': 'default'},
                    #                {'$set': {'file_id': str(stored_id)}})
                    col_file.update_one({'file_id': 'default'},
                                        {'$set': {'file_id': str(file_obj.stored_id)}})
                else:
                    file_query = {'_id': ObjectId(file_obj.stored_id), 'file_name': file_obj.name+file_obj.type} 
                    # print(file_query)
                    file_json = col_file.find_one(file_query)
                    if file_json is not None:
                        # del file_json["_id"]
                        # #file_json["file_id"] = "default"
                        # file_json["file_name"] = file_obj.name+file_obj.type 
                        # file_json["parent"] = str(file_obj.parent),
                        # file_json["parent_id"] = str(file_obj.parent_id),
                        # # print("STORED", file_obj.parent, file_obj.parent_id, file_json)
                        # file_obj.stored_id = str(col_file.insert_one(file_json)
                        #                 .inserted_id)
                        file = self.get_file({'file_name': file_json["file_name"]})
                        if file:
                            file_obj.stored_id = str(self._fs.put(file,
                                                            file_id='default',
                                                            file_name=file_obj.name+file_obj.type,
                                                            ic_id=file_obj.ic_id, 
                                                            parent=file_obj.parent,
                                                            parent_id=file_obj.parent_id,
                                                            description=file_obj.description,
                                                            from_project=True
                                                            ))
                            col_file.update_one({'file_id': 'default'},
                                            {'$set': {'file_id': str(file_obj.stored_id)}})
                        else:
                            print("upload_file", msg.STORED_FILE_NOT_FOUND)
                            return msg.STORED_FILE_NOT_FOUND
                    else:
                        print("upload_file", msg.STORED_FILE_NOT_FOUND)
                        return msg.STORED_FILE_NOT_FOUND

                add, ic = project.add_ic(file_obj, project.root_ic)
                if add == msg.IC_SUCCESSFULLY_ADDED:
                    # print(project.to_json())
                    col.update_one({'project_name': project.name}, {'$set': project.to_json()})
            else:
                # Create A Copy Of A File
                copy_of_a_file = file_obj
                copy_of_a_file.name = copy_of_a_file.name + " copy"
                self.upload_file(project_name, copy_of_a_file, file)

                print("upload_file", msg.IC_ALREADY_EXISTS)
                return msg.IC_ALREADY_EXISTS
        else:
            print("upload_file", msg.PROJECT_NOT_FOUND)
            return msg.PROJECT_NOT_FOUND
        self._close_connection()
        return add

    def create_folder(self, project_name, folder):
        ic = None
        col = self._db.Projects
        project_query = {'project_name': project_name}
        project_json = col.find_one(project_query, {'_id': 0})
        if project_json:
            project = Project.json_to_obj(project_json)

            message, ic = project.add_ic(folder, project.root_ic)
            if message == msg.IC_SUCCESSFULLY_ADDED:
                col.update_one({'project_name': project.name}, {'$set': project.to_json()})
        else:
            print(msg.PROJECT_NOT_FOUND)
            return msg.PROJECT_NOT_FOUND
        self._close_connection()
        return message, ic

    def rename_ic(self, request_data, user):
        col = self._db.Projects
        # col_file = self._db.Projects.Files
        col_file = self._db.fs.files
        col_shared = self._db.Projects.Shared

        project_query = {'project_name': request_data['project_name']}
        project_json = col.find_one(project_query, {'_id': 0})

        if project_json:
            project = Project.json_to_obj(project_json)
            # print(project.to_json())
            add = project.rename_ic(request_data, user, project.root_ic)

            if add == msg.IC_SUCCESSFULLY_RENAMED:
                if request_data['parent_id'] == 'root':
                    project.name = request_data['new_name']

                file_updated = True

                if not request_data['is_directory']:
                    file_updated = False
                    file_query = {'file_name': request_data['old_name']}
                    file_json = col_file.find_one(file_query)
                    if file_json:
                        new_name = request_data['new_name']
                        new_name_has_extension = len(new_name.split('.')) > 1
                        if not new_name_has_extension:
                            old_name_extension = '.' + request_data['old_name'].split('.')[-1]
                            new_name = new_name + old_name_extension
                        col_file.update_one({'file_name': request_data['old_name']},
                                            {'$set': {'file_name': new_name}})
                        file_updated = True
                    else:
                        print(msg.STORED_FILE_NOT_FOUND)
                        return msg.STORED_FILE_NOT_FOUND, None

                if file_updated:
                    print(project.to_json())
                    col.update_one({'project_name': request_data['project_name']}, {'$set': project.to_json()})
                    # update shared:
                    # find collection
                    # filter through entries
                    # find matching project id
                    # change project name
                    if len(list(col_shared.find())):
                        shared_collection = col_shared.find()[0]
                        for user_id in shared_collection:
                            if user_id == "_id": continue
                            for i, ic in enumerate(shared_collection[user_id]):
                                if ic['project_id'] == project.project_id:
                                    shared_collection[user_id][i]['project_name'] = project.name
                        col_shared.update_one(
                            {'_id': shared_collection['_id']}, 
                            {"$set" : shared_collection})
        else:
            print(msg.PROJECT_NOT_FOUND)
            return msg.PROJECT_NOT_FOUND, None
        self._close_connection()
        return add, project

    # TODO update all users that share the project's trash
    def trash_ic(self, ic_data):
        # database tables
        users =         self._db.Users.Roles
        projects =      self._db.Projects
        trash =         self._db.Trash              # trashed items
        users_trash =   self._db.Users.Trash        # user's trash info
        shared =        self._db.Projects.Shared

        print("My data >>>>>>>", ic_data)
        if ic_data['project_name'] != 'Shared':
            project_query = {'project_name': ic_data['project_name']}
        else:
            project_query = {'project_id': ic_data['project_id']}

        project_json = projects.find_one(project_query, {'_id': 0})

        if project_json:
            # Trashing projects
            if ic_data['parent_id'] == 'root':
                # Check user rights => if you want jsut owner, you can put > Role.OWNER.value, etc.
                this_user = users.find_one({'user_id': ic_data['user_id']}, {'_id': 0})
                if this_user:
                    for obj in this_user['projects']:
                        if obj['project_id'] == project_json['project_id']:
                            if obj['role'] > Role.OWNER.value:
                                return msg.USER_NO_RIGHTS                        
                else:
                    return msg.USER_NOT_FOUND

                # 'move' project to Trash
                trash.insert_one(project_json)
                projects.delete_one(project_query)

                # update user's info (projects & trash)
                all_users = users.find()
                if all_users:
                    for user in all_users:
                        for count, user_project in enumerate(user['projects']):
                            # skip irrelevant projects
                            if user_project['project_id'] != project_json['project_id']:
                                continue
                            
                            # update owners's trash
                            if user_project['role'] == Role.OWNER.value:
                                new_trash = {
                                    'type': 'project',
                                    'project_id': user_project['project_id'],
                                    'project_name': ic_data['project_name']
                                }

                                my_trash = users_trash.find_one({'user_id': user['user_id']}, {'_id':0})

                                if my_trash:
                                    my_trash['trash'].append(new_trash)
                                    users_trash.update_one({'user_id': user['user_id']}, 
                                        {'$set': {'trash': my_trash['trash']}})
                                else:
                                    trash_tmp = []
                                    trash_tmp.append(new_trash)
                                    users_trash.insert_one({'user_id': user['user_id'], 'trash': trash_tmp})
                                    del trash_tmp

                                delete = msg.PROJECT_SUCCESSFULLY_TRASHED

                            # update user's projects
                            del user['projects'][count]
                            users.update_one({'user_id': user['user_id']}, 
                                {'$set': {'projects': user['projects']}})                                        
                
            # Trashing ic/sub folders or files
            else:
                # find the ic in project ...
                # ... add project_id to it
                # put this IC to Trash collection

                # check trash privileges
                all_shared = shared.find()
                for shared_ic in all_shared:
                    if ic_data['user_id'] in shared_ic.keys():
                        for obj in shared_ic[ic_data['user_id']]:
                            if obj['ic_id'] == ic_data['ic_id']:
                                if obj['role'] > Role.ADMIN.value:
                                    return msg.USER_NO_RIGHTS

                project = Project.json_to_obj(project_json)
                this_ic = project.find_ic_by_id(ic_data, ic_data['ic_id'], project.root_ic).to_json()
                this_ic['project_id'] = project.project_id
                trash.insert_one(this_ic)
                
                # delete ic/update from the project
                delete = project.trash_ic(ic_data, project.root_ic)

                # update project
                projects.update_one({'project_id': this_ic['project_id']}, {'$set': project.to_json()})

                roles = self._db.Roles
                owner_id = roles.find_one({'project_id': ObjectId(project.project_id)}, {'_id': 0})['user'][0]['id']
                                
                # update user's shared projects
                if len(list(shared.find())):
                    this_user_shared = shared.find()[0]
                    for key in this_user_shared.keys():
                        if key == '_id':
                            continue
                        for i, obj in enumerate(this_user_shared[key]):
                            if obj['project_id'] == project_json['project_id'] and obj['ic_id'] == ic_data['ic_id']:
                                del this_user_shared[key][i]

                    shared.update_one({'_id': this_user_shared['_id']}, {'$set': this_user_shared})

                # update owner's trash
                if owner_id:
                    new_trash = {
                        'type': 'ic',
                        'project_id': this_ic['project_id'],
                        'ic_id': ic_data['ic_id']
                    }
                    
                    my_trash = users_trash.find_one({'user_id': owner_id}, {'_id':0})
                    if my_trash:
                        my_trash['trash'].append(new_trash)
                        users_trash.update_one({'user_id': owner_id}, {'$set': {'trash': my_trash['trash']}})
                    else:
                        trash_tmp = []
                        trash_tmp.append(new_trash)
                        users_trash.insert_one({'user_id': owner_id, 'trash': trash_tmp})
                        del trash_tmp                    
                    
                    delete = msg.IC_SUCCESSFULLY_TRASHED
        else:
            print("trash_ic", msg.PROJECT_NOT_FOUND)
            return msg.PROJECT_NOT_FOUND

        self._close_connection()
        return delete

    # restores projects or other directories/files from trash
    def restore_ic(self, restore_ic_data):
        # database tables
        users_roles =   self._db.Users.Roles
        projects =      self._db.Projects
        trash =         self._db.Trash          # trashed items
        users_trash =   self._db.Users.Trash    # user trash info

        trashed_query = dict()
        if restore_ic_data['ic_id'] == '':  # if its a project
            trashed_query = {'project_id': restore_ic_data['project_id'], 'project_name': restore_ic_data['restore_name']} #TODO project name
        else:  # if its IC
            trashed_query = {'project_id': restore_ic_data['project_id'], 'ic_id': restore_ic_data['ic_id']}
        
        project_or_ic_json = trash.find_one(trashed_query, {'_id': 0}) # get project/ic from DB

        '''restoring projects'''
        # find project in Trash
        # restore from Trash to Projects
        # update Users.Roles and Users.Trash
        # delete from Trash
        if not project_or_ic_json:
            restored = msg.PROJECT_NOT_FOUND 
        else:
            if restore_ic_data['parent_id'] == 'root':  
                ''' restoring projects '''
                projects.insert_one(project_or_ic_json)

                my_projects =   users_roles.find_one({'user_id': restore_ic_data['user_id']}, {'_id': 0})
                my_trash =      users_trash.find_one({'user_id': restore_ic_data['user_id']}, {'_id': 0})

                for trashed_ic in my_trash['trash']:
                    # if item in trash matches our query
                    print(trashed_ic)
                    if trashed_ic['project_id'] == restore_ic_data['project_id']:
                        my_projects['projects'].append({'project_id': trashed_ic['project_id'], 'role': 0})
                        my_trash['trash'].remove(trashed_ic)

                # update collections
                users_roles.update_one({'user_id': restore_ic_data['user_id']}, {'$set': {'projects': my_projects['projects']}})
                users_trash.update_one({'user_id': restore_ic_data['user_id']}, {'$set': {'trash': my_trash['trash']}})

                # remove
                trash.delete_one(trashed_query)
                restored = msg.PROJECT_SUCCESSFULLY_RESTORED
            else:
                '''restoring IC'''
                # get the IC from Trash
                # find the project in Project
                my_project = projects.find_one({'project_id': restore_ic_data['project_id']}, {'_id': 0})

                if my_project:  # TODO take path and add in-between folders
                    my_project = Project.json_to_obj(my_project)
                    # find the parent_id inside project
                    my_ic_parent_old = my_project.find_parent_by_id(restore_ic_data['parent_id'], my_project.root_ic)

                    if my_ic_parent_old:
                        my_ic_parent_new = my_ic_parent_old

                        # insert trashed ic into the parent
                        my_ic_parent_new.sub_folders.append(Project.json_folders_to_obj(project_or_ic_json))

                        # insert the ic to project
                        my_project.update_ic(my_ic_parent_new, my_ic_parent_old)

                        # update project
                        projects.update_one({'project_id': restore_ic_data['project_id']}, {'$set': my_project.to_json()})

                        # delete from Trash
                        trash.delete_one(trashed_query)
                        # update trash
                        my_trash = users_trash.find_one({'user_id': restore_ic_data['user_id']}, {'_id': 0})
                        for trashed_item in my_trash['trash']:
                            if trashed_item['project_id'] == restore_ic_data['project_id'] \
                            and trashed_item['ic_id'] == restore_ic_data['ic_id']:
                                my_trash['trash'].remove(trashed_item)

                        users_trash.update_one({'user_id': restore_ic_data['user_id']}, {'$set': {'trash': my_trash['trash']}})
                        restored = msg.IC_SUCCESSFULLY_RESTORED
                    else:
                        restored = msg.IC_FAILED_RESTORE_PARENT_NOT_FOUND
                else:
                    restored = msg.PROJECT_NOT_FOUND

        return restored

    def delete_sub_chunks(self, ic, files, file_chunks):
        if not ic['is_directory']:
            files.delete_one({'file_id': ic['stored_id']})
            file_chunks.delete_many({'files_id': ObjectId(ic['stored_id'])})
        else:
            for sub_folder in ic['sub_folders']:
                self.delete_sub_chunks(sub_folder, files, file_chunks)

    # deletes projects permanently (from database)
    def delete_ic(self, delete_ic_data):
        '''
        # check and find specific item in trash
        # destroy it
        # update user's trash
        '''
        trash =         self._db.Trash
        users_trash =   self._db.Users.Trash
        files =         self._db.fs.files
        file_chunks =   self._db.fs.chunks
        
        # query config
        delete_query = dict()
        if delete_ic_data['parent_id'] == 'root':
            delete_query = {
                'project_id':   delete_ic_data['project_id'], 
                'project_name': delete_ic_data['delete_name']
            } 
            response = msg.PROJECT_NOT_FOUND
        else:
            delete_query = {
                'project_id':   delete_ic_data['project_id'], 
                'ic_id':        delete_ic_data['ic_id']
            }
            response = msg.STORED_FILE_NOT_FOUND

        project_or_ic_json = trash.find_one(delete_query, {'_id': 0})
        if project_or_ic_json:
            # delete all project files from trash / delete a file and chunks related / delete just ic
            if 'project_name' in project_or_ic_json.keys():
                # delete all file chunks in the project
                for sub_folder in project_or_ic_json['root_ic']['sub_folders']:
                    self.delete_sub_chunks(sub_folder, files, file_chunks)
                trash.delete_many({'project_id': delete_ic_data['project_id']})
                response = msg.PROJECT_SUCCESSFULLY_DELETED
            elif 'stored_id' in project_or_ic_json.keys():
                trash.delete_one(delete_query)
                files.delete_one({'file_id': project_or_ic_json['stored_id']})
                file_chunks.delete_many({'files_id': ObjectId(project_or_ic_json['stored_id'])})
                response = msg.FILE_SUCCESSFULLY_DELETED
            elif 'ic_id' in project_or_ic_json.keys():
                # delete all file chunks in the IC
                self.delete_sub_chunks(project_or_ic_json, files, file_chunks)
                trash.delete_one(delete_query)
                response = msg.IC_SUCCESSFULLY_DELETED

            # update user's trash TODO trash should store specific ic data, not just project id
            my_trash = users_trash.find_one({'user_id': delete_ic_data['user_id']})
            for trashed_item in my_trash['trash']:
                if trashed_item['project_id'] == delete_ic_data['project_id']:
                    my_trash['trash'].remove(trashed_item)
                    if len(my_trash['trash']) > 0:
                        users_trash.update_one(
                            {'user_id': delete_ic_data['user_id']}, 
                            {'$set': {'trash': my_trash['trash']}})
                    else:
                        users_trash.delete_one({'user_id': delete_ic_data['user_id']})
                    break
        
        self._close_connection()
        return response

    def empty_my_trash(self, user):
        # find user in Users.Trash
        # find all his trashed items
        # destroy them
        # update user's trash
        users_trash =   self._db.Users.Trash
        trash =         self._db.Trash
        files =         self._db.fs.files
        file_chunks =   self._db.fs.chunks

        this_user = users_trash.find_one({'user_id': user['user_id']}, {'_id': 0})
        if this_user:
            trash_to_del = []
            for trashed_item in this_user['trash']:
                if trashed_item['type'] == 'project':
                    item_query = {'project_id': trashed_item['project_id'], 'project_name': trashed_item['project_name']}
                elif trashed_item['type'] == 'ic':
                    item_query = {'project_id': trashed_item['project_id'], 'ic_id': trashed_item['ic_id']}

                # delete associated files
                project_or_ic_json = trash.find_one(item_query)
                if 'stored_id' in project_or_ic_json.keys():
                    files.find_one_and_delete({'file_id': project_or_ic_json['stored_id']})
                    file_chunks.delete_many({'files_id': ObjectId(project_or_ic_json['stored_id'])})
                    del project_or_ic_json

                # delete item from trash
                if trash.find_one_and_delete(item_query): 
                    trash_to_del.append(trashed_item)

            for x in trash_to_del:
                this_user['trash'].remove(x)

            users_trash.update_one({'user_id': user['user_id']}, {'$set': {'trash': this_user['trash']}})
            self.trash_clear(user['user_id'])
        
        self._close_connection
        return msg.TRASH_SUCCESSFULLY_EMPTIED

    # remove user entry from Users.Trash if empty
    def trash_clear(self, user_id):
        users_trash =   self._db.Users.Trash
        user_query = {'user_id': user_id}
        user = users_trash.find_one(user_query, {'_id': 0})
        if len(user['trash']) < 1:
            users_trash.find_one_and_delete(user_query)
        return

    def get_file(self, request):
        stored_file = None
        print('get_file', request)
        for grid_out in self._fs.find(request, no_cursor_timeout=True):
            stored_file = grid_out
        self._close_connection()
        return stored_file

    def get_ic_object(self, project_name, request_data, file_name):
        col = self._db.Projects
        project_query = {'project_name': project_name}
        project_json = col.find_one(project_query, {'_id': 0})
        ic = None
        if project_json:
            project = Project.json_to_obj(project_json)
            ic = project.find_ic(request_data, file_name, project.root_ic)
        return ic

    def get_project_from_shared(self, request_data, user):
        # {'name': 'Shared', 'parent_id': 'root', 'ic_id': '208cd13a-36ec-11eb-9b62-50e085759744'}
        col = self._db.Projects
        ics, ic_shares = self.get_my_shares(user)
        shared_ic = None
        project_json = None
        for i in ic_shares:
            if request_data['ic_id'] == i['ic_id']:
                shared_ic = i
                project_json = self.get_project(i['project_name'], user)
                break
        if not shared_ic:
            for i in ic_shares:
                project_json = self.get_project(i['project_name'], user)
                project = Project.json_to_obj(project_json)
                project.current_ic = None
                shared_ic_obj = project.find_ic_by_id(request_data, request_data['ic_id'], project.root_ic)
                if shared_ic_obj:
                    break
                project_json = None
        return project_json

    def get_project_from_shared_by_parent_id(self, request_data, user):
        # {'name': 'Shared', 'parent_id': 'root', 'ic_id': '208cd13a-36ec-11eb-9b62-50e085759744'}
        col = self._db.Projects
        ics, ic_shares = self.get_my_shares(user)
        shared_ic = None
        project_json = None
        for i in ic_shares:
            if request_data['parent_id'] == i['parent_id']:
                shared_ic = i
                project_json = self.get_project(i['project_name'], user)
                break
        if not shared_ic:
            for i in ic_shares:
                project_json = self.get_project(i['project_name'], user)
                project = Project.json_to_obj(project_json)
                project.current_ic = None
                shared_ic_obj = project.find_parent_by_id(request_data['parent_id'], project.root_ic)
                if shared_ic_obj:
                    break
                project_json = None
        return project_json

    def get_ic_object_from_shared(self, request_data, user):
        # {'name': 'Shared', 'parent_id': 'root', 'ic_id': '208cd13a-36ec-11eb-9b62-50e085759744'}
        col = self._db.Projects
        ics, ic_shares = self.get_my_shares(user)
        shared_ic = None
        ic = None
        for i in ic_shares:
            if request_data['ic_id'] == i['ic_id']:
                shared_ic = i
                break
        if not shared_ic:
            for i in ic_shares:
                project_json = self.get_project(i['project_name'], user)
                project = Project.json_to_obj(project_json)
                project.current_ic = None
                shared_ic_obj = project.find_ic_by_id(request_data, request_data['ic_id'], project.root_ic)
                if shared_ic_obj:
                    shared_ic = shared_ic_obj.to_json()
                    shared_ic['project_name'] = i['project_name']
                    break
        if shared_ic:
            project_query = {'project_name': shared_ic['project_name']}
            project_json = col.find_one(project_query, {'_id': 0})
            if project_json:
                project = Project.json_to_obj(project_json)
                ic = project.find_ic_by_id(request_data, request_data['ic_id'], project.root_ic)
        return ic

    def get_post_file(self, request_json):
        stored_file = None
        file_query = request_json
        for grid_out in self._fs.find(file_query, no_cursor_timeout=True):
            stored_file = grid_out
        self._close_connection()
        return stored_file

    def get_file_size(self, stored_id, asstr):
        Files = self._db.fs.files
        file_query = {"file_id": stored_id}
        file_json = Files.find_one(file_query, {"_id": 0})
        if not file_json: return msg.STORED_FILE_NOT_FOUND
        size = int(file_json['length'])
        unit = 0
        while len(str(size).split('.')[0]) > 3:
            size = round(size / 1024, 2)
            unit += 1

        if unit == 0:
            unit = 'B'
        elif unit == 1:
            unit = 'KB'
        elif unit == 2:
            unit = 'MB'
        elif unit == 3:
            unit = 'GB'
            
        if asstr:
            try:
                size = str(size) + ' ' + unit
            except:
                size = str(size) + ' ' + str(unit)
        return size

    def change_color(self, file_obj):
        col = self._db.Projects
        project_query = {'project_name': file_obj["project_name"]}
        project_json = col.find_one(project_query, {'_id': 0})
        if project_json:
            project = Project.json_to_obj(project_json)
            if file_obj['ic_id'] == '':
                file_obj['ic_id'] = project.root_ic.ic_id
            add = project.change_color(file_obj, project.root_ic)
            if add == msg.IC_COLOR_CHANGED:
                col.update_one({'project_name': project.name}, {'$set': project.to_json()})
            else:
                print(msg.DEFAULT_ERROR)
                return msg.DEFAULT_ERROR
        else:
            print(msg.PROJECT_NOT_FOUND)
            return msg.PROJECT_NOT_FOUND
        # self._close_connection()
        return add

    def create_post(self, request_json):
        col = self._db.Marketplace.Posts
        col_tags = self._db.Tags

        posts_query = {'post_id': request_json['post_id']}
        message = msg.POST_ALREADY_EXISTS
        post_id = ''

        if col.find_one(posts_query, {'_id': 0}) is None:
            post_id = col.insert_one(request_json).inserted_id
            post_id = str(post_id)
            col.update_one({'post_id': 'default'}, {'$set': {'post_id': post_id}})
            
            if len(request_json['tags']):
                tags = col_tags.find()
                results = list(tags)
                request_tags = request_json['tags']
                tag_json = {}
                if len(results) != 0:
                    results[0].pop('_id', None)
                    tags = results[0]
                    for i in range(0, len(request_tags)):
                        tag = request_tags[i]
                        if tag['tag'] in tags:
                            if tag['tag'].startswith('#'):
                                # add this post to a tag
                                tags[tag['tag']].append({'post_id': post_id})
                                col_tags.update_one({'id': tags['id']}, {'$set': tags})
                                break
                        else:
                            # create a new tag and add this post
                            if request_tags[i]['tag'].startswith('#'):
                                tag_json[request_tags[i]['tag']] = [{'post_id': post_id}]
                                col_tags.update({'id': tags['id']}, {'$set': tag_json})
                    print('Tags added successfully')
                else:
                    # if no tags exist in db, create new entry
                    for i in range(0, len(request_tags)):
                        tag = request_tags[i]['tag']

                        if tag.startswith('#'):
                            tag_json[tag] = [{'post_id': post_id}]

                    tag_json['id'] = 'tags_collection'
                    col_tags.insert_one(tag_json)
                    print('Tags added successfully')

            message = msg.POST_CREATED
            print(Post.json_to_obj(request_json).product.name)
        self._close_connection()
        return message, str(post_id)

    def edit_post(self, request_json):
        col = self._db.Marketplace.Posts
        posts_query = {'post_id': request_json['post_id']}
        message = msg.POST_NOT_FOUND
        if col.find_one(posts_query, {'_id': 0}):
            col.update_one(posts_query,
                           {'$set': request_json})
            message = msg.POST_EDITED
        self._close_connection()
        return message

    def get_all_posts(self):
        col = self._db.Marketplace.Posts
        result = col.find()
        res = []
        for doc in result:
            doc.pop('_id', None)
            doc.pop('bids', None)
            doc.pop('current_best_bid', None)
            res.append(doc)
        self._close_connection()
        return res

    def get_my_posts(self, user):
        col = self._db.Marketplace.Posts
        post_query = {'user_owner': user}
        result = col.find(post_query, {'_id': 0})
        res = []
        for doc in result:
            doc.pop('_id', None)
            res.append(doc)
        self._close_connection()
        return res

    def upload_post_file(self, request_json, file):
        col = self._db.fs.files
        file_query = {'file_name': request_json['file_name']}
        file_json = self._fs.find_one(file_query)
        stored_id = ''
        # message = msg.DEFAULT_ERROR
        # if file_json is None:
        stored_id = str(self._fs.put(file,
                                     file_id='default',
                                     post_id=request_json['user'],
                                     file_name=request_json['file_name'],
                                     type=request_json['type'],
                                     from_project=False
                                     ))
        col.update_one({'file_id': 'default'},
                       {'$set': {'file_id': str(stored_id)}})
        message = msg.IC_SUCCESSFULLY_ADDED

        self._close_connection()
        return message, str(stored_id)

    def remove_post_file(self, request_json):
        col = self._db.fs.files
        col_file_chunks = self._db.fs.chunks
        file_query = {#'file_name': request_json['file_name'],
                      'file_id': request_json['file_id']}
        file_json = self._fs.find_one(file_query)
        message = msg.STORED_FILE_NOT_FOUND
        if file_json and not file_json.from_project:
            col.delete_many(file_query)
            col_file_chunks.delete_many(file_query)
            message = msg.FILE_SUCCESSFULLY_DELETED
        if 'post_id' in request_json:
            col_post = self._db.Marketplace.Posts
            posts_query = {'post_id': request_json['post_id']}
            post_json = col_post.find_one(posts_query, {'_id': 0})
            if post_json:
                # print('****', post_json)
                post = Post.json_to_obj(post_json)
                if 'image' in request_json['type']:
                    post.documents['image'].remove({'id': request_json['file_id'], 'name': request_json['file_name']})
                if 'doc' in request_json['type']:
                    post.documents['doc'].remove({'id': request_json['file_id'], 'name': request_json['file_name']})
                col_post.update_one(posts_query, {'$set': post.to_json()})
                message = msg.FILE_SUCCESSFULLY_DELETED_FORM_POST

        self._close_connection()
        return message

    def update_post_file(self, file, post_id, user):
        col = self._db.fs.files
        file_query = {'file_name': file, 'post_id': user['username']}
        col.update_one(file_query,
                       {'$set': {'post_id': post_id}})
        message = msg.IC_SUCCESSFULLY_ADDED
        return message

    def create_bid(self, request_json):
        col = self._db.Marketplace.Bids
        col_post = self._db.Marketplace.Posts
        bid_query = {'bid_id': request_json['bid_id']}
        message = msg.BID_ALREADY_EXISTS
        if col.find_one(bid_query, {'_id': 0}) is None:
            bid_id = col.insert_one(request_json).inserted_id
            col.update_one({'bid_id': 'default'},
                           {'$set': {'bid_id': str(bid_id)}})
            message = msg.BID_CREATED
            print(Bid.json_to_obj(request_json))
            post_query = {'post_id': request_json['post_id']}
            post = col_post.find_one(post_query, {'_id': 0})
            if post:
                post['bids'].append(str(bid_id))
                col_post.update_one(post_query,
                               {'$set': post})
        self._close_connection()
        return message

    def get_all_bids(self):
        col = self._db.Marketplace.Bids
        result = col.find()
        res = []
        for doc in result:
            doc.pop('_id', None)
            res.append(doc)
        self._close_connection()
        return res

    def get_my_bids(self, user):
        col = self._db.Marketplace.Bids
        bid_query = {'user': user}
        result = col.find(bid_query, {'_id': 0})
        res = []
        for doc in result:
            doc.pop('_id', None)
            res.append(doc)
        self._close_connection()
        return res

    def get_single_post(self, request_json):
        col = self._db.Marketplace.Posts
        bid_post_query = {'post_id': request_json['post_id']}
        result = col.find(bid_post_query, {'_id': 0})
        res = []
        for doc in result:
            doc.pop('_id', None)
            res.append(doc)
        self._close_connection()
        return res

    def get_single_bid(self, request_json):
        col = self._db.Marketplace.Bids
        bid_post_query = {'bid_id': request_json['bid_id']}
        result = col.find(bid_post_query, {'_id': 0})
        res = []
        for doc in result:
            doc.pop('_id', None)
            res.append(doc)
        self._close_connection()
        return res

    def get_bids_for_post(self, request_json):
        col = self._db.Marketplace.Bids
        post_query = {'post_id': request_json['post_id']}
        result = col.find(post_query, {'_id': 0})
        res = []
        for doc in result:
            doc.pop('_id', None)
            res.append(doc)
        self._close_connection()
        return res

    # TODO failsafe, case insensitive *to lower*
    def share_project(self, request_data, user):
        # print('\n\n\n', request_data)
        col_users = self._db.Users.Roles
        col = self._db.Users
        user_query = {'user_id': user['id']}
        u = col_users.find_one(user_query, {'_id': 0})
        no_rights = True
        if u:
            if 'project_id' not in request_data:
                project_json = self.get_project(request_data['project_name'], user)
                request_data['project_id'] = project_json['project_id']
            for pr in u['projects']:
                if request_data['project_id'] == pr['project_id']:
                    if pr['role'] != Role.WATCHER.value:
                        no_rights = False
                    break

        if no_rights:
            return msg.USER_NO_RIGHTS

        user_query = {'username': request_data['user_name'].strip()}
        new_user = col.find_one(user_query, {'_id': 0})
        if new_user:
            user_id = new_user['id']
            user_query = {'user_id': user_id}
            u = col_users.find_one(user_query, {'_id': 0})
            if not u:
                u = {}
                u['projects'] = []
                u['user_id'] = user_id
                col_users.insert_one(u)

            # Check If User Already Has Access To The Project
            p = self.get_my_project(request_data['project_id'])
            for a in p['root_ic']['access']:
                if a['user']['user_id'] == user_id:
                    return msg.ACCESS_ALREADY_EXISTS

            if not request_data['role']:
                request_data['role'] = 'ADMIN'
                
            role = getattr(Role, request_data['role']).value
            u['projects'].append({'project_id': request_data['project_id'],
                                  'role': role,
                                  'exp_date': request_data['exp_date']})

            col_users.update_one(user_query, {'$set': u})

            project = Project.json_to_obj(p)
            project.set_access_for_all_ics(request_data, new_user, role, project.root_ic)
            self.update_project(project, new_user)
            message = msg.SUCCESSFULLY_SHARED

        else:
            message = msg.USER_NOT_FOUND
        self._close_connection()
        return message

    def update_share_project(self, request_data, user):
        # print('\n\n\n', request_data)
        col_users = self._db.Users.Roles
        col = self._db.Users
        user_query = {'user_id': user['id']}
        u = col_users.find_one(user_query, {'_id': 0})
        no_rights = True
        if u:
            if 'project_id' not in request_data:
                project_json = self.get_project(request_data['project_name'], user)
                request_data['project_id'] = project_json['project_id']
            for pr in u['projects']:
                if request_data['project_id'] == pr['project_id']:
                    if pr['role'] != Role.WATCHER.value:
                        no_rights = False
                    break
        if no_rights:
            return msg.USER_NO_RIGHTS

        user_query = {'id': request_data['user']['user_id']}
        new_user = col.find_one(user_query, {'_id': 0})
        if new_user:
            user_id = new_user['id']
            user_query = {'user_id': user_id}
            u = col_users.find_one(user_query, {'_id': 0})
            new_role = ''
            exp_date = ''
            for pu in u['projects']:
                if pu['project_id'] == project_json['project_id']:
                    new_role = pu['role']
                    exp_date = pu['exp_date']
            if request_data['new_role'] != '':
                new_role = getattr(Role, request_data['new_role']).value
            if request_data['exp_date'] != '':
                exp_date = request_data['exp_date']
            for proj in u['projects']:
                if proj['project_id'] == request_data['project_id']:
                    proj['role'] = new_role

            for pu in u['projects']:
                if pu['project_id'] == project_json['project_id']:
                    pu.update({'project_id': project_json['project_id'],
                                  'role': new_role,
                                  'exp_date': exp_date})
            col_users.update_one(user_query,
                                 {'$set': u})
            p = self.get_my_project(request_data['project_id'])
            project = Project.json_to_obj(p)
            project.update_access_for_all_ics(new_user, new_role, exp_date, project.root_ic)
            self.update_project(project, new_user)
            message = msg.SUCCESSFULLY_UPDATED

        else:
            message = msg.USER_NOT_FOUND
        self._close_connection()
        return message

    def remove_share_project(self, request_data, session_user):
        # {'project_name': 'CV', 
        # 'ic_id': '22674965-395f-11eb-870a-001fb529734f', 
        # 'parent_id': 'root', 
        # 'is_directory': True, 
        # 'role': 'ADMIN', 
        # 'user': {
        #           'user_id': '4d022b14-33e1-11eb-91e1-50e085759744', 
        #           'username': '222', 
        #           'picture': '5fc652bfdca9c896287f57b6'
        # }
        # }

        col = self._db.Projects
        col_users = self._db.Users.Roles
        user_query = {'user_id': session_user['id']}
        u = col_users.find_one(user_query, {'_id': 0})
        no_rights = True
        project_json = None
        if u:
            project_json = self.get_project(request_data['project_name'], session_user)
            for pr in u['projects']:
                if project_json['project_id'] == pr['project_id']:
                    if pr['role'] != Role.WATCHER.value:
                        no_rights = False
                    break
        if no_rights:
            return msg.USER_NO_RIGHTS
        if 'user_id' in request_data['user']:
            user_id = request_data['user']['user_id']
            user_query = {'user_id': user_id}
            u = col_users.find_one(user_query, {'_id': 0})
            role = getattr(Role, request_data['role']).value
            print('******', u)
            print('project_id', project_json['project_id'])
            print('******', {'project_id': project_json['project_id'],
                                  'role': role,
                                  'exp_date': request_data['exp_date']})
            u['projects'].remove({'project_id': project_json['project_id'],
                                  'role': role,
                                  'exp_date': request_data['exp_date']})
            print('+-+-', u)
            col_users.update_one(user_query,
                                 {'$set': u})

            p = self.get_my_project(project_json['project_id'])
            project = Project.json_to_obj(p)
            project.remove_access_for_all_ics(request_data['user'], role, project.root_ic)
            self.update_project(project, session_user)

            message = msg.SUCCESSFULLY_REMOVED_PROJECT_ACCESS

        else:
            message = msg.USER_NOT_FOUND
        self._close_connection()
        return message

    def add_comment(self, request_data, comment):
        if 'post_id' in request_data.keys():
            return self.add_comment_to_post(request_data, comment)
            
        col = self._db.Projects
        # col_file = self._db.Projects.Files
        project_query = {'project_name': request_data['project_name']}
        project_json = col.find_one(project_query, {'_id': 0})
        if project_json:
            project = Project.json_to_obj(project_json)
            message = project.add_comment(request_data, comment, project.root_ic)
            if message == msg.COMMENT_SUCCESSFULLY_ADDED:
                col.update_one({'project_name': project.name}, {'$set': project.to_json()})

        else:
            message = msg.PROJECT_NOT_FOUND
        self._close_connection()
        return message

    def add_comment_to_post(self, request_data, comment):
        # find post
        posts = self._db.Marketplace.Posts
        bids = self._db.Marketplace.Bids
        post_query = {'post_id': request_data['post_id']}
        post = posts.find_one(post_query, {'_id': 0})
        if post:
            bids_array = []
            for i in range(len(post['bids'])):
                bid_query = {'bid_id': post['bids'][i]}
                post['bids'][i] = bids.find_one(bid_query, {'_id': 0})
            post = Post.json_to_obj(post)
            post.comments.append(comment.to_json())
            posts.update_one(post_query, {'$set': post.to_json()})

            message = msg.COMMENT_SUCCESSFULLY_ADDED
        else:
            message = msg.POST_NOT_FOUND

        self._close_connection()
        return message

    def update_comment(self, request_data):
        if 'post_id' in request_data.keys():
            return self.update_post_comment(request_data)

        # find project
        projects = self._db.Projects
        project_query = {'project_name': request_data['project_name']}
        project_json = projects.find_one(project_query, {'_id': 0})

        if project_json:
            # find ic
            project = Project.json_to_obj(project_json)
            ic = project.find_ic_by_id(request_data, request_data['ic_id'], project.root_ic)
            ic_new = ic
            comments = ic_new.comments

            # find & replace comment
            for i, comment in enumerate(comments):
                if comment.id == request_data['comment_id']:
                    # security check
                    if comment.user['user_id'] != request_data['user_id']:
                        self._close_connection
                        return msg.USER_NO_RIGHTS

                    comments[i].comment = request_data['comment']
                    comments[i].date = datetime.now().strftime("%d.%m.%Y-%H:%M:%S")
                    break

            # update
            ic_new.comments = comments
            # project.update_ic(ic_new, ic)
            projects.update_one({'project_name': project.name}, {'$set': project.to_json()})

            message = msg.COMMENT_SUCCESSFULLY_UPDATED
        else:
            message = msg.PROJECT_NOT_FOUND

        self._close_connection()
        return message

    def update_post_comment(self, request_data):
        # find marketplace post
        posts = self._db.Marketplace.Posts
        post_query = {'post_id': request_data['post_id']}
        post = posts.find_one(post_query, {'_id': 0})
        if post:
            # find comment & update
            for i, comment in enumerate(post['comments']):
                if comment['id'] == request_data['comment_id']:
                    # security check
                    if comment['user']['user_id'] != request_data['user_id']:
                        self._close_connection
                        return msg.USER_NO_RIGHTS

                    post['comments'][i]['comment'] = request_data['comment']
                    post['comments'][i]['date'] = datetime.now().strftime("%d.%m.%Y-%H:%M:%S")
                    break
            # update post
            posts.update_one(post_query, {'$set': post})
            message = msg.COMMENT_SUCCESSFULLY_UPDATED
        else:
            message = msg.POST_NOT_FOUND
        
        self._close_connection()
        return message
            
    def delete_comment(self, request_data):
        if 'post_id' in request_data.keys():
            return self.delete_post_comment(request_data)

        # find project
        projects =  self._db.Projects
        users =     self._db.Users.Roles

        project_query = {'project_name': request_data['project_name']}
        project_json = projects.find_one(project_query, {'_id': 0})

        if project_json:
            # find ic
            project = Project.json_to_obj(project_json)
            ic = project.find_ic_by_id(request_data, request_data['ic_id'], project.root_ic)
            ic_new = ic
            comments = ic_new.comments

            user = users.find_one({'user_id': request_data['user_id']}, {'_id': 0})
            for proj in user['projects']:
                if proj['project_id'] == project_json['project_id']:
                    role = proj['role']

            # delete comment
            for i, comment in enumerate(comments):
                if comment.id == request_data['comment_id']:
                    # security check
                    if comment.user['user_id'] != request_data['user_id'] \
                    and role != 0:
                        self._close_connection
                        return msg.USER_NO_RIGHTS

                    del comments[i]
                    break
                
            # update comments, then project
            ic_new.comments = comments
            # project.update_ic(ic_new, ic)
            projects.update_one({'project_name': project.name}, {'$set': project.to_json()})
            message = msg.COMMENT_SUCCESSFULLY_DELETED
        else:
            message = msg.PROJECT_NOT_FOUND

        self._close_connection()
        return message

    def delete_post_comment(self, request_data):
        posts = self._db.Marketplace.Posts
        post_query = {'post_id': request_data['post_id']}
        post = posts.find_one(post_query, {'_id': 0})
        if post:
            for i, comment in enumerate(post['comments']):
                if comment['id'] == request_data['comment_id']:
                    # security check
                    if comment['user']['user_id'] != request_data['user_id']:
                        self._close_connection
                        return msg.USER_NO_RIGHTS

                    del post['comments'][i]
                    break
            posts.update_one(post_query, {'$set': post})
            message = msg.COMMENT_SUCCESSFULLY_DELETED
        else:
            message = msg.POST_NOT_FOUND
            
        self._close_connection()
        return message

    def add_tag(self, request_data, tags):
        if 'post_id' in request_data.keys():
            return self.add_tag_to_post(request_data)

        if 'project_name' not in request_data.keys():
            return msg.DEFAULT_ERROR

        col = self._db.Projects
        col_tags = self._db.Tags

        project_query = {'project_name': request_data['project_name']}
        project_json = col.find_one(project_query, {'_id': 0})

        if project_json:
            project = Project.json_to_obj(project_json)
            message = project.add_tag(request_data, tags, project.root_ic)
            if message == msg.TAG_SUCCESSFULLY_ADDED:
                col.update_one({'project_name': project.name}, {'$set': project.to_json()})
                tags = col_tags.find()
                results = list(tags)
                request_tags = request_data['tags']
                tag_json = {}
                if len(results) != 0:
                    results[0].pop('_id', None)
                    tags = results[0]
                    for i in range(1, len(request_tags)):
                        if request_tags[i] in tags:
                            if request_tags[i].startswith('#'):
                                already_exists = False
                                for obj in tags[request_tags[i]]:
                                    if 'ic_id' in obj.keys():
                                        if obj['ic_id'] == request_data['ic_id']:
                                            already_exists = True
                                        break
                                if not already_exists:
                                    tags[request_tags[i]].append({'ic_id': request_data['ic_id'],
                                                                  'project_name': request_data['project_name'],
                                                                  'project_id': project.project_id,
                                                                  'parent_id': request_data['parent_id']})

                                col_tags.update_one({'id': tags['id']}, {'$set': tags})
                                break
                        else:
                            if request_tags[i].startswith('#'):
                                tag_json[request_tags[i]] = [{'ic_id': request_data['ic_id'],
                                                              'project_name': request_data['project_name'],
                                                              'project_id': project.project_id,
                                                              'parent_id': request_data['parent_id']}]

                                col_tags.update({'id': tags['id']}, {'$set': tag_json})
                else:
                    for i in range(1, len(request_tags)):
                        if request_tags[i].startswith('#'):
                            tag_json[request_tags[i]] = [{'ic_id': request_data['ic_id'],
                                                          'project_name': request_data['project_name'],
                                                          'project_id': project.project_id,
                                                          'parent_id': request_data['parent_id']}]
                    tag_json['id'] = 'tags_collection'
                    col_tags.insert_one(tag_json)

        else:
            message = msg.PROJECT_NOT_FOUND
        self._close_connection()
        return message

    def add_tag_to_post(self, request_data):
        col_posts = self._db.Marketplace.Posts
        col_tags = self._db.Tags

        post_query = {'post_id': request_data['post_id']}
        post_json = col_posts.find_one(post_query, {'_id': 0})

        if post_json: 
            post = Post.json_to_obj(post_json)
            message = post.add_tag(request_data['tags'], request_data) # <- check if post already has this tag, and add it
            if message == msg.TAG_SUCCESSFULLY_ADDED:
                # check if tag is not duplicate in db
                col_posts.update_one({'post_id': post.post_id}, {'$set': post.to_json()})
                tags = col_tags.find()
                results = list(tags)
                request_tags = request_data['tags']
                tag_json = {}
                if len(results) != 0:
                    results[0].pop('_id', None)
                    tags = results[0]
                    for i in range(1, len(request_tags)):
                        if request_tags[i] in tags:
                            if request_tags[i].startswith('#'):
                                already_exists = False
                                for obj in tags[request_tags[i]]:
                                    if 'post_id' in obj.keys():
                                        if obj['post_id'] == request_data['post_id']:
                                            already_exists = True
                                            break
                                if not already_exists:
                                    tags[request_tags[i]].append({'post_id': post.post_id})

                                col_tags.update_one({'id': tags['id']}, {'$set': tags})
                                break
                        else:
                            if request_tags[i].startswith('#'):
                                tag_json[request_tags[i]] = [{'post_id': request_data['post_id']}]

                                col_tags.update({'id': tags['id']}, {'$set': tag_json})
                else:
                    for i in range(1, len(request_tags)):
                        if request_tags[i].startswith('#'):
                            tag_json[request_tags[i]] = [{'post_id': request_data['post_id']}]
                    tag_json['id'] = 'tags_collection'
                    col_tags.insert_one(tag_json)
        else:
            message = msg.POST_NOT_FOUND
            
        self._close_connection()
        return message           

    def remove_tag(self, request_data, tag):
        if 'post_id' in request_data.keys():
            return self.remove_tag_from_post(request_data, tag)

        if 'project_name' not in request_data.keys():
            return msg.DEFAULT_ERROR

        col = self._db.Projects
        col_tags = self._db.Tags
        project_query = {'project_name': request_data['project_name']}
        project_json = col.find_one(project_query, {'_id': 0})
        if project_json:
            project = Project.json_to_obj(project_json)
            message = project.remove_tag(request_data, tag, project.root_ic)
            if message == msg.TAG_SUCCESSFULLY_REMOVED:
                col.update_one({'project_name': project.name}, {'$set': project.to_json()})
                tags = col_tags.find()
                results = list(tags)
                request_tag = request_data['tag']
                if len(results) != 0:
                    results[0].pop('_id', None)
                    tags = results[0]
                    if request_tag in tags:
                        try:
                            tags[request_tag].remove({'ic_id': request_data['ic_id'],
                                                      'project_name': request_data['project_name'],
                                                      'project_id': project.project_id,
                                                      'parent_id': request_data['parent_id']})

                            col_tags.update_one({'id': tags['id']}, {'$set': tags})
                        except:
                            print('tag not in a list')

        else:
            message = msg.PROJECT_NOT_FOUND
        self._close_connection()
        return message

    def remove_tag_from_post(self, request_data, tag):
        col = self._db.Marketplace.Posts
        col_tags = self._db.Tags

        post_query = {'post_id': request_data['post_id']}
        post_json = col.find_one(post_query, {'_id': 0})

        if post_json:
            post = Post.json_to_obj(post_json)
            message = post.remove_tag(tag)

            if message == msg.TAG_SUCCESSFULLY_REMOVED:
                col.update_one({'post_id': post.post_id}, {'$set': post.to_json()})
                tags = col_tags.find()
                results = list(tags)
                request_tag = request_data['tag']
                if len(results) != 0:
                    results[0].pop('_id', None)
                    tags = results[0]
                    if request_tag in tags:
                        try:
                            tags[request_tag].remove({'post_id': post.post_id})

                            col_tags.update_one({'id': tags['id']}, {'$set': tags})
                        except:
                            print('tag not in a list')

        else:
            message = msg.POST_NOT_FOUND
        self._close_connection()
        return message

    def update_iso_tags(self, data):
        # print('\nupdate_iso_tags():\n', data)
        # tables
        projects = self._db.Projects
        tags = self._db.Tags
        
        # queries
        tags_query = {'id': 'tags_collection'}
        project_query = {'project_name': data['project_name']}

        project_json = projects.find_one(project_query, {'_id': 0})
        if not project_json: return msg.PROJECT_NOT_FOUND # failsafe no project

        # convert iso tripplets to tags
        iso_tags = get_iso_tags()
        for key, value in iso_tags.items():
            for i, val in enumerate(value['elements']):
                iso_tags[key]['elements'][i] = '#' + val.replace(".", "_")
            del iso_tags[key]['name']
            del iso_tags[key]['order']

        tags_collection = tags.find_one(tags_query, {'_id': 0})
        
        # create tags collection if dont exist
        if not tags_collection: 
            tags.insert_one(tags_query)
            tags_collection = tags.find_one(tags_query, {'_id': 0})
        
        # put missing tags in collection
        for key, value in iso_tags.items():
            for val in value['elements']:
                if not val in tags_collection.keys():
                    tags_collection[val] = []
        tags.update_one(tags_query, {"$set": tags_collection})

        # convert request tags
        for key, value in data['tags'].items():
            data['tags'][key] = "#" + value.replace(".", "_")        

        # this ic obj
        obj = {
            'project_name': data['project_name'],
            'ic_id':        data['ic_id'],
            'project_id':   project_json['project_id'],
            'parent_id':    data['parent_id']
        }

        # find ic 
        project = Project.json_to_obj(project_json)
        old_ic = project.find_ic_by_id(data, data['ic_id'], project.root_ic)
        ic = old_ic
        
        # delete
        for key, value in iso_tags.items():
            for tag in value['elements']:
                # for itag in tags_collection.keys():
                    # if itag == tag:    # failsafe check (maybe not necessary)
                for i, val in enumerate(tags_collection[tag]):  # iterate through all tags in collection
                    if obj in tags_collection[tag]:
                        tags_collection[tag].remove(obj)        # remove all occurances of this ic
                        # break
                    for tag_obj in ic.tags:
                        if tag_obj.iso == "simple":
                            continue                                    # skip simple tags
                        tag_tmp = tag_obj.tag.replace(".", "_")
                        if tag_tmp in tags_collection:                  # check if tag exists
                            if obj in tags_collection[tag_tmp]:
                                tags_collection[tag_tmp].remove(obj)    # remove this ic from special tags (file number custom)
                        if tag.replace('_', '.') == tag_obj.tag:
                            ic.tags.remove(tag_obj)                     # remove all tags from this ic
                        if tag_obj.tag not in value['elements']:
                            if tag_obj in ic.tags:
                                ic.tags.remove(tag_obj)

        # write
        for key, tag in data['tags'].items(): # get key and value from request entries
            for itag in tags_collection.keys(): # iterate through all tags in the collection
                # if itag == tag: # COMPLEX TAGS UPDATE
                if tag not in tags_collection.keys():
                    tags_collection[tag] = []   # add tag to collection
                if obj not in tags_collection[tag]:
                    tags_collection[tag].append(obj) # 'add ic to tag' in tags collection
                    if '_' in tag:
                        tag = tag.replace("_", ".")
                    ic.tags.append(ISO19650(key, tag, data['iso'], 'gray')) # add tag to ic
                    break

        # update
        # project.update_ic(ic, old_ic)
        tags.update_one(tags_query, {"$set": tags_collection})
        projects.update_one(project_query, {"$set": project.to_json()})

        message = msg.TAG_SUCCESSFULLY_UPDATED

        self._close_connection()
        return message

    def get_ic_tags(self, request_data):
        Projects = self._db.Projects
        project_query = {'project_name': request_data['project_name']}
        project_json = Projects.find_one(project_query, {"_id": 0})

        if not project_json: return msg.PROJECT_NOT_FOUND

        project = Project.json_to_obj(project_json)
        ic = project.find_ic_by_id(request_data, request_data['ic_id'], project.root_ic)

        if not ic: return msg.IC_PATH_NOT_FOUND

        ic = ic.to_json()
        
        return ic['tags']

    def get_all_tags(self):
        col = self._db.Tags
        result = col.find()
        tags = []
        if result:
            for tag in result:
                tag.pop('_id', None)
                for key in tag:
                    tags.append(key)
        self._close_connection()
        return tags

    def get_all_tags_with_ics(self):
        col = self._db.Tags 
        result = col.find()
        tags = list(result)

        search = None
        if len(tags) > 0:
            search = tags[0]
        for key in tags[0]:
            if isinstance(search[key], list): # check if it's not _id or id
                for obj in search[key]: # iterate through objects in this array
                    if 'post_id' in obj.keys():
                        search[key].remove(obj)
                        
        self._close_connection()
        return [search]

    def add_access(self, request_data, session_user):
        # grants user an access to an ic
        col =           self._db.Projects
        col_users =     self._db.Users.Roles
        col_shared =    self._db.Projects.Shared
        col_u =         self._db.Users

        user_query = {'user_id': session_user['id']}
        u = col_users.find_one(user_query, {'_id': 0})
        project_json = None

        if not u:
            return msg.USER_NOT_FOUND

        for x in u:
            print('x', x)
        project_json = self.get_project(request_data['project_name'], session_user)
        if not project_json:
            return msg.PROJECT_NOT_FOUND

        # project_query = {'project_name': request_data['project_name']}
        # project_json = col.find_one(project_query, {'_id': 0})
        if project_json:
            user_query = {'username': request_data['user_name'].strip()}
            new_user = col_u.find_one(user_query, {'_id': 0})

            if new_user:
                project = Project.json_to_obj(project_json)
                message = project.add_access(request_data, new_user, project.root_ic)
                
                if message == msg.ACCESS_SUCCESSFULLY_ADDED:
                    col.update_one({'project_name': project.name}, {'$set': project.to_json()})

                    is_in_project = False
                    for ac in project.root_ic.access:
                        if new_user['id'] == ac.user['user_id']:
                            is_in_project = True
                            break

                    # if the user does not have an access to the whole project update shared
                    if not is_in_project:
                        shared = {'project_id':     project.project_id,
                                'project_name':   project.name,
                                'parent_id':      request_data['parent_id'],
                                'role':           getattr(Role, request_data['role']).value,
                                'exp_date':       request_data['exp_date'],
                                'ic_id':          request_data['ic_id']}
                        user_shared = col_shared.find()
                        results = list(user_shared)
                        shared_json = {}
                        if len(results) != 0:
                            # results[0].pop('_id', None)
                            user_shared = results[0]
                            if new_user['id'] in user_shared:
                                already_exists = False
                                for ic in user_shared[new_user['id']]:
                                    if ic['ic_id'] == request_data['ic_id']:
                                        already_exists = True
                                        break
                                if not already_exists:
                                    user_shared[new_user['id']].append(shared)
                                col_shared.update_one({'_id': user_shared['_id']}, {'$set': user_shared})
                            else:
                                user_shared[new_user['id']] = [shared]
                                col_shared.update({'_id': user_shared['_id']}, {'$set': user_shared})

                        else:
                            shared_json[new_user['id']] = [shared]
                            col_shared.insert_one(shared_json)

            else:
                message = msg.USER_NOT_FOUND
        else:
            message = msg.PROJECT_NOT_FOUND
        self._close_connection()
        return message

    def update_access(self, request_data, session_user):
        col = self._db.Projects
        col_users = self._db.Users.Roles
        col_shared = self._db.Projects.Shared
        col_u = self._db.Users

        user_query = {'user_id': session_user['id']}
        u = col_users.find_one(user_query, {'_id': 0})
        has_rights = False
        project_json = None
        if not u:
            return msg.USER_NOT_FOUND
        
        # iterate through user's projects
        project_json = self.get_project(request_data['project_name'], session_user)
        for pr in u['projects']:
            if project_json['project_id'] == pr['project_id']:
                if pr['role'] <= Role.ADMIN.value:
                    has_rights = True
                break

        # iterate through user's shared
        ics, ic_shares = self.get_my_shares(session_user)
        for ic in ic_shares:
            if ic['ic_id'] == request_data['ic_id']:
                if ic['role'] <= Role.ADMIN.value:
                    has_rights = True

        if not has_rights:
            return msg.USER_NO_RIGHTS
        # project_query = {'project_name': request_data['project_name']}
        # project_json = col.find_one(project_query, {'_id': 0})
        if project_json:
            user_query = {'id': request_data['user']['user_id']}
            new_user = col_u.find_one(user_query, {'_id': 0})
            if new_user:
                project = Project.json_to_obj(project_json)
                message = project.update_access(request_data, new_user, project.root_ic)
                # print('\n\n\n\n', message)
                if message == msg.ACCESS_SUCCESSFULLY_UPDATED:
                    col.update_one({'project_name': project.name}, {'$set': project.to_json()})

                    is_in_project = False
                    for ac in project.root_ic.access:
                        if new_user['id'] == ac.user['user_id']:
                            is_in_project = True
                            break

                    # if the user does not have an access to the whole project update shared
                    if not is_in_project:
                        r = ''
                        if request_data['new_role'] != '':
                            r = getattr(Role, request_data['new_role']).value
                        shared = {'project_id': project.project_id,
                                'project_name': project.name,
                                'parent_id': request_data['parent_id'],
                                'role': r,
                                'exp_date': request_data['exp_date'],
                                'ic_id': request_data['ic_id']}

                        user_shared = col_shared.find()
                        results = list(user_shared)
                        shared_json = {}
                        if len(results) != 0:
                            # results[0].pop('_id', None)
                            user_shared = results[0]
                            if new_user['id'] in user_shared:
                                for ic in user_shared[new_user['id']]:
                                    if ic['ic_id'] == request_data['ic_id']:
                                        ic['role'] = r
                                        break
                                col_shared.update_one({'_id': user_shared['_id']}, {'$set': user_shared})
                            else:
                                user_shared[new_user['id']] = [shared]
                                col_shared.update({'_id': user_shared['_id']}, {'$set': user_shared})

                        else:
                            shared_json[new_user['id']] = [shared]
                            col_shared.insert_one(shared_json)

            else:
                message = msg.USER_NOT_FOUND
        else:
            message = msg.PROJECT_NOT_FOUND
        self._close_connection()
        return message

    def remove_access(self, request_data, session_user):
        col = self._db.Projects
        col_users = self._db.Users.Roles
        col_shared = self._db.Projects.Shared
        user_query = {'user_id': session_user['id']}
        u = col_users.find_one(user_query, {'_id': 0})

        project_json = None

        if not u:
            return msg.USER_NOT_FOUND
            
        project_query = {'project_name': request_data['project_name']}
        project_json = col.find_one(project_query, {'_id': 0})
        
        if project_json:
            project = Project.json_to_obj(project_json)
            message = project.remove_access(request_data, project.root_ic)
            if message == msg.ACCESS_SUCCESSFULLY_REMOVED:
                col.update_one({'project_name': project.name}, {'$set': project.to_json()})

                user_shared = col_shared.find()
                results = list(user_shared)
                if len(results) != 0:
                    # results[0].pop('_id', None)
                    user_shared = results[0]
                    # print('ovde', request_data['role'])
                    if request_data['user']['user_id'] in user_shared:
                        # print(user_shared[request_data['user']['user_id']])
                        # print({'project_id': project.project_id,
                        #      'project_name': project.name,
                        #      'parent_id': request_data['parent_id'],
                        #      'role': getattr(Role, request_data['role']).value,
                        #      'ic_id': request_data['ic_id']})
                        try:
                            user_shared[request_data['user']['user_id']].remove(
                                {'project_id': project.project_id,
                                'project_name': project.name,
                                'parent_id': request_data['parent_id'],
                                'role': getattr(Role, request_data['role']).value,
                                'ic_id': request_data['ic_id']})
                            col_shared.update_one({'_id': user_shared['_id']}, {'$set': user_shared})
                        except:
                            print('empty shared')
        else:
            message = msg.PROJECT_NOT_FOUND
        self._close_connection()
        return message

    def clear_db(self, user):
        self._db.Projects.drop()
        self._db.Projects.Files.drop()
        self._db.Marketplace.Posts.drop()
        self._db.Marketplace.Bids.drop()
        self._db.Roles.drop()
        self._db.Users.Roles.drop()
        self._db.Marketplace.Posts.Files.drop()
        self._db.Tags.drop()
        self._db.fs.files.drop()
        self._db.fs.chunks.drop()
        self._db.Projects.Shared.drop()
        self._db.Trash.drop()
        self._db.Users.Trash.drop()
        # self._db.Users.drop()

        col_users = self._db.Users.Roles
        col = self._db.Users
        # TODO: check does user has the rights to share
        col.update_one({'email': user['email']}, {'$set': {'picture': ''}})
        result = col.find()
        for user in result:
            user_query = {'user_id': user['id']}
            u = col_users.find_one(user_query, {'_id': 0})
            if not u:
                u = {}
                u['projects'] = []
                u['user_id'] = user['id']
                col_users.insert_one(u)


