from .information_container import IC


class File(IC):

    def __init__(self, file_id, name, original_name, directory, file_history, path, type, parent_id, color, sub_folders, stored_id="", description=''):
        super().__init__(file_id, name, directory, file_history, path, parent_id, color, sub_folders)
        self._original_name = original_name
        self._type = type
        self._stored_id = stored_id
        self._description = description
        self._is_directory = False
        self._project_code = ""
        self._company_code = ""
        self._project_volume_or_system = ""
        self._project_level = ""
        self._type_of_information = ""
        self._role_code = ""
        self._file_number = ""
        self._status = ""
        self._revision = ""
        self._overlay_type = "ic"

    @property
    def original_name(self):
        return self._original_name

    @original_name.setter
    def original_name(self, value):
        self._original_name = value

    @property
    def type(self):
        return self._type

    @type.setter
    def type(self, value):
        self._type = value

    @property
    def stored_id(self):
        return self._stored_id

    @stored_id.setter
    def stored_id(self, value):
        self._stored_id = value

    @property
    def description(self):
        return self._description

    @description.setter
    def description(self, value):
        self._description = value

    @property
    def project_code(self):
        return self._project_code

    @project_code.setter
    def project_code(self, value):
        self._project_code = value

    @property
    def company_code(self):
        return self._company_code

    @company_code.setter
    def company_code(self, value):
        self._company_code = value

    @property
    def project_volume_or_system(self):
        return self._project_volume_or_system

    @project_volume_or_system.setter
    def project_volume_or_system(self, value):
        self._project_volume_or_system = value

    @property
    def project_level(self):
        return self._project_level

    @project_level.setter
    def project_level(self, value):
        self._project_level = value

    @property
    def type_of_information(self):
        return self._type_of_information

    @type_of_information.setter
    def type_of_information(self, value):
        self._type_of_information = value

    @property
    def role_code(self):
        return self._role_code

    @role_code.setter
    def role_code(self, value):
        self._role_code = value

    @property
    def file_number(self):
        return self._file_number

    @file_number.setter
    def file_number(self, value):
        self._file_number = value

    @property
    def status(self):
        return self._status

    @status.setter
    def status(self, value):
        self._status = value

    @property
    def revision(self):
        return self._revision

    @revision.setter
    def revision(self, value):
        self._revision = value

    @property
    def overlay_type(self):
        return self._overlay_type

    def to_json(self):
        return {
            'ic_id': self._ic_id,
            'name': self._name,
            'original_name': self._original_name,
            'parent': self._parent,
            'history': self._history,
            'path': self._path,
            'type': self._type,
            'parent_id': self._parent_id,
            'color': self._color,
            'overlay_type': self._overlay_type,
            'sub_folders': [x.to_json() for x in self._sub_folders],
            'stored_id': self._stored_id,
            'description': self._description,
            'is_directory': self._is_directory,
            'project_code': self._project_code,
            'company_code': self._company_code,
            'project_volume_or_system': self._project_volume_or_system,
            'project_level': self._project_level,
            'type_of_information': self._type_of_information,
            'role_code': self._role_code,
            'file_number': self._file_number,
            'status': self._status,
            'revision': self._revision,
            'overlay_type': self._overlay_type,
        }

    @staticmethod
    def json_to_obj(json_file):
        file = File(json_file['ic_id'],
                    json_file['name'],
                    json_file['original_name'],
                    json_file['history'],
                    json_file['path'],
                    json_file['type'],
                    json_file['parent'],
                    json_file['parent_id'],
                    json_file['color'],
                    json_file['sub_folders'],
                    json_file['stored_id'],
                    json_file['description'],
                    )
        file.project_code = json_file['project_code']
        file.company_code = json_file['company_code']
        file.project_volume_or_system = json_file['project_volume_or_system']
        file.project_level = json_file['project_level']
        file.type_of_information = json_file['type_of_information']
        file.role_code = json_file['role_code']
        file.file_number = json_file['file_number']
        file.status = json_file['status']
        file.revision = json_file['revision']
        return file


