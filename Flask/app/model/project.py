from .details import Details
from .comment import Comments
from .role import Role
from .tag import Tags
from .access import Access
from .directory import Directory
from .site import Site
from .building import Building
from .file import File
import app.model.messages as msg
from datetime import datetime


class Project:

    def __init__(self, project_id, name, root_ic):
        self._project_id = project_id
        self._name = name
        self._root_ic = root_ic
        self._description = ''
        self._code = ''
        self._number = ''
        self._status = ''
        self._site = Site('', '', '', '', '')
        self._building = Building('', '')
        self._added = False
        self._deleted = False
        self._message = ""
        self._current_ic = None

    @property
    def project_id(self):
        return self._project_id

    @project_id.setter
    def project_id(self, value):
        self._project_id = value

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        self._name = value

    @property
    def root_ic(self):
        return self._root_ic

    @root_ic.setter
    def root_ic(self, value):
        self._root_ic = value

    @property
    def added(self):
        return self._added

    @added.setter
    def added(self, value):
        self._added = value

    @property
    def current_ic(self):
        return self._current_ic

    @current_ic.setter
    def current_ic(self, value):
        self._current_ic = value

    @property
    def description(self):
        return self._description

    @description.setter
    def description(self, value):
        self._description = value

    @property
    def code(self):
        return self._code

    @code.setter
    def code(self, value):
        self._code = value

    @property
    def number(self):
        return self._number

    @number.setter
    def number(self, value):
        self._number = value

    @property
    def status(self):
        return self._status

    @status.setter
    def status(self, value):
        self._status = value

    @property
    def site(self):
        return self._site

    @site.setter
    def site(self, value):
        self._site = value

    @property
    def building(self):
        return self._building

    @building.setter
    def building(self, value):
        self._building = value

    def update_file(self, file, ic=None):
        if not ic:
            ic = self._root_ic
        if not ic.is_directory:
            for x in ic.sub_folders:
                self.update_file(file, x)
                if self._added:
                    break
        else:
            if ic.name == file.name and ic.type == file.type:
                ic.stored_id = file.stored_id
                # print(ic.to_json())
                self._added = True

        return self, self._added

    def change_color(self, request_data, ic=None):
        if ic.ic_id == request_data['ic_id']:
            # print(ic.color, request_data)
            ic.color = request_data["color"]
            self._message = msg.IC_COLOR_CHANGED
            self._added = True
        else:
            if ic.sub_folders:
                for x in ic.sub_folders:
                    self.change_color(request_data, x)
                    if self._added:
                        break
        if not self._added:
            self._message = msg.IC_PATH_NOT_FOUND
        return self._message

    def rename_ic(self, request_data, user, ic=None):
        if ic.ic_id == request_data['parent_id']:
            for sub_folder in ic.sub_folders:
                name = sub_folder.name
                #path = request_data['path']
                parent = request_data['path'] #[:path.rfind("/")]
                new_name = request_data['new_name']
                new_name_backup = new_name
                new_name_contains_extension = len(new_name.split(".")) > 1
                if not sub_folder.is_directory:
                    name = sub_folder.name   + sub_folder.type
                    if(new_name_contains_extension):
                        new_name = '.'.join(new_name.split('.')[:-1])
                        sub_folder.type = '.' + new_name_backup.split('.')[-1]

                if name == request_data['old_name']:
                    details = Details(user, 'Renamed',
                                      datetime.now().strftime("%d.%m.%Y-%H:%M:%S"),
                                      name + ' to ' + new_name_backup)
                    sub_folder.history.append(details)
                    sub_folder.name = new_name                        
                    sub_folder.path = parent + '/' + request_data['new_name']
                    # ic.parent = parent # no need?
                    self._message = msg.IC_SUCCESSFULLY_RENAMED
                    self._added = True
                    break
        else:
            if ic.sub_folders:
                for sub_folder in ic.sub_folders:
                    self.rename_ic(request_data, user, sub_folder)
                    if self._added:
                        break
        if not self._added:
            self._message = msg.IC_PATH_NOT_FOUND
        return self._message

    def trash_ic(self, request_data, ic=None):
        if ic.ic_id == request_data['parent_id']:
            for y in ic.sub_folders:
                if y.name == request_data['delete_name']:
                    ic.sub_folders.remove(y)
                    self._deleted = True
                    self._message = msg.IC_SUCCESSFULLY_TRASHED
        else:
            if ic.sub_folders:
                for x in ic.sub_folders:
                    self.trash_ic(request_data, x) 
                    if self._deleted:
                        break
        if not self._deleted:
            self._message = msg.IC_PATH_NOT_FOUND
        return self._message

    def delete_ic(self, request_data, ic=None):
        if ic.ic_id == request_data['parent_id']:
            for y in ic.sub_folders:
                full_name = y.name
                if hasattr(y, "type"):
                    full_name += y.type
                if full_name == request_data["delete_name"]:
                    ic.sub_folders.remove(y)
                    self._deleted = True
                    self._message = msg.IC_SUCCESSFULLY_DELETED
        else:
            if ic.sub_folders:
                for x in ic.sub_folders:
                    self.delete_ic(request_data, x)
                    if self._deleted:
                        break
        if not self._deleted:
            self._message = msg.IC_PATH_NOT_FOUND
        return self._message

    def add_ic(self, ic_new, ic=None):
        self._ic = ''
        if ic.ic_id == ic_new.parent_id:
            already_exists = False
            for sub_f in ic.sub_folders:
                temp_sub_name = sub_f.name
                temp_ic_new_name = ic_new.name
                if not sub_f.is_directory:
                    temp_sub_name = sub_f.name + sub_f.type
                if not ic_new.is_directory:
                    temp_ic_new_name = ic_new.name + ic_new.type
                if temp_sub_name == temp_ic_new_name:
                    already_exists = True
                    self._added = True
                    self._message = msg.IC_ALREADY_EXISTS
                    self._ic = sub_f
            if not already_exists:
                # ic_new.parent_id = ic.ic_id
                ic.sub_folders.append(ic_new)
                self._message = msg.IC_SUCCESSFULLY_ADDED
                self._added = True
        else:
            for x in ic.sub_folders:
                self.add_ic(ic_new, x)
                if self._added:
                    break
        if not self._added:
            self._message = msg.IC_PATH_NOT_FOUND
        return self._message, self._ic

    def update_ic(self, ic_new, ic=None):
        self._ic = ''
        if ic.ic_id == ic_new.parent_id:
            already_exists = False
            for sub_f in ic.sub_folders:
                if sub_f.name == ic_new.name:
                    already_exists = True
                    self._added = True
                    self._message = msg.IC_ALREADY_EXISTS
                    self._ic = sub_f
                    break
            if not already_exists:
                # ic_new.parent_id = ic.ic_id
                ic.sub_folders.append(ic_new)
                self._message = msg.IC_SUCCESSFULLY_ADDED
                self._added = True
        else:
            for x in ic.sub_folders:
                self.add_ic(ic_new, x)
                if self._added:
                    break
        if not self._added:
            self._message = msg.IC_PATH_NOT_FOUND
        return self._message, self._ic

    def find_ic(self, request_data, file_name, ic=None):
        if request_data['parent_id'] == 'root':
            return ic
        if ic.ic_id == request_data['parent_id']:
            for sub_f in ic.sub_folders:
                sub_f_name = sub_f.name
                if not sub_f.is_directory:
                    sub_f_name = sub_f.name + sub_f.type
                if sub_f_name == file_name:
                    self._current_ic = sub_f
                    self._added = True
                    break
        else:
            for x in ic.sub_folders:
                self.find_ic(request_data, file_name, x)
                if self._added:
                    break
        return self._current_ic

    def find_parent_by_id(self, ic_id, ic=None):
        if ic.ic_id == ic_id:
                self._current_ic = ic
                self._added = True
        else:
            for x in ic.sub_folders:
                self.find_parent_by_id(ic_id, x)
                if self._added:
                    break
        return self._current_ic

    def find_ic_by_id(self, request_data, ic_id, ic=None):
        if request_data['parent_id'] == 'root':
            return ic
        if ic.ic_id == request_data['parent_id']:
            for sub_f in ic.sub_folders:
                if sub_f.ic_id == ic_id:
                    self._current_ic = sub_f
                    self._added = True
                    break
        else:
            for x in ic.sub_folders:
                self.find_ic_by_id(request_data, ic_id, x)
                if self._added:
                    break
        return self._current_ic

    def add_comment(self, request, comment, ic=None):
        if request['parent_id'] == 'root':
            ic.comments.append(comment)
            return msg.COMMENT_SUCCESSFULLY_ADDED
        if ic.ic_id == request['parent_id']:
            for sub_f in ic.sub_folders:
                if sub_f.ic_id == request['ic_id']:
                    sub_f.comments.append(comment)
                    self._message = msg.COMMENT_SUCCESSFULLY_ADDED
                    self._added = True
                    break
        else:
            for x in ic.sub_folders:
                self.add_comment(request, comment, x)
                if self._added:
                    break
        if not self._added:
            self._message = msg.IC_PATH_NOT_FOUND
        return self._message

    def add_tag(self, request, tags, ic=None):
        if request['parent_id'] == 'root':
            for i in range(1, len(tags)):
                if tags[i].startswith('#'):
                    t = Tags(tags[i])
                    if i < len(tags)-1:
                        if not tags[i + 1].startswith('#'):
                            t.color = tags[i+1]
                            i = i+1
                    already_in = False
                    for ic_tags in ic.tags:
                        if ic_tags.tag == t.tag and ic_tags.color == t.color:
                            already_in = True
                    if not already_in:
                        ic.tags.append(t)
            return msg.TAG_SUCCESSFULLY_ADDED
        if ic.ic_id == request['parent_id']:
            for sub_f in ic.sub_folders:
                if sub_f.ic_id == request['ic_id']:
                    for i in range(1, len(tags)):
                        if tags[i].startswith('#'):
                            t = Tags(tags[i])
                            if i < len(tags)-1:
                                if not tags[i + 1].startswith('#'):
                                    t.color = tags[i + 1]
                                    i = i + 1
                            already_in = False
                            for ic_tags in sub_f.tags:
                                if ic_tags.tag == t.tag and ic_tags.color == t.color:
                                    already_in = True
                            if not already_in:
                                sub_f.tags.append(t)
                    self._message = msg.TAG_SUCCESSFULLY_ADDED
                    self._added = True
                    break
        else:
            for x in ic.sub_folders:
                self.add_tag(request, tags, x)
                if self._added:
                    break
        if not self._added:
            self._message = msg.IC_PATH_NOT_FOUND
        return self._message

    def remove_tag(self, request, tag, ic=None):
        if request['parent_id'] == 'root':
            for t in ic.tags:
                if t.tag == tag:
                    ic.tags.remove(t)
                    break
            return msg.TAG_SUCCESSFULLY_REMOVED
        if ic.ic_id == request['parent_id']:
            for sub_f in ic.sub_folders:
                if sub_f.ic_id == request['ic_id']:
                    for t in sub_f.tags:
                        if t.tag == tag:
                            sub_f.tags.remove(t)
                            break
                    self._message = msg.TAG_SUCCESSFULLY_REMOVED
                    self._added = True
                    break
        else:
            for x in ic.sub_folders:
                self.remove_tag(request, tag, x)
                if self._added:
                    break
        if not self._added:
            self._message = msg.IC_PATH_NOT_FOUND
        return self._message

    def add_access(self, request, user, ic=None):
        if ic.ic_id == request['ic_id']:
            already_in = False
            for access in ic.access:
                if user['id'] in access.to_json()['user']['user_id']:
                    already_in = True
                    break
            if not already_in:
                u = {'user_id': user['id'], 'username': user['username'], 'picture': user['picture']}
                role = getattr(Role, request['role']).value
                a = Access(u, '', '', role)
                ic.access.append(a)
            self.add_access_to_ic(request, user, ic)
            self._message = msg.ACCESS_SUCCESSFULLY_ADDED
            self._added = True
        else:
            for x in ic.sub_folders:
                self.add_access(request, user, x)
                if self._added:
                    break
        if not self._added:
            self._message = msg.IC_PATH_NOT_FOUND
        return self._message

    def add_access_to_ic(self, request, user, ic=None):
        for sub_f in ic.sub_folders:
            already_in = False
            for access in sub_f.access:
                if user['id'] in access.to_json()['user']['user_id']:
                    already_in = True
                    break
            if not already_in:
                u = {'user_id': user['id'], 'username': user['username'], 'picture': user['picture']}
                role = getattr(Role, request['role']).value
                a = Access(u, '', '', role)
                sub_f.access.append(a)
            self.add_access_to_ic(request, user, sub_f)

    def remove_access(self, request, ic=None):
        if ic.ic_id == request['ic_id']:
            for access in ic.access:
                if request['user']['user_id'] in access.to_json()['user']['user_id']:
                    ic.access.remove(access)
                    break
            self.remove_access_from_ic(request, ic)
            self._message = msg.ACCESS_SUCCESSFULLY_REMOVED
            self._added = True
        else:
            for x in ic.sub_folders:
                self.remove_access(request, x)
                if self._added:
                    break
        if not self._added:
            self._message = msg.IC_PATH_NOT_FOUND
        return self._message

    def remove_access_from_ic(self, request, ic=None):
        for sub_f in ic.sub_folders:
            for access in sub_f.access:
                if request['user']['user_id'] in access.to_json()['user']['user_id']:
                    sub_f.access.remove(access)
                    break
            self.remove_access_from_ic(request, sub_f)


    def set_access_for_all_ics(self, user, role, ic=None):
        already_in = False
        for access in ic.access:
            if user['id'] in access.to_json():
                already_in = True
        if not already_in:
            u = {'user_id': user['id'], 'username': user['username'], 'picture': user['picture']}
            a = Access(u, '', '', role)
            ic.access.append(a)
        for x in ic.sub_folders:
            self.set_access_for_all_ics(user, role, x)


    def remove_access_for_all_ics(self, user, role, ic=None):
        already_in = False
        # print(ic.access)
        for access in ic.access:
            # print('9999', access.to_json()['user'])
            # print(user['user_id'])
            if user['user_id'] == access.to_json()['user']['user_id']:
                # print('in')
                ic.access.remove(access)
                break
        for x in ic.sub_folders:
            self.remove_access_for_all_ics(user, role, x)


    def to_json(self):
        return {
            'project_id': self._project_id,
            'project_name': self._name,
            'root_ic': self._root_ic.to_json(),
            'description': self._description,
            'code': self._code,
            'number': self._number,
            'status': self._status,
            'site': self._site.to_json(),
            'building': self._building.to_json()
        }

    @staticmethod
    def json_folders_to_obj(json_file):
        if json_file['is_directory']:
            root = Directory(json_file['ic_id'],
                             json_file['name'],
                             json_file['parent'],
                             [Details.json_to_obj(x) for x in json_file['history']],
                             json_file['path'],
                             json_file['parent_id'],
                             json_file['color'],
                             [Comments.json_to_obj(x) for x in json_file['comments']],
                             [Tags.json_to_obj(x) for x in json_file['tags']],
                             [Project.json_folders_to_obj(x) for x in json_file['sub_folders']],
                             [Access.json_to_obj(x) for x in json_file['access']])
        else:
            root = File(json_file['ic_id'],
                        json_file['name'],
                        json_file['original_name'],
                        json_file['parent'],
                        [Details.json_to_obj(x) for x in json_file['history']],
                        json_file['path'],
                        json_file['type'],
                        json_file['parent_id'],
                        json_file['color'],
                        [Comments.json_to_obj(x) for x in json_file['comments']],
                        [Tags.json_to_obj(x) for x in json_file['tags']],
                        [Project.json_folders_to_obj(x) for x in json_file['sub_folders']],
                        [Access.json_to_obj(x) for x in json_file['access']],
                        json_file['stored_id'],
                        json_file['description'])
            root.project_code = json_file['project_code']
            root.company_code = json_file['company_code']
            root.project_volume_or_system = json_file['project_volume_or_system']
            root.project_level = json_file['project_level']
            root.type_of_information = json_file['type_of_information']
            root.role_code = json_file['role_code']
            root.file_number = json_file['file_number']
            root.status = json_file['status']
            root.revision = json_file['revision']
        return root

    @staticmethod
    def json_to_obj(json_file):
        root = Project.json_folders_to_obj(json_file['root_ic'])
        project = Project(json_file['project_id'], json_file['project_name'], root)
        project.description = json_file['description']
        project.code = json_file['code']
        project.number = json_file['number']
        project.status = json_file['status']
        project.site = Site.json_to_obj(json_file['site'])
        project.building = Building.json_to_obj(json_file['building'])
        return project

    def extract_files(self, ic, files):
        for x in ic.sub_folders:
            if not x.is_directory:
                files.append(x)
            self.extract_files(x, files)

    def find_folder(self, path_id, ic, new_ic_array):
        if ic.ic_id == path_id:
            new_ic_array.append(ic)
        for x in ic.sub_folders:
            if x.ic_id == path_id:
                self._added = True
                new_ic_array.append(x)
            else:
                new_ic_array.append(self.find_folder(path_id, x, new_ic_array))
                # print('++++++', new_ic_array)
                if self._added:
                    break

    def search_by_name(self, name, ic, new_ic_array):
        # print(name, ic.name)
        if name.lower() in ic.name.lower():
            if ic not in new_ic_array:
                new_ic_array.append(ic)
        for x in ic.sub_folders:
            if name.lower() in x.name.lower():
                if ic not in new_ic_array:
                    new_ic_array.append(x)
            self.search_by_name(name, x, new_ic_array)

    def filter_by_access(self, user, ic):
        for x in ic.sub_folders:
            already_in = False
            for access in x.access:
                if user['id'] in access.to_json()['user']['user_id']:
                    already_in = True
                    break
            self.filter_by_access(user, x)
            if not already_in:
                ic.sub_folders.remove(x)
        return self

