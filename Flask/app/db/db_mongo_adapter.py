from pymongo import *
import gridfs
from pymongo.errors import ConnectionFailure
import uuid
from app.model.user import User
from app.model.project import Project
from app.model.marketplace.post import Post
from app.model.marketplace.bid import Bid
from app.model.role import Role
import app.model.messages as msg
import json

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
        self._close_connection()
        return message, user

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
        user_query = {'user_id': user['id']}
        result = col_users.find_one(user_query, {'_id': 0})
        projects = []
        if result:
            for pr in result['projects']:
                projects.append(self.get_my_project(pr['project_id']))
        self._close_connection()
        return projects

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
        self._close_connection()
        return result

    def get_project(self, project_name, user):
        col = self._db.Projects
        project_query = {'project_name': project_name}
        result = col.find_one(project_query, {'_id': 0})
        self._close_connection()
        return result

    # TODO Trash
    def get_my_trashed_projects(self, user):
        users =         self._db.Users.Roles
        users_trash =   self._db.Users.Trash
        trash =         self._db.Trash

        user = users_trash.find_one({'user_id': user['id']}, {'_id': 0})
        my_trashed_items = []

        project_id_flag = dict()

        if user:
            for trashed_project in user['trash']:
                # prevent duplication
                if trashed_project['project_id'] in project_id_flag.keys():
                    continue
                project_id_flag[trashed_project['project_id']] = True

                if trashed_project['role'] == 0 or trashed_project['role'] == "0":
                    # find all items in trash that match this project id
                    trash_tmp = trash.find({'project_id': trashed_project['project_id']}, {'_id': 0})
                    if trash_tmp:
                        for item in trash_tmp:
                            my_trashed_items.append(item)
                    

        self._close_connection()
        return my_trashed_items

    def update_file(self, project_name, file_obj, file=None):
        col = self._db.Projects
        # col_file = self._db.Projects.Files
        col_file = self._db.fs.files
        project_query = {'project_name': project_name}
        project_json = col.find_one(project_query, {'_id': 0})
        if project_json:
            project = Project.json_to_obj(project_json)
            if file:
                # file_obj.stored_id = str(col_file.insert_one({"file_id": "default",
                #                                             "file_name": file_obj.name+file_obj.type,
                #                                             "file": file,
                #                                             "description": file_obj.description})
                #                         .inserted_id)
                file_obj.stored_id = str(self._fs.put(file,
                                                        file_id='default',
                                                        file_name=file_obj.name+file_obj.type, 
                                                        parent=file_obj.parent,
                                                        parent_id=file_obj.parent_id,
                                                        description=file_obj.description,
                                                        from_project=True
                                                        ))
                col_file.update_one({'file_id': 'default'},
                                    {'$set': {'file_id': str(file_obj.stored_id)}})
                project.update_file(file_obj) # TODO: NOT OK, also needs old chunk delete inside
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
        return msg.DEFAULT_OK

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
            if file_json is None:
                if file:
                    file_obj.stored_id = str(self._fs.put(file,
                                                        file_id='default',
                                                        file_name=file_obj.name+file_obj.type, 
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
                        file = self.get_file(file_json["file_name"])
                        if file:
                            file_obj.stored_id = str(self._fs.put(file,
                                                            file_id='default',
                                                            file_name=file_obj.name+file_obj.type, 
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
        project_query = {'project_name': request_data['project_name']}
        project_json = col.find_one(project_query, {'_id': 0})
        if project_json:
            project = Project.json_to_obj(project_json)
            # print(project.to_json())
            add = project.rename_ic(request_data, user, project.root_ic)
            if add == msg.IC_SUCCESSFULLY_RENAMED:
                file_updated = True
                if not request_data['is_directory']:
                    file_updated = False
                    file_query = {'file_name': request_data['old_name']}
                    file_json = col_file.find_one(file_query)
                    if file_json:
                        col_file.update_one({'file_name': request_data['old_name']},
                                            {'$set': {'file_name': str(request_data['new_name'])}})
                        file_updated = True
                    else:
                        print(msg.STORED_FILE_NOT_FOUND)
                        return msg.STORED_FILE_NOT_FOUND
                if file_updated:
                    col.update_one({'project_name': project.name}, {'$set': project.to_json()})

        else:
            print(msg.PROJECT_NOT_FOUND)
            return msg.PROJECT_NOT_FOUND
        self._close_connection()
        return add

 # TODO update all users that share the project's trash
    def trash_ic(self, ic_data):
        # database tables
        users =         self._db.Users.Roles
        projects =      self._db.Projects
        trash =         self._db.Trash          # trashed items
        users_trash =   self._db.Users.Trash    # user trash info
        files =         self._db.fs.files
        file_chunks =   self._db.fs.chunks

        project_query = {'project_name': ic_data['project_name']}
        project_json = projects.find_one(project_query, {'_id': 0}) # get project from DB

        # check if user has privileges TODO 
        # user_tmp = users.find_one({'user_id': ic_data['user_id']}, '_id': 0):
        # for project in user_tmp['projects']:
        #     if project['project_id'] == project_json['project_id']:
        #         if not project['role'] <= 1:
        #             return msg.USER_NO_RIGHTS

        if project_json:
            # Trashing projects
            if ic_data['parent_id'] == 'root':
                # 'move' project to Trash
                trash.insert_one(project_json)
                projects.delete_one(project_query)
                all_users = users.find()
                if all_users:
                    # iterate thru users in Users.Roles
                    for user in all_users:
                        # iterate through their projects
                        for count, user_project in enumerate(user['projects']):
                            # if its the one deleting
                            if user_project['project_id'] == project_json['project_id']:
                                my_trash = users_trash.find_one({'user_id': ic_data['user_id']}, {'_id':0})
                                # if this user has any trash
                                if my_trash:
                                    my_trash['trash'].append(user['projects'][count])
                                    users_trash.update_one({'user_id': ic_data['user_id']},
                                                            {'$set': 
                                                                {'trash': my_trash['trash']}
                                                            }
                                                        )
                                else:
                                    trash_tmp = []
                                    trash_tmp.append(user['projects'][count])
                                    users_trash.insert_one({'user_id': ic_data['user_id'], 'trash': trash_tmp})
                                    del trash_tmp
                                # update user's projects
                                del user['projects'][count]
                                users.update_one({'user_id': ic_data['user_id']},
                                                {'$set': 
                                                    {'projects': user['projects']}
                                                }
                                            )

                delete = msg.PROJECT_SUCCESSFULLY_TRASHED
                
            # Trashing ic/sub folders or files
            else:
                project = Project.json_to_obj(project_json)
                # find the ic in project
                this_ic = project.find_ic_by_id(ic_data, ic_data['ic_id'], project.root_ic).to_json()
                # copy just the ic into new object
                this_ic['project_id'] = project.project_id
                # paste the object in trash, with project_id
                trash.insert_one(this_ic)
                # update user's trash
                my_trash = users_trash.find_one({'user_id': ic_data['user_id']}, {'_id':0})
                # if this user has any trash
                if my_trash:
                    # TODO prevent duplicating
                    my_trash['trash'].append({'project_id': this_ic['project_id'], 'role': 0})
                    users_trash.update_one({'user_id': ic_data['user_id']},
                                            {'$set': 
                                                {'trash': my_trash['trash']}
                                            }
                                        )
                else:
                    trash_tmp = []
                    trash_tmp.append({'project_id': this_ic['project_id'], 'role': 0}) # TODO fix role
                    users_trash.insert_one({'user_id': ic_data['user_id'], 'trash': trash_tmp})
                    del trash_tmp

                # delete ic/update from current project
                delete = project.trash_ic(ic_data, project.root_ic)

                # update project
                projects.update_one({'project_id': this_ic['project_id']}, {'$set': project.to_json()})
        else:
            print("trash_ic", msg.PROJECT_NOT_FOUND)
            return msg.PROJECT_NOT_FOUND

        self._close_connection()
        return delete

    def restore_ic(self, restore_ic_data):
        # database tables
        users_roles =         self._db.Users.Roles
        projects =      self._db.Projects
        trash =         self._db.Trash          # trashed items
        users_trash =   self._db.Users.Trash    # user trash info
        files =         self._db.fs.files
        file_chunks =   self._db.fs.chunks

        trashed_query = dict()
        if restore_ic_data['ic_id'] == '':  # if its a project
            trashed_query = {'project_id': restore_ic_data['project_id']}
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
                projects.insert_one(project_or_ic_json)

                my_projects =   users_roles.find_one({'user_id': restore_ic_data['user_id']}, {'_id': 0})
                my_trash =      users_trash.find_one({'user_id': restore_ic_data['user_id']}, {'_id': 0})

                for trashed_ic in my_trash['trash']:    # TODO make fix for ic/projects || actually this is for projects so its fine
                    if trashed_ic['project_id'] == restore_ic_data['project_id']:
                        my_projects['projects'].append(trashed_ic)
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
                my_project = Project.json_to_obj(my_project)
                # find the parent_id inside project
                my_project_parent = my_project.find_parent_by_id(restore_ic_data, restore_ic_data['parent_id'], my_project.root_ic).to_json()
                my_project_parent['sub_folders'].append(project_or_ic_json)
                my_project = my_project.to_json()
                my_project['root_ic'] = my_project_parent
                # insert the ic
                projects.update_one({'project_id': restore_ic_data['project_id']}, {'$set': my_project})
                # delete from Trash
                trash.delete_one(trashed_query)
                restored = msg.IC_SUCCESSFULLY_RESTORED

        return restored


    # this function deletes from database
    def delete_ic(self, delete_ic_data):
        col = self._db.Projects
        # col_file = self._db.Projects.Files
        col_file = self._db.fs.files
        col_file_chunks = self._db.fs.chunks
        project_query = {'project_name': delete_ic_data['project_name']}
        project_json = col.find_one(project_query, {'_id': 0})
        delete = msg.PROJECT_NOT_FOUND
        if project_json:
            if delete_ic_data['parent_id'] == 'root':
                col.delete_one(project_query)
                file_query = {'project_name': delete_ic_data['project_name']}
                col_file.delete_many(file_query)
                col_file_chunks.delete_many(file_query)
                col_users = self._db.Users.Roles
                user_query = {'user_id': delete_ic_data['user_id']}
                pr_query = {'project_id': delete_ic_data['ic_id']}
                result = col_users.find()
                if result:
                    for u in result:
                        for count, pr in enumerate(u['projects']):
                            if pr['project_id'] == project_json['project_id']:
                                del u['projects'][count]
                                col_users.update_one(user_query,
                                                     {'$set': {'projects': u['projects']}})
                delete = msg.PROJECT_SUCCESSFULLY_DELETED
            else:
                project = Project.json_to_obj(project_json)
                delete = project.delete_ic(delete_ic_data, project.root_ic)
            if delete == msg.IC_SUCCESSFULLY_DELETED:
                ic_deleted = True
                if not delete_ic_data['is_directory'] or delete_ic_data['is_directory'] == "False":
                    ic_deleted = False
                    file_query = {'file_name': delete_ic_data['delete_name'], 'parent_id': delete_ic_data["parent_id"]}
                    removing_file = col_file.find_one(file_query)
                    self._fs.delete(removing_file["_id"])
                    if col_file.find_one(file_query) == None:
                        ic_deleted = True
                if ic_deleted:
                    col.update_one({'project_name': project.name}, {'$set': project.to_json()})
                else:
                    print("delete_ic", msg.STORED_FILE_NOT_FOUND)
                    return msg.STORED_FILE_NOT_FOUND

        else:
            print("delete_ic", msg.PROJECT_NOT_FOUND)
            return msg.PROJECT_NOT_FOUND
        self._close_connection()
        return delete

    def get_file(self, file_name):
        stored_file = None
        for grid_out in self._fs.find({"file_name": file_name}, no_cursor_timeout=True):
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

    def change_color(self, file_obj):
        col = self._db.Projects
        project_query = {'project_name': file_obj["project_name"]}
        project_json = col.find_one(project_query, {'_id': 0})
        if project_json:
            project = Project.json_to_obj(project_json)
            add = project.change_color(file_obj, project.root_ic)
            if add == msg.IC_COLOR_CHANGED:
                col.update_one({'project_name': project.name}, {'$set': project.to_json()})
            else:
                print(msg.DEFAULT_ERROR)
                return msg.DEFAULT_ERROR
        else:
            print(msg.PROJECT_NOT_FOUND)
            return msg.PROJECT_NOT_FOUND
        self._close_connection()
        return add

    def create_post(self, request_json):
        col = self._db.Marketplace.Posts
        posts_query = {'post_id': request_json['post_id']}
        message = msg.POST_ALREADY_EXISTS
        post_id = ''
        if col.find_one(posts_query, {'_id': 0}) is None:
            post_id = col.insert_one(request_json).inserted_id
            col.update_one({'post_id': 'default'},
                           {'$set': {'post_id': str(post_id)}})
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

    def share_project(self, request_data, user):
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
        # TODO: check does user has the rights to share
        user_query = {'username': request_data['user_name']}
        new_user = col.find_one(user_query, {'_id': 0})
        if new_user:
            user_id = new_user['id']
            user_query = {'user_id': user_id}
            u = col_users.find_one(user_query, {'_id': 0})
            if not request_data['role']:
                request_data['role'] = 'ADMIN'
            role = getattr(Role, request_data['role']).value
            u['projects'].append({'project_id': request_data['project_id'],
                                  'role': role})
            col_users.update_one(user_query,
                                 {'$set': u})
            p = self.get_my_project(request_data['project_id'])
            project = Project.json_to_obj(p)
            project.set_access_for_all_ics(new_user, role, project.root_ic)
            self.update_project(project, new_user)
            message = msg.SUCCESSFULLY_SHARED

        else:
            message = msg.USER_NOT_FOUND
        self._close_connection()
        return message

    def add_comment(self, request_data, comment):
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

    def add_tag(self, request_data, tags):
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
                                for ic in tags[request_tags[i]]:
                                    if ic['ic_id'] == request_data['ic_id']:
                                        already_exists = True
                                        break
                                if not already_exists:
                                    tags[request_tags[i]].append({'ic_id': request_data['ic_id'],
                                                                  'project_name': request_data['project_name'],
                                                                  'parent_id': request_data['parent_id']})

                                col_tags.update_one({'id': tags['id']}, {'$set': tags})
                                # ta = col_tags.find()
                                # ta = list(ta)
                                # print('>>>>>+++', ta)
                                break
                        else:
                            if request_tags[i].startswith('#'):
                                tag_json[request_tags[i]] = [{'ic_id': request_data['ic_id'],
                                                              'project_name': request_data['project_name'],
                                                              'parent_id': request_data['parent_id']}]

                                col_tags.update({'id': tags['id']}, {'$set': tag_json})
                                # ta = col_tags.find({'id': tags['id']})
                                # ta = list(ta)
                                # print('>>>>>---', ta)
                else:
                    for i in range(1, len(request_tags)):
                        if request_tags[i].startswith('#'):
                            tag_json[request_tags[i]] = [{'ic_id': request_data['ic_id'],
                                                          'project_name': request_data['project_name'],
                                                          'parent_id': request_data['parent_id']}]
                    tag_json['id'] = 'tags_collection'
                    col_tags.insert_one(tag_json)

        else:
            message = msg.PROJECT_NOT_FOUND
        self._close_connection()
        return message

    def remove_tag(self, request_data, tag):
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
                        tags[request_tag].remove({'ic_id': request_data['ic_id'],
                                                  'project_name': request_data['project_name'],
                                                  'parent_id': request_data['parent_id']})

                        col_tags.update_one({'id': tags['id']}, {'$set': tags})

        else:
            message = msg.PROJECT_NOT_FOUND
        self._close_connection()
        return message

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
        # tags.pop('_id', None)
        # if result:
        #     for tag in result:
        #         tag.pop('_id', None)
        #         tags.append(tag)
        self._close_connection()
        return tags

    def add_access(self, request_data, session_user):
        col = self._db.Projects
        col_users = self._db.Users.Roles
        col_shared = self._db.Projects.Shared
        col_u = self._db.Users
        user_query = {'user_id': session_user['id']}
        u = col_users.find_one(user_query, {'_id': 0})
        no_rights = True
        project_json = None
        if u:
            for x in u:
                print('x', x)
            project_json = self.get_project(request_data['project_name'], session_user)
            for pr in u['projects']:
                if project_json['project_id'] == pr['project_id']:
                    if pr['role'] != Role.WATCHER.value:
                        no_rights = False
                    break
        if no_rights:
            return msg.USER_NO_RIGHTS
        # project_query = {'project_name': request_data['project_name']}
        # project_json = col.find_one(project_query, {'_id': 0})
        if project_json:
            user_query = {'username': request_data['user_name']}
            new_user = col_u.find_one(user_query, {'_id': 0})
            if new_user:
                project = Project.json_to_obj(project_json)
                message = project.add_access(request_data, new_user, project.root_ic)
                if message == msg.TAG_SUCCESSFULLY_ADDED:
                    col.update_one({'project_name': project.name}, {'$set': project.to_json()})

                    # if the user does not have an access to the whole project update shared
                    shared = {'project_id': project.project_id,
                              'project_name': project.name,
                              'parent_id': request_data['parent_id'],
                              'role': getattr(Role, request_data['role']).value,
                              'ic_id': request_data['ic_id']}
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

    def remove_access(self, request_data, session_user):
        col = self._db.Projects
        col_users = self._db.Users.Roles
        col_shared = self._db.Projects.Shared
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
        # project_query = {'project_name': request_data['project_name']}
        # project_json = col.find_one(project_query, {'_id': 0})
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
                    if request_data['user']['user_id'] in user_shared:
                        user_shared[request_data['user']['user_id']].remove(
                            {'project_id': project.project_id,
                             'project_name': project.name,
                             'parent_id': request_data['parent_id'],
                             'role': getattr(Role, request_data['role']).value,
                             'ic_id': request_data['ic_id']})
                        col_shared.update_one({'_id': user_shared['_id']}, {'$set': user_shared})
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
                u['trash'] = []
                u['user_id'] = user['id']
                col_users.insert_one(u)


