from .information_container import IC
from .directory import Directory
from .file import File
import app.model.messages as msg


class Project:

    def __init__(self, project_id, name, root_ic):
        self._project_id = project_id
        self._name = name
        self._root_ic = root_ic
        self._added = False
        self._deleted = False
        self._message = ""

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
                print(ic.to_json())
                self._added = True

        return self, self._added

    def rename_ic(self, request_data, ic=None):
        if ic.parent == request_data['path']:
            name = ic.name
            #path = request_data['path']
            parent = request_data['path'] #[:path.rfind("/")]
            new_name = request_data['new_name']
            if not ic.is_directory:
                name = ic.name + ic.type
            if name == request_data['old_name']:
                ic.name = new_name
                ic.path = parent + '/' + request_data['new_name']
                # ic.parent = parent # no need?
                self._message = msg.IC_SUCCESSFULLY_RENAMED
                self._added = True
        else:
            if ic.sub_folders:
                for x in ic.sub_folders:
                    self.rename_ic(request_data, x)
                    if self._added:
                        break
        if not self._added:
            self._message = msg.IC_PATH_NOT_FOUND
        return self._message

    def delete_ic(self, request_data, ic=None):
        if ic.path == request_data['parent_path']:
            for y in ic.sub_folders:
                if y.name == request_data["delete_name"]:
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
        if ic.is_directory:
            print(ic.ic_id)
            print(ic_new)
            new_path = ic_new.parent
            if not ic_new.is_directory:
                new_path = '/'.join(ic_new.path.split('/')[:-1])
            if ic.path == new_path:
                already_exists = False
                for sub_f in ic.sub_folders:
                    if sub_f.name == ic_new.name:
                        already_exists = True
                        self._message = msg.IC_ALREADY_EXISTS
                if not already_exists:
                    ic_new.par_id = ic.ic_id
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
        return self._message

    def to_json(self):
        return {
            'project_id': self._project_id,
            'project_name': self._name,
            'root_ic': self._root_ic.to_json()
        }

    @staticmethod
    def json_folders_to_obj(json_file):
        if json_file['is_directory']:
            root = Directory(json_file['ic_id'],
                             json_file['name'],
                             json_file['parent'],
                             json_file['history'],
                             json_file['path'],
                             json_file['parent_id'],
                             [Project.json_folders_to_obj(x) for x in json_file['sub_folders']])
        else:
            root = File(json_file['ic_id'],
                        json_file['name'],
                        json_file['original_name'],
                        json_file['parent'],
                        json_file['history'],
                        json_file['path'],
                        json_file['type'],
                        json_file['parent_id'],
                        json_file['sub_folders'],
                        json_file['stored_id'],
                        json_file['description'])
        return root

    @staticmethod
    def json_to_obj(json_file):
        root = Project.json_folders_to_obj(json_file['root_ic'])

        return Project(json_file['project_id'], json_file['project_name'], root)
