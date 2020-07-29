class Project:

    def __init__(self, project_id, name, root_ic):
        self._project_id = project_id
        self._name = name
        self._root_ic = root_ic

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

    def to_json(self):
        return {
            'project_id': self._project_id,
            'project_name': self._name,
            'root_ic': self._root_ic
        }

    @staticmethod
    def json_to_obj(json_file):
        return Project(json_file['project_id'], json_file['project_name'], json_file['root_ic'])
