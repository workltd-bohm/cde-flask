from .information_container import IC
from .directory import Directory
from .file import File


class Project:

    def __init__(self, project_id, name, root_ic):
        self._project_id = project_id
        self._name = name
        self._root_ic = root_ic
        self._replaced = False

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
                if self._replaced:
                    break
        else:
            if ic.name == file.name and ic.type == file.type:
                ic.stored_id = file.stored_id
                print(ic.to_json())
                self._replaced = True

        return self, self._replaced

    def add_ic(self, ic_new, ic=None):
        if ic.is_directory:
            if ic.path == ic_new.parent:
                ic.sub_folders.append(ic_new)
                self._replaced = True
            else:
                for x in ic.sub_folders:
                    self.add_ic(ic_new, x)
                    if self._replaced:
                        break
        return self._replaced

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
                             [Project.json_folders_to_obj(x) for x in json_file['sub_folders']])
        else:
            root = File(json_file['ic_id'],
                        json_file['name'],
                        json_file['parent'],
                        json_file['history'],
                        json_file['path'],
                        json_file['type'],
                        json_file['stored_id'],
                        json_file['description'])
        return root

    @staticmethod
    def json_to_obj(json_file):
        root = Project.json_folders_to_obj(json_file['root_ic'])

        return Project(json_file['project_id'], json_file['project_name'], root)
