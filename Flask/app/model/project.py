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

    def change_color(self, request_data, ic=None):
        if ic.ic_id == request_data['ic_id']:
            print(ic.color, request_data)
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

    def rename_ic(self, request_data, ic=None):
        if ic.ic_id == request_data['parent_id']:
            for y in ic.sub_folders:
                name = y.name
                #path = request_data['path']
                parent = request_data['path'] #[:path.rfind("/")]
                new_name = request_data['new_name']
                if not y.is_directory:
                    name = y.name   + y.type
                    new_name = '.'.join(new_name.split('.')[:-1])
                if name == request_data['old_name']:
                    y.name = new_name
                    y.path = parent + '/' + request_data['new_name']
                    # ic.parent = parent # no need?
                    self._message = msg.IC_SUCCESSFULLY_RENAMED
                    self._added = True
                    break
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
        if ic.ic_id == request_data['parent_id']:
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

    def find_ic(self, s_project, file_name, ic=None):
        if ic.ic_id == s_project['position']['parent_id']:
            for sub_f in ic.sub_folders:
                if sub_f.name+sub_f.type == file_name:
                    self._current_ic = ic
                    self._added = True
                    break
        else:
            for x in ic.sub_folders:
                self.find_ic(s_project, file_name, x)
                if self._added:
                    break
        return self._current_ic

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
                             json_file['color'],
                             json_file['time_uploaded'],
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
                        json_file['color'],
                        json_file['time_uploaded'],
                        [Project.json_folders_to_obj(x) for x in json_file['sub_folders']],
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

        return Project(json_file['project_id'], json_file['project_name'], root)

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


    #
    # def add_ic_old(self, ic_new, ic=None):
    #     if ic.is_directory:
    #         print(ic.ic_id)
    #         print(ic_new.parent_id)
    #         new_path = ic_new.parent
    #         if not ic_new.is_directory:
    #             new_path = '/'.join(ic_new.path.split('/')[:-1])
    #         if ic.path == new_path:
    #             already_exists = False
    #             for sub_f in ic.sub_folders:
    #                 if sub_f.name == ic_new.name:
    #                     already_exists = True
    #                     self._added = True
    #                     self._message = msg.IC_ALREADY_EXISTS
    #             if not already_exists:
    #                 ic_new.parent_id = ic.ic_id
    #                 ic.sub_folders.append(ic_new)
    #                 self._message = msg.IC_SUCCESSFULLY_ADDED
    #             self._added = True
    #         else:
    #             for x in ic.sub_folders:
    #                 self.add_ic(ic_new, x)
    #                 if self._added:
    #                     break
    #     if not self._added:
    #         self._message = msg.IC_PATH_NOT_FOUND
    #     return self._message